import { GoogleGenAI } from '@google/genai';
import {
  BudgetCategory,
  DayScheduleItem,
  EventIdea,
  EventPlan,
  EventRisk,
  EventType,
  PrepTask,
  VendorItem,
  WhatIfSimulationResult
} from '../types';

// Reads GEMINI_API_KEY (and GOOGLE_GEMINI_BASE_URL on Netlify AI Gateway) from the environment
const ai = new GoogleGenAI({});
const PRIMARY_MODEL = 'gemini-3.8-flash';

// Timeout wrapper for external AI calls to guarantee responsiveness
function withTimeout<T>(
  promise: Promise<T>,
  ms: number = process.env.NODE_ENV === 'test' ? 1500 : 7000
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`AI generation timed out after ${ms}ms`)), ms))
  ]);
}

// Bounded exponential retry helper for transient network and rate-limit errors
export async function executeWithRetry<T>(
  fn: () => Promise<T>,
  retries: number = process.env.NODE_ENV === 'test' ? 1 : 2,
  baseDelayMs: number = process.env.NODE_ENV === 'test' ? 10 : 200
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err: any) {
      attempt++;
      if (attempt > retries) throw err;
      const msg = err?.message?.toLowerCase() || '';
      const isTransient =
        msg.includes('429') ||
        msg.includes('503') ||
        msg.includes('quota') ||
        msg.includes('timeout') ||
        msg.includes('fetch failed');
      if (!isTransient) throw err;
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

// In-memory TTL cache for safe non-personal, reusable outputs (generic ideas, risk baselines)
export class NonPersonalTtlCache {
  private cache = new Map<string, { value: any; expiry: number }>();

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number = 10 * 60 * 1000): void {
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, { value, expiry: Date.now() + ttlMs });
  }

  clear(): void {
    this.cache.clear();
  }
}

export const staticAiCache = new NonPersonalTtlCache();

// Helper to calculate realistic milestone dates before event
export function calculateMilestoneDates(eventDateStr: string, relativeDaysBefore: number[]): string[] {
  const eventDate = new Date(eventDateStr);
  const now = new Date();
  const diffDays = Math.max(1, Math.round((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  return relativeDaysBefore.map((daysRatio) => {
    // scale daysRatio relative to total remaining days
    const daysOffset = Math.min(Math.round((daysRatio / 180) * diffDays), Math.max(0, diffDays - 1));
    const targetDate = new Date(eventDate.getTime() - daysOffset * 24 * 60 * 60 * 1000);
    return targetDate.toISOString().split('T')[0];
  });
}

// Clean JSON response from Gemini
function extractJsonFromText(rawText: string): any {
  let cleaned = rawText.trim();
  // Strip ```json and ```
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned);
}

// Deterministic budget allocation baseline based on event type & budget
export function generateDeterministicBudgetCategories(
  totalBudget: number,
  eventType: EventType
): BudgetCategory[] {
  let weights: Record<string, { pct: number; color: string; notes: string }>;

  if (eventType === 'wedding') {
    weights = {
      'Venue & Space': { pct: 0.28, color: '#4F46E5', notes: 'Main hall, bridal suite, setup' },
      'Catering & Food': { pct: 0.32, color: '#EC4899', notes: 'Buffet/sit-down, welcome drinks, desserts' },
      'Decoration & Florals': { pct: 0.14, color: '#8B5CF6', notes: 'Stage, entrance mandap, floral decor' },
      'Photography & Video': { pct: 0.10, color: '#3B82F6', notes: 'Candid photo, cinematic film, albums' },
      'Entertainment & Music': { pct: 0.05, color: '#10B981', notes: 'DJ, sound, live instrumentalists' },
      'Attire & Styling': { pct: 0.04, color: '#F59E0B', notes: 'Outfits, bridal makeup, hair' },
      'Invitations & Gifts': { pct: 0.02, color: '#06B6D4', notes: 'E-invites, physical cards, return favors' },
      'Emergency Reserve': { pct: 0.05, color: '#64748B', notes: 'Contingency fund for unexpected costs' }
    };
  } else if (eventType === 'birthday') {
    weights = {
      'Venue / Party Hall': { pct: 0.25, color: '#4F46E5', notes: 'Space rental, seating arrangements' },
      'Food & Beverages': { pct: 0.35, color: '#EC4899', notes: 'Cake, snacks, dinner, beverages' },
      'Theme Decor & Balloons': { pct: 0.15, color: '#8B5CF6', notes: 'Backdrop, balloon arch, props' },
      'Entertainment & Games': { pct: 0.12, color: '#10B981', notes: 'Magician, host/emcee, music' },
      'Photography': { pct: 0.06, color: '#3B82F6', notes: 'Event coverage and portraits' },
      'Return Gifts / Favors': { pct: 0.03, color: '#F59E0B', notes: 'Gift hampers for attendees' },
      'Emergency Reserve': { pct: 0.04, color: '#64748B', notes: 'Contingency reserve' }
    };
  } else if (eventType === 'community') {
    weights = {
      'Venue & Staging': { pct: 0.25, color: '#4F46E5', notes: 'Ground rental, stage, podium, barricades' },
      'Sound, Lights & AV': { pct: 0.22, color: '#10B981', notes: 'PA system, microphones, spotlights, screen' },
      'Community Catering': { pct: 0.25, color: '#EC4899', notes: 'Prasad, community meals, water stations' },
      'Decoration & Ambience': { pct: 0.12, color: '#8B5CF6', notes: 'Banners, lighting, cultural props' },
      'Security & Logistics': { pct: 0.08, color: '#F59E0B', notes: 'First aid, volunteers kit, crowd control' },
      'Permissions & Contingency': { pct: 0.08, color: '#64748B', notes: 'Municipal fees, backup generator' }
    };
  } else {
    weights = {
      'Venue & Facilities': { pct: 0.30, color: '#4F46E5', notes: 'Space hire and foundational amenities' },
      'Food & Refreshments': { pct: 0.30, color: '#EC4899', notes: 'Meals, refreshments, service' },
      'Decoration & Setup': { pct: 0.15, color: '#8B5CF6', notes: 'Thematic decor and styling' },
      'Photography & Media': { pct: 0.10, color: '#3B82F6', notes: 'Photo/video capture' },
      'Logistics & Sound': { pct: 0.08, color: '#10B981', notes: 'Audio-visual and transport' },
      'Emergency Reserve': { pct: 0.07, color: '#64748B', notes: 'Buffer for last-minute needs' }
    };
  }

  const roundedTotal = Math.max(0, Math.round(totalBudget));
  const entries = Object.entries(weights);

  if (roundedTotal === 0) {
    return entries.map(([name, meta], index) => ({
      id: `cat-${index + 1}`,
      name,
      allocatedAmount: 0,
      actualAmount: 0,
      percentage: 0,
      notes: meta.notes,
      color: meta.color
    }));
  }

  // Exact-sum allocation using Largest Remainder Method (Hamilton's / Hare-Niemeyer method).
  // Guarantees sum of allocations strictly matches roundedTotal for any integer budget (small, large, or irregular).
  const unrounded = entries.map(([name, meta], index) => {
    const rawAmount = roundedTotal * meta.pct;
    const floorAmount = Math.floor(rawAmount);
    const remainder = rawAmount - floorAmount;
    return { name, meta, index, floorAmount, remainder };
  });

  const floorSum = unrounded.reduce((sum, item) => sum + item.floorAmount, 0);
  const remainderDiff = roundedTotal - floorSum;

  // Sort by remainder descending, tie-breaking by initial index for deterministic consistency
  const sortedByRemainder = [...unrounded].sort((a, b) => {
    if (b.remainder !== a.remainder) return b.remainder - a.remainder;
    return a.index - b.index;
  });

  const allocations = new Map<number, number>();
  unrounded.forEach((item) => allocations.set(item.index, item.floorAmount));

  // Distribute the exact integer delta to the highest remainder categories
  for (let i = 0; i < remainderDiff; i++) {
    const target = sortedByRemainder[i % sortedByRemainder.length];
    allocations.set(target.index, (allocations.get(target.index) || 0) + 1);
  }

  const categories: BudgetCategory[] = unrounded.map((item) => {
    const amount = allocations.get(item.index) || 0;
    const actualPct = Number(((amount / roundedTotal) * 100).toFixed(1));
    return {
      id: `cat-${item.index + 1}`,
      name: item.name,
      allocatedAmount: amount,
      actualAmount: 0,
      percentage: actualPct,
      notes: item.meta.notes,
      color: item.meta.color
    };
  });

  return categories;
}

// Generate Realistic Preparation Tasks
export function generateDeterministicTasks(eventDate: string, eventType: string): PrepTask[] {
  const milestoneDates = calculateMilestoneDates(eventDate, [150, 120, 90, 60, 45, 30, 14, 7, 3, 1]);

  return [
    {
      id: 'task-1',
      title: 'Finalize Guest List and RSVP tracking sheet',
      category: 'Coordination',
      priority: 'High',
      dueDate: milestoneDates[0],
      completed: false,
      notes: 'Ensure dietary needs and family groupings are noted.'
    },
    {
      id: 'task-2',
      title: 'Shortlist and book Primary Venue',
      category: 'Venue',
      priority: 'High',
      dueDate: milestoneDates[1],
      completed: false,
      notes: 'Confirm curfew hours, parking capacity, and catering exclusivity.'
    },
    {
      id: 'task-3',
      title: 'Contract Catering Team & Schedule Menu Tasting',
      category: 'Catering',
      priority: 'High',
      dueDate: milestoneDates[2],
      completed: false,
      notes: 'Lock in live counters, authentic specialty items, and service staff.'
    },
    {
      id: 'task-4',
      title: 'Book Lead Photographer and Cinematic Videographer',
      category: 'Media',
      priority: 'Medium',
      dueDate: milestoneDates[3],
      completed: false,
      notes: 'Review sample wedding/event albums and agree on turnaround timeline.'
    },
    {
      id: 'task-5',
      title: 'Finalize Decoration Theme and Stage Mandap Design',
      category: 'Decoration',
      priority: 'Medium',
      dueDate: milestoneDates[4],
      completed: false,
      notes: 'Discuss lighting warmth, fresh seasonal flowers, and photo-op backdrops.'
    },
    {
      id: 'task-6',
      title: 'Dispatch Digital & Physical Invitations',
      category: 'Invitations',
      priority: 'Medium',
      dueDate: milestoneDates[5],
      completed: false,
      notes: 'Include Google Maps QR code, schedule outline, and dress code.'
    },
    {
      id: 'task-7',
      title: 'Confirm Sound, DJ, Playlists & Cultural Performers',
      category: 'Entertainment',
      priority: 'Low',
      dueDate: milestoneDates[6],
      completed: false,
      notes: 'Share list of must-play songs and timeline cues.'
    },
    {
      id: 'task-8',
      title: 'Final Headcount & Table/Seating Allocation Confirmation',
      category: 'Coordination',
      priority: 'High',
      dueDate: milestoneDates[7],
      completed: false,
      notes: 'Communicate final plate count to caterer (with 5% buffer).'
    },
    {
      id: 'task-9',
      title: 'Vendor Balance Settlement & Logistics Dry Run',
      category: 'Finance',
      priority: 'High',
      dueDate: milestoneDates[8],
      completed: false,
      notes: 'Prepare cash envelopes or instant UPI for day-of vendor gratuities.'
    },
    {
      id: 'task-10',
      title: 'Assemble Emergency Event Kit & Confirm Point Persons',
      category: 'Logistics',
      priority: 'Medium',
      dueDate: milestoneDates[9],
      completed: false,
      notes: 'Include safety pins, portable chargers, sewing kit, first aid, and vendor contact sheet.'
    }
  ];
}

// Generate Realistic Day Schedule
export function generateDeterministicDaySchedule(eventType: string): DayScheduleItem[] {
  if (eventType === 'wedding') {
    return [
      { id: 'sch-1', time: '07:30 AM', activity: 'Bridal & Groom Makeup / Dressing Setup', location: 'Bridal Suite', responsiblePerson: 'Makeup Artist' },
      { id: 'sch-2', time: '09:30 AM', activity: 'Venue Access & Decorator Final Inspection', location: 'Main Banquet Hall', responsiblePerson: 'Event Lead' },
      { id: 'sch-3', time: '11:00 AM', activity: 'Pre-Ceremony Couple & Family Portrait Session', location: 'Lawn / Portrait Backdrop', responsiblePerson: 'Lead Photographer' },
      { id: 'sch-4', time: '01:00 PM', activity: 'Welcome Drinks & Guest Arrival', location: 'Reception Foyer', responsiblePerson: 'Hospitality Team' },
      { id: 'sch-5', time: '02:00 PM', activity: 'Main Ceremony & Cultural Rituals', location: 'Central Stage / Mandap', responsiblePerson: 'Ceremony Lead' },
      { id: 'sch-6', time: '04:30 PM', activity: 'Grand Feast & Live Food Stations Open', location: 'Dining Pavilion', responsiblePerson: 'Head Chef' },
      { id: 'sch-7', time: '06:30 PM', activity: 'Toast, Cake Cutting & Speeches', location: 'Stage', responsiblePerson: 'Emcee' },
      { id: 'sch-8', time: '07:30 PM', activity: 'Musical Performances & Dance Floor', location: 'Main Stage', responsiblePerson: 'DJ / Sound Engineer' },
      { id: 'sch-9', time: '10:00 PM', activity: 'Farewell Send-off & Return Favor Distribution', location: 'Exit Lounge', responsiblePerson: 'Family Representative' }
    ];
  } else if (eventType === 'birthday') {
    return [
      { id: 'sch-1', time: '03:00 PM', activity: 'Venue Access & Balloon Arch/Theme Decor Setup', location: 'Party Area', responsiblePerson: 'Decorator' },
      { id: 'sch-2', time: '04:30 PM', activity: 'Sound & Music Check, Photo Corner Prep', location: 'Activity Floor', responsiblePerson: 'Sound Host' },
      { id: 'sch-3', time: '05:00 PM', activity: 'Guest Arrival, Welcome Mocktails & Fun Photo Booth', location: 'Foyer', responsiblePerson: 'Welcome Host' },
      { id: 'sch-4', time: '05:45 PM', activity: 'Interactive Games, Magic Show & Activities', location: 'Center Area', responsiblePerson: 'Emcee' },
      { id: 'sch-5', time: '07:00 PM', activity: 'Cake Cutting Ceremony & Birthday Song', location: 'Main Backdrop', responsiblePerson: 'Family & Friends' },
      { id: 'sch-6', time: '07:30 PM', activity: 'Buffet Dinner & Dessert Station', location: 'Dining Area', responsiblePerson: 'Caterer' },
      { id: 'sch-7', time: '09:00 PM', activity: 'Return Gift Hampers Distribution & Goodbyes', location: 'Exit Lounge', responsiblePerson: 'Host' }
    ];
  } else {
    return [
      { id: 'sch-1', time: '08:00 AM', activity: 'Stage & Audio-Visual Rigging and Sound Checks', location: 'Auditorium / Ground', responsiblePerson: 'Tech Lead' },
      { id: 'sch-2', time: '09:30 AM', activity: 'Volunteer Briefing & Registration Desk Open', location: 'Entry Gate', responsiblePerson: 'Volunteer Lead' },
      { id: 'sch-3', time: '10:30 AM', activity: 'Inauguration, Welcome Address & Keynote', location: 'Main Stage', responsiblePerson: 'Organizing Secretary' },
      { id: 'sch-4', time: '01:00 PM', activity: 'Community Lunch & Networking Break', location: 'Community Dining', responsiblePerson: 'Food Coordinator' },
      { id: 'sch-5', time: '02:30 PM', activity: 'Cultural Performances & Talent Showcase', location: 'Main Stage', responsiblePerson: 'Cultural Secretary' },
      { id: 'sch-6', time: '05:30 PM', activity: 'Award Recognition & Vote of Thanks', location: 'Stage', responsiblePerson: 'President' },
      { id: 'sch-7', time: '06:30 PM', activity: 'Venue Clean-up & Equipment Breakdown', location: 'Entire Premises', responsiblePerson: 'Logistics Team' }
    ];
  }
}

// Generate Realistic Vendors
export function generateDeterministicVendors(
  categories: BudgetCategory[],
  city: string,
  eventType: string
): VendorItem[] {
  const vendors: VendorItem[] = [];

  categories.forEach((cat, index) => {
    if (cat.name.includes('Reserve') || cat.name.includes('Contingency')) return;

    let vendorName = '';
    let category = '';

    if (cat.name.includes('Venue')) {
      category = 'Venue';
      vendorName = `${city} Grand Banquet & Lawn`;
    } else if (cat.name.includes('Cater') || cat.name.includes('Food')) {
      category = 'Catering';
      vendorName = `Royal Gourmet Catering Services`;
    } else if (cat.name.includes('Decor') || cat.name.includes('Flor')) {
      category = 'Decoration';
      vendorName = `Elegance Floral & Staging Studio`;
    } else if (cat.name.includes('Photo') || cat.name.includes('Media')) {
      category = 'Photography';
      vendorName = `Moments Captured Photography`;
    } else if (cat.name.includes('Entertain') || cat.name.includes('Sound') || cat.name.includes('Music')) {
      category = 'Entertainment';
      vendorName = `Vibe Beats Sound & DJ Production`;
    } else if (cat.name.includes('Attire') || cat.name.includes('Styl')) {
      category = 'Makeup and Styling';
      vendorName = `Glamour Artistry Makeover`;
    } else if (cat.name.includes('Invite')) {
      category = 'Invitation Printing';
      vendorName = `Artisan Press & Digital Cards`;
    } else {
      category = 'Event Equipment';
      vendorName = `${city} Event Support Solutions`;
    }

    vendors.push({
      id: `vnd-${index + 1}`,
      name: vendorName,
      category,
      contactName: `Manager`,
      phone: `+91 98300 ${10000 + index * 123}`,
      email: `contact@${category.toLowerCase().replace(/\s+/g, '')}hub.in`,
      estimatedPrice: cat.allocatedAmount,
      agreedPrice: cat.allocatedAmount,
      paymentStatus: 'Unpaid',
      bookingStatus: 'Researching',
      notes: `Includes initial inquiry for ${eventType}. Check license, cancellation policies, and setup timing.`,
      deadline: 'Book at least 45 days in advance'
    });
  });

  return vendors;
}

// Generate Curated Cultural Ideas
export function generateDeterministicIdeas(
  eventType: string,
  culture?: string,
  theme?: string,
  city?: string
): EventIdea[] {
  const isBengali = culture?.toLowerCase().includes('bengali') || city?.toLowerCase().includes('kolkata');

  if (isBengali && eventType === 'wedding') {
    return [
      {
        id: 'idea-1',
        title: 'Authentic Shehnai & Dhak Welcome Entrance',
        category: 'Entertainment',
        description: 'Traditional Bengali welcome featuring rhythmic Dhaki beats and soulful Shehnai melodies greeting guests as they arrive with sandalwood chandan tilak.',
        estimatedCostRange: '₹12,000 - ₹25,000',
        suitability: 'Traditional Bengali Wedding',
        implementationTips: [
          'Arrange traditional brass thaalis with Chandan and rosewater spray at the main gate.',
          'Schedule Dhakis for the Gaye Holud and Bor Jatri entry.'
        ]
      },
      {
        id: 'idea-2',
        title: 'Rajbari-Inspired Shola & Terracotta Floral Mandap',
        category: 'Decoration',
        description: 'Heritage decor inspired by classic Kolkata Rajbaris with white Sholapith crafts, terracotta pots, hanging brass bells, and fragrant tuberose (Rajnigandha) garlands.',
        estimatedCostRange: '₹45,000 - ₹85,000',
        suitability: 'Indoor or Courtyard Wedding Mandap',
        implementationTips: [
          'Use warm amber uplighting (2700K) to highlight intricate Shola carvings.',
          'Incorporate fresh marigolds and bel-pata accents.'
        ]
      },
      {
        id: 'idea-3',
        title: 'Heritage Bengali Bhoj Menu with Live Fish & Sweet Counters',
        category: 'Menu',
        description: 'A traditional feast including Radhaballabhi with Chholar Dal, Bhetki Paturi steamed in banana leaf, Kosha Mangsho, followed by live Nolen Gur Sandesh and Mishti Doi counters.',
        estimatedCostRange: '₹1,200 - ₹1,800 per plate',
        suitability: 'Bengali Reception & Dinner',
        implementationTips: [
          'Offer vegetarian delicacies like Dhokar Dalna and Chanar Dalna for non-meat guests.',
          'Serve in eco-friendly clay kulla and sal-leaf plates for authentic charm.'
        ]
      },
      {
        id: 'idea-4',
        title: 'Handcrafted Kantha Stitch / Dokra Return Favors',
        category: 'Return Gifts',
        description: 'Exquisite personalized gift boxes containing authentic Bengal Kantha stitch scarves, miniature Dokra artifacts, and traditional artisanal confectionery.',
        estimatedCostRange: '₹250 - ₹500 per gift',
        suitability: 'All Wedding Guests',
        implementationTips: [
          'Source directly from local Bengal artisans to support sustainable heritage crafts.',
          'Include a custom calligraphed thank-you note.'
        ]
      }
    ];
  }

  return [
    {
      id: 'idea-1',
      title: 'Minimalist Botanical Canopy & Fairy Light Tunnel',
      category: 'Decoration',
      description: 'Earthy elegance featuring cascading eucalyptus, white lilies, and warm filament fairy-lights creating an enchanting, Instagram-worthy celebration vibe.',
      estimatedCostRange: '₹30,000 - ₹60,000',
      suitability: 'Modern Evening Celebration',
      implementationTips: [
        'Place photogenic neon monogram signage at the entrance.',
        'Use reusable fabric drapes to minimize single-use waste.'
      ]
    },
    {
      id: 'idea-2',
      title: 'Interactive Live Chef Counters & Regional Tasting Stations',
      category: 'Menu',
      description: 'Engage guests with dynamic food stalls: artisanal chaat bar, woodfired artisanal breads, live stir-fry wok, and customized mocktail mixology.',
      estimatedCostRange: '₹800 - ₹1,400 per guest',
      suitability: 'Cocktail / Reception / Milestone Parties',
      implementationTips: [
        'Ensure quick turnaround times to avoid queues during peak dinner hours.',
        'Clearly label vegan, gluten-free, and nut-allergen options.'
      ]
    },
    {
      id: 'idea-3',
      title: 'Acoustic Fusion Band & Nostalgia Audio Guestbook',
      category: 'Entertainment',
      description: 'An acoustic musical ensemble blending contemporary pop with timeless melodies, complemented by a vintage telephone where guests record spoken voice messages.',
      estimatedCostRange: '₹20,000 - ₹45,000',
      suitability: 'Intimate to Grand Celebrations',
      implementationTips: [
        'Set up the audio guestbook in a quiet corner with clear signage.',
        'Download raw audio files post-event as a keepsake.'
      ]
    },
    {
      id: 'idea-4',
      title: 'Eco-Conscious Seed Favors & Handcrafted Soy Candles',
      category: 'Sustainable Planning',
      description: 'Thoughtful return gifts: plantable seed paper bookmarks, native flowering plant saplings, and artisanal soy candles in reusable clay pots.',
      estimatedCostRange: '₹150 - ₹350 per gift',
      suitability: 'Eco-conscious hosts and guests',
      implementationTips: [
        'Include simple planting instructions printed with vegetable inks.',
        'Eliminate plastic wrap in favor of jute or recycled paper bags.'
      ]
    }
  ];
}

// Generate Realistic Risks
export function generateDeterministicRisks(
  indoorOutdoor: string,
  daysUntilEvent: number,
  totalBudget: number
): EventRisk[] {
  const risks: EventRisk[] = [];

  if (indoorOutdoor === 'Outdoor' || indoorOutdoor === 'Hybrid') {
    risks.push({
      id: 'risk-1',
      description: 'Open-Air Weather & Precipitation Vulnerability',
      severity: 'High',
      reason: 'Outdoor event setup without rainproof marquee can ruin decor, sound equipment, and guest comfort.',
      recommendedAction: 'Contract venue with a built-in indoor hall backup or confirm German pagoda waterproof tenting with side-walls.',
      deadline: 'Finalize 30 days prior to event'
    });
  }

  risks.push({
    id: 'risk-2',
    description: 'Catering Headcount Inflation & Food Wastage',
    severity: 'Medium',
    reason: 'Guest RSVP attrition typically fluctuates between +10% to -15%, risking under-catering or paying for surplus plates.',
    recommendedAction: 'Institute mandatory RSVP confirmation 7 days prior. Commit 90% guaranteed plate count with a 10% on-demand buffer.',
    deadline: '7 days before event'
  });

  risks.push({
    id: 'risk-3',
    description: 'Vendor Timing Delays & Sound Curfew Compliance',
    severity: 'High',
    reason: 'Municipal regulations strictly enforce 10:00 PM loudspeaker curfews in many urban banquet zones.',
    recommendedAction: 'Schedule core musical and stage segments between 6:30 PM - 9:30 PM. Verify local police sound permissions in advance.',
    deadline: '14 days before event'
  });

  risks.push({
    id: 'risk-4',
    description: 'Emergency Reserve Depletion from Hidden Miscellaneous Fees',
    severity: 'Medium',
    reason: 'Unforeseen costs such as generator diesel, corkage fees, valet tips, and venue overtime surcharges.',
    recommendedAction: 'Keep minimum 5% to 8% (₹' + Math.round(totalBudget * 0.05).toLocaleString('en-IN') + ') untouched in reserve fund.',
    deadline: 'Ongoing throughout planning'
  });

  return risks;
}

export class GeminiService {
  public ai: GoogleGenAI;

  constructor(customAi?: GoogleGenAI) {
    this.ai = customAi || ai;
  }

  // 1. Full Event Plan Generation
  async generateCompletePlan(params: {
    name: string;
    type: EventType;
    date: string;
    city: string;
    guests: number;
    totalBudget: number;
    currency?: string;
    durationHours?: number;
    language?: string;
    indoorOutdoor: 'Indoor' | 'Outdoor' | 'Hybrid';
    theme?: string;
    culturalTradition?: string;
    foodPreference?: string;
    decorationStyle?: string;
    entertainmentPreference?: string;
    accessibilityRequirements?: string;
    topPriorities?: string[];
    userPrompt?: string;
  }): Promise<EventPlan> {
    const deterministicCategories = generateDeterministicBudgetCategories(params.totalBudget, params.type);
    const deterministicTasks = generateDeterministicTasks(params.date, params.type);
    const deterministicSchedule = generateDeterministicDaySchedule(params.type);
    const deterministicVendors = generateDeterministicVendors(deterministicCategories, params.city, params.type);
    const deterministicIdeas = generateDeterministicIdeas(params.type, params.culturalTradition, params.theme, params.city);
    const now = new Date();
    const eventDate = new Date(params.date);
    const diffDays = Math.max(1, Math.round((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const deterministicRisks = generateDeterministicRisks(params.indoorOutdoor, diffDays, params.totalBudget);

    // Call Gemini to enrich the plan with custom nuances, cultural insights, and overview
    let aiSummary = `A masterfully planned ${params.type} celebration in ${params.city} designed for ${params.guests} guests with a budget of ₹${params.totalBudget.toLocaleString('en-IN')}. ${params.culturalTradition ? `Infused with rich ${params.culturalTradition} heritage, ` : ''}${params.theme ? `featuring an elegant ${params.theme} motif.` : 'crafted with premium attention to hospitality and celebration.'}`;
    let aiContingency = [
      'Maintain an on-site contact sheet for all vendor leads.',
      'Designate an authorized family member for on-the-spot vendor payments.',
      'Keep backup portable power banks and extension cables at the control desk.',
      'Confirm venue generator diesel fuel tank is full prior to start.'
    ];

    try {
      const prompt = `You are Planora AI, an elite event planner and cultural expert.
Create a rich, sophisticated plan for:
Event: ${params.name}
Type: ${params.type}
Date: ${params.date}
Location: ${params.city}
Guests: ${params.guests}
Budget: ₹${params.totalBudget} INR
Setting: ${params.indoorOutdoor}
Cultural Tradition: ${params.culturalTradition || 'Contemporary'}
Theme: ${params.theme || 'Elegant celebration'}
Food Preferences: ${params.foodPreference || 'Authentic regional & continental'}
Special Notes: ${params.userPrompt || 'None'}

Return ONLY a valid JSON object matching this schema:
{
  "overviewSummary": "A 2-3 paragraph inspiring, sophisticated, detailed narrative of how the celebration will unfold, highlighting cultural touches, guest experience, and aesthetic vision.",
  "contingencySuggestions": [
    "contingency recommendation 1",
    "contingency recommendation 2",
    "contingency recommendation 3",
    "contingency recommendation 4"
  ],
  "customIdeaTitles": [
    "Idea Title 1",
    "Idea Title 2"
  ]
}`;

      const response = await withTimeout(
        executeWithRetry(() =>
          this.ai.models.generateContent({
            model: PRIMARY_MODEL,
            contents: prompt,
            config: {
              responseMimeType: 'application/json'
            }
          })
        )
      );

      if (response && response.text) {
        const parsed = extractJsonFromText(response.text);
        if (parsed.overviewSummary) aiSummary = parsed.overviewSummary;
        if (Array.isArray(parsed.contingencySuggestions) && parsed.contingencySuggestions.length > 0) {
          aiContingency = parsed.contingencySuggestions;
        }
      }
    } catch (err: any) {
      console.warn('Gemini generateCompletePlan call notice (using robust domain fallback):', err.message);
    }

    const plan: EventPlan = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: params.name,
      type: params.type,
      date: params.date,
      city: params.city,
      guests: params.guests,
      totalBudget: params.totalBudget,
      currency: params.currency || 'INR',
      durationHours: params.durationHours || 6,
      language: params.language || 'English',
      indoorOutdoor: params.indoorOutdoor,
      theme: params.theme,
      culturalTradition: params.culturalTradition,
      foodPreference: params.foodPreference,
      decorationStyle: params.decorationStyle,
      entertainmentPreference: params.entertainmentPreference,
      accessibilityRequirements: params.accessibilityRequirements,
      topPriorities: params.topPriorities || ['Guest Experience', 'Budget Adherence', 'Timely Execution'],
      userPrompt: params.userPrompt,
      overviewSummary: aiSummary,
      budgetCategories: deterministicCategories,
      expenses: [],
      tasks: deterministicTasks,
      daySchedule: deterministicSchedule,
      vendors: deterministicVendors,
      ideas: deterministicIdeas,
      risks: deterministicRisks,
      contingencySuggestions: aiContingency,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return plan;
  }

  // 2. AI Budget Rescue
  async rescueBudget(data: {
    totalBudget: number;
    currentExpenses: number;
    categories: BudgetCategory[];
    eventType: string;
    guests: number;
    city: string;
  }) {
    const totalAllocated = data.categories.reduce((sum, c) => sum + (c.allocatedAmount || 0), 0);
    const projectedOrActual = Math.max(totalAllocated, data.currentExpenses);
    const overspend = Math.max(0, projectedOrActual - data.totalBudget);

    // Fallback deterministic rescue recommendations
    const proposedCategories: BudgetCategory[] = data.categories.map((cat) => ({ ...cat }));
    const recommendations: Array<{
      category: string;
      currentAllocation: number;
      proposedAllocation: number;
      savings: number;
      action: string;
      tradeoff: string;
    }> = [];

    if (overspend > 0) {
      // Find top flexible categories: Decoration, Catering, Entertainment
      const flexCats = proposedCategories.filter((c) =>
        ['decor', 'cater', 'entertain', 'photo', 'space'].some((k) => c.name.toLowerCase().includes(k))
      );

      let remainingToCut = overspend;
      for (const cat of flexCats) {
        if (remainingToCut <= 0) break;
        const maxCut = Math.round(cat.allocatedAmount * 0.18);
        const cut = Math.min(remainingToCut, maxCut);
        if (cut > 0) {
          recommendations.push({
            category: cat.name,
            currentAllocation: cat.allocatedAmount,
            proposedAllocation: cat.allocatedAmount - cut,
            savings: cut,
            action: cat.name.toLowerCase().includes('decor')
              ? 'Shift to seasonal local flowers and minimalist ambient warm lighting rather than imported exotics.'
              : cat.name.toLowerCase().includes('cater')
              ? 'Rationalize appetizer live counters from 6 to 4, preserving signature mains.'
              : 'Opt for a high-energy DJ setup instead of a 6-piece live band.',
            tradeoff: 'Slightly reduced variety with zero negative impact on core guest satisfaction.'
          });
          cat.allocatedAmount -= cut;
          cat.percentage = Number(((cat.allocatedAmount / data.totalBudget) * 100).toFixed(1));
          remainingToCut -= cut;
        }
      }
    }

    let aiExplanation = overspend > 0
      ? `Your projected expenses exceed your target budget by ₹${overspend.toLocaleString('en-IN')}. By rationalizing decorative floral imports and streamlining appetizer live counters, you recover ₹${recommendations.reduce((acc, r) => acc + r.savings, 0).toLocaleString('en-IN')} without compromising ceremony dignity.`
      : `Your budget is currently well-balanced. You have ₹${(data.totalBudget - projectedOrActual).toLocaleString('en-IN')} unallocated headroom.`;

    if (overspend > 0) {
      try {
        const prompt = `You are a Chief Event Budget Auditor.
Event: ${data.eventType} in ${data.city} for ${data.guests} guests.
Total Budget: ₹${data.totalBudget} INR.
Current Expenses / Allocation: ₹${projectedOrActual} INR.
Overspend: ₹${overspend} INR.
Categories: ${JSON.stringify(data.categories.map((c) => ({ name: c.name, amount: c.allocatedAmount })))}

Provide a concise, practical financial rescue plan. Return JSON:
{
  "explanation": "2-3 sentences explaining the core strategy",
  "priorityCuts": [
    {
      "category": "category name",
      "action": "clear specific alternative",
      "savings": number
    }
  ]
}`;

        const res = await withTimeout(
          executeWithRetry(() =>
            this.ai.models.generateContent({
              model: PRIMARY_MODEL,
              contents: prompt,
              config: { responseMimeType: 'application/json' }
            })
          )
        );

        if (res && res.text) {
          const parsed = extractJsonFromText(res.text);
          if (parsed.explanation) aiExplanation = parsed.explanation;
        }
      } catch (e: any) {
        console.warn('Gemini rescueBudget notice:', e.message);
      }
    }

    return {
      overspendAmount: overspend,
      isOverBudget: overspend > 0,
      explanation: aiExplanation,
      recommendations,
      proposedCategories
    };
  }

  // 3. What-If Simulator
  async simulateWhatIf(
    currentPlan: EventPlan,
    simulatedChanges: {
      totalBudget?: number;
      guests?: number;
      durationHours?: number;
      indoorOutdoor?: 'Indoor' | 'Outdoor' | 'Hybrid';
      venuePreference?: string;
      cateringPreference?: string;
    }
  ): Promise<WhatIfSimulationResult> {
    const origBudget = currentPlan.totalBudget;
    const origGuests = currentPlan.guests;
    const origCostPerGuest = origGuests > 0 ? Math.round(origBudget / origGuests) : 0;

    const proposedBudget = simulatedChanges.totalBudget !== undefined ? simulatedChanges.totalBudget : origBudget;
    const proposedGuests = simulatedChanges.guests !== undefined ? simulatedChanges.guests : origGuests;
    const proposedCostPerGuest = proposedGuests > 0 ? Math.round(proposedBudget / proposedGuests) : 0;

    // Recalculate categories
    const proposedCategories = generateDeterministicBudgetCategories(proposedBudget, currentPlan.type);

    const cateringCatOrig = currentPlan.budgetCategories.find((c) => c.name.toLowerCase().includes('cater') || c.name.toLowerCase().includes('food'));
    const venueCatOrig = currentPlan.budgetCategories.find((c) => c.name.toLowerCase().includes('venue') || c.name.toLowerCase().includes('space'));

    const cateringCatProp = proposedCategories.find((c) => c.name.toLowerCase().includes('cater') || c.name.toLowerCase().includes('food'));
    const venueCatProp = proposedCategories.find((c) => c.name.toLowerCase().includes('venue') || c.name.toLowerCase().includes('space'));

    const budgetDiff = proposedBudget - origBudget;
    const guestDiff = proposedGuests - origGuests;

    let feasibility: 'Feasible' | 'Tight' | 'Deficit' = 'Feasible';
    if (guestDiff > 0 && budgetDiff <= 0) {
      feasibility = proposedCostPerGuest < origCostPerGuest * 0.75 ? 'Deficit' : 'Tight';
    } else if (budgetDiff < 0) {
      feasibility = 'Tight';
    }

    const scheduleAndVendorImpacts: string[] = [];
    const tradeOffs: string[] = [];
    const actionableRecommendations: string[] = [];

    if (guestDiff > 0) {
      scheduleAndVendorImpacts.push(`Venue capacity needs to accommodate ${proposedGuests} seated attendees (original was ${origGuests}).`);
      scheduleAndVendorImpacts.push(`Catering team must add ${Math.ceil(guestDiff / 50)} additional buffet/service staff.`);
      tradeOffs.push(`Cost per guest drops from ₹${origCostPerGuest.toLocaleString('en-IN')} to ₹${proposedCostPerGuest.toLocaleString('en-IN')}, requiring tighter decor and gifting allocations.`);
      actionableRecommendations.push(`Verify venue fire safety and air-conditioning capacity for ${proposedGuests} guests.`);
    } else if (guestDiff < 0) {
      scheduleAndVendorImpacts.push(`Intimate seating arrangement unlocks premium sit-down dining options.`);
      tradeOffs.push(`Total cost per guest increases to ₹${proposedCostPerGuest.toLocaleString('en-IN')}, allowing luxurious personalized favors.`);
      actionableRecommendations.push(`Reallocate surplus catering savings into cinematic videography or live entertainment.`);
    }

    if (budgetDiff < 0) {
      tradeOffs.push(`Total available funds reduced by ₹${Math.abs(budgetDiff).toLocaleString('en-IN')}.`);
      actionableRecommendations.push(`Consolidate single-venue ceremonies to eliminate inter-venue transportation costs.`);
    } else if (budgetDiff > 0) {
      actionableRecommendations.push(`Add an interactive cocktail/mocktail bar or upgrade to drone photography.`);
    }

    let summary = `Simulating a shift to ${proposedGuests} guests with a budget of ₹${proposedBudget.toLocaleString('en-IN')}. Cost per guest is ₹${proposedCostPerGuest.toLocaleString('en-IN')} (previously ₹${origCostPerGuest.toLocaleString('en-IN')}). Feasibility is rated as ${feasibility}.`;

    try {
      const prompt = `You are Planora AI's Predictive Event Simulator.
Baseline: ${currentPlan.name} (${currentPlan.type}), ${origGuests} guests, Budget: ₹${origBudget} INR.
Proposed: ${proposedGuests} guests, Budget: ₹${proposedBudget} INR.
Duration: ${simulatedChanges.durationHours || currentPlan.durationHours} hrs.
Setting: ${simulatedChanges.indoorOutdoor || currentPlan.indoorOutdoor}.

Analyze this scenario and return JSON:
{
  "summary": "2-3 sentences concise strategic summary",
  "tradeOffs": ["trade-off 1", "trade-off 2", "trade-off 3"],
  "scheduleAndVendorImpacts": ["impact 1", "impact 2"],
  "actionableRecommendations": ["rec 1", "rec 2"]
}`;

      const res = await withTimeout(
        executeWithRetry(() =>
          this.ai.models.generateContent({
            model: PRIMARY_MODEL,
            contents: prompt,
            config: { responseMimeType: 'application/json' }
          })
        )
      );

      if (res && res.text) {
        const parsed = extractJsonFromText(res.text);
        if (parsed.summary) summary = parsed.summary;
        if (Array.isArray(parsed.tradeOffs) && parsed.tradeOffs.length > 0) tradeOffs.push(...parsed.tradeOffs);
        if (Array.isArray(parsed.scheduleAndVendorImpacts) && parsed.scheduleAndVendorImpacts.length > 0) {
          scheduleAndVendorImpacts.push(...parsed.scheduleAndVendorImpacts);
        }
        if (Array.isArray(parsed.actionableRecommendations) && parsed.actionableRecommendations.length > 0) {
          actionableRecommendations.push(...parsed.actionableRecommendations);
        }
      }
    } catch (e: any) {
      console.warn('Gemini simulateWhatIf notice:', e.message);
    }

    return {
      summary,
      originalValues: {
        totalBudget: origBudget,
        guests: origGuests,
        costPerGuest: origCostPerGuest,
        venueEstimate: venueCatOrig?.allocatedAmount || 0,
        cateringEstimate: cateringCatOrig?.allocatedAmount || 0
      },
      proposedValues: {
        totalBudget: proposedBudget,
        guests: proposedGuests,
        costPerGuest: proposedCostPerGuest,
        venueEstimate: venueCatProp?.allocatedAmount || 0,
        cateringEstimate: cateringCatProp?.allocatedAmount || 0
      },
      budgetImpact: {
        difference: budgetDiff,
        feasibility,
        details: feasibility === 'Deficit'
          ? 'Guest expansion without proportional budget increase risks sub-standard catering service.'
          : feasibility === 'Tight'
          ? 'Viable with strict category caps on floral and non-essential entertainment.'
          : 'Well-funded scenario with adequate margin for safety.'
      },
      scheduleAndVendorImpacts: Array.from(new Set(scheduleAndVendorImpacts)),
      tradeOffs: Array.from(new Set(tradeOffs)),
      actionableRecommendations: Array.from(new Set(actionableRecommendations)),
      proposedCategories
    };
  }

  // 4. Context-Aware Chat Assistant
  async chatWithAssistant(
    message: string,
    history: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    eventContext: EventPlan
  ): Promise<{ response: string; suggestedAction?: any }> {
    const totalSpent = (eventContext.expenses || []).reduce((s, e) => s + (e.amount || 0), 0);
    const tasksDone = (eventContext.tasks || []).filter((t) => t.completed).length;
    const tasksTotal = (eventContext.tasks || []).length;
    const bookedVendors = (eventContext.vendors || []).filter((v) => v.bookingStatus === 'Booked').length;

    let fallbackResponse = `I'm analyzing your ${eventContext.name} (${eventContext.type} in ${eventContext.city}). You currently have a budget of ₹${eventContext.totalBudget.toLocaleString('en-IN')}, with ${tasksDone}/${tasksTotal} tasks completed and ${bookedVendors} vendors locked in. Regarding your question: "${message}", I recommend aligning with your primary priorities and confirming vendor contracts at least 30 days before ${eventContext.date}.`;

    try {
      const systemContext = `You are Planora AI, an expert event planning consultant.
You are assisting the user with their active event plan:
- Event: "${eventContext.name}" (${eventContext.type})
- Location: ${eventContext.city}
- Date: ${eventContext.date}
- Guests: ${eventContext.guests}
- Total Budget: ₹${eventContext.totalBudget} INR
- Actual Spending So Far: ₹${totalSpent} INR
- Cultural Tradition: ${eventContext.culturalTradition || 'None specified'}
- Theme: ${eventContext.theme || 'Elegant celebration'}
- Setting: ${eventContext.indoorOutdoor}
- Tasks Status: ${tasksDone}/${tasksTotal} completed
- Vendors Booked: ${bookedVendors}/${(eventContext.vendors || []).length}

Guidelines:
1. Always give specific, grounded advice based on the above numbers and details.
2. If the user mentions changing budget or guests, provide clear mathematical implications.
3. Be respectful of cultural nuances (e.g. Bengali, North/South Indian, Modern weddings, Milestone birthdays).
4. Do NOT hallucinate fake vendor phone numbers or fake company names.
5. Keep your tone encouraging, proactive, and professional.`;

      const promptHistory = history.slice(-6).map((h) => `${h.role === 'user' ? 'User' : 'Planora AI'}: ${h.content}`).join('\n');
      const fullPrompt = `${systemContext}\n\nRecent Conversation:\n${promptHistory}\n\nUser: ${message}\nPlanora AI:`;

      const res = await withTimeout(
        executeWithRetry(() =>
          this.ai.models.generateContent({
            model: PRIMARY_MODEL,
            contents: fullPrompt
          })
        )
      );

      if (res && res.text) {
        return { response: res.text.trim() };
      }
    } catch (e: any) {
      console.warn('Gemini chatWithAssistant notice:', e.message);
    }

    return { response: fallbackResponse };
  }

  // 5. Generate Dynamic Cultural Ideas
  async getPersonalizedIdeas(params: {
    eventType: string;
    culturalTradition?: string;
    theme?: string;
    city: string;
    guests: number;
    totalBudget: number;
    category?: string;
  }): Promise<EventIdea[]> {
    const cacheKey = `ideas-${params.eventType}-${params.culturalTradition || ''}-${params.theme || ''}-${params.city}-${params.guests}-${params.totalBudget}-${params.category || ''}`;
    const cached = staticAiCache.get<EventIdea[]>(cacheKey);
    if (cached) return cached;

    const baseIdeas = generateDeterministicIdeas(params.eventType, params.culturalTradition, params.theme, params.city);

    try {
      const prompt = `Generate 4 distinct, culturally rich, realistic event ideas for a ${params.eventType} in ${params.city} with ${params.guests} guests and ₹${params.totalBudget} INR budget.
Culture/Tradition: ${params.culturalTradition || 'General'}
Theme: ${params.theme || 'Festive'}
Category focus: ${params.category || 'All categories'}

Return JSON array of 4 objects matching:
[
  {
    "id": "idea-ai-1",
    "title": "Inspiring Title",
    "category": "Decoration" | "Menu" | "Entertainment" | "Return Gifts" | "Activities",
    "description": "Engaging description with authentic elements",
    "estimatedCostRange": "Illustrative range in INR e.g. ₹15,000 - ₹30,000",
    "suitability": "Best for...",
    "implementationTips": ["Tip 1", "Tip 2"]
  }
]`;

      const res = await withTimeout(
        executeWithRetry(() =>
          this.ai.models.generateContent({
            model: PRIMARY_MODEL,
            contents: prompt,
            config: { responseMimeType: 'application/json' }
          })
        )
      );

      if (res && res.text) {
        const parsed = extractJsonFromText(res.text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item, i) => ({
            id: `idea-ai-${Date.now()}-${i}`,
            title: item.title || 'Creative Idea',
            category: item.category || 'Inspiration',
            description: item.description || '',
            estimatedCostRange: item.estimatedCostRange || 'Illustrative',
            suitability: item.suitability || 'All celebrations',
            implementationTips: Array.isArray(item.implementationTips) ? item.implementationTips : []
          }));
        }
      }
    } catch (e: any) {
      console.warn('Gemini getPersonalizedIdeas notice:', e.message);
    }

    return baseIdeas;
  }

  // 6. Event Risk Analysis
  async analyzeRisks(eventPlan: EventPlan): Promise<EventRisk[]> {
    const now = new Date();
    const eventDate = new Date(eventPlan.date);
    const diffDays = Math.max(1, Math.round((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const baseRisks = generateDeterministicRisks(eventPlan.indoorOutdoor, diffDays, eventPlan.totalBudget);

    const cacheKey = `risks-${eventPlan.type}-${eventPlan.indoorOutdoor}-${diffDays}-${eventPlan.totalBudget}`;
    const cachedRisks = staticAiCache.get<EventRisk[]>(cacheKey);
    if (cachedRisks) return cachedRisks;

    try {
      const prompt = `You are a Risk Management Officer for Events.
Analyze this plan:
Event: ${eventPlan.name} (${eventPlan.type})
Days remaining: ${diffDays} days
Setting: ${eventPlan.indoorOutdoor}
Budget: ₹${eventPlan.totalBudget}
Location: ${eventPlan.city}
Tasks: ${(eventPlan.tasks || []).length} total, ${(eventPlan.tasks || []).filter((t) => t.completed).length} completed
Vendors: ${(eventPlan.vendors || []).length} total, ${(eventPlan.vendors || []).filter((v) => v.bookingStatus === 'Booked').length} booked

Return JSON array of 4 realistic risks:
[
  {
    "id": "risk-1",
    "description": "Specific risk description",
    "severity": "Critical" | "High" | "Medium" | "Low",
    "reason": "Clear root cause based on event parameters",
    "recommendedAction": "Concrete action step",
    "deadline": "When action must be taken"
  }
]`;

      const res = await withTimeout(
        executeWithRetry(() =>
          this.ai.models.generateContent({
            model: PRIMARY_MODEL,
            contents: prompt,
            config: { responseMimeType: 'application/json' }
          })
        )
      );

      if (res && res.text) {
        const parsed = extractJsonFromText(res.text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((r, i) => ({
            id: `risk-ai-${i + 1}`,
            description: r.description || 'Event Risk',
            severity: ['Critical', 'High', 'Medium', 'Low'].includes(r.severity) ? r.severity : 'Medium',
            reason: r.reason || '',
            recommendedAction: r.recommendedAction || '',
            deadline: r.deadline || 'Prior to event'
          }));
        }
      }
    } catch (e: any) {
      console.warn('Gemini analyzeRisks notice:', e.message);
    }

    return baseRisks;
  }
}

export const geminiService = new GeminiService();
