import { EventPlan } from '../types';

const STORAGE_KEYS = {
  EVENTS: 'planora_events_v1',
  ACTIVE_EVENT_ID: 'planora_active_event_id_v1',
  THEME: 'planora_theme_v1',
  USER: 'planora_user_v1'
};

// High-fidelity pre-configured Sample Events for instant testing & hackathon demonstration
export const SAMPLE_EVENTS: EventPlan[] = [
  {
    id: 'sample-bengali-wedding',
    name: 'Ananya & Sourav’s Traditional Bengali Wedding',
    type: 'wedding',
    date: '2026-11-28',
    city: 'Kolkata',
    guests: 200,
    totalBudget: 500000,
    currency: 'INR',
    durationHours: 8,
    language: 'English & Bengali',
    indoorOutdoor: 'Hybrid',
    theme: 'Heritage Kolkata Rajbari Elegance',
    culturalTradition: 'Traditional Bengali Hindu Wedding (Biye & Bor Jatri)',
    foodPreference: 'Authentic Bengali Bhoj (Bhetki Paturi, Kosha Mangsho, Nolen Gur Sandesh)',
    decorationStyle: 'Shola Crafts, Red-White Florals & Warm Terracotta Bells',
    entertainmentPreference: 'Dhak beats, Shehnai morning welcome & evening Rabindra Sangeet fusion',
    accessibilityRequirements: 'Wheelchair access for elderly grandparents at main banquet',
    topPriorities: ['Authentic Cuisine Quality', 'Photographic Memories', 'Smooth Bor Jatri Welcome'],
    userPrompt: 'I want a traditional Bengali wedding in Kolkata for 200 guests with a budget of ₹5 lakh. I prefer elegant floral decorations, authentic Bengali cuisine, and a two-day celebration.',
    overviewSummary: 'A soulful, culturally authentic Bengali wedding celebration hosted in the heritage heart of Kolkata. Combining Rajbari aesthetic motifs with warm hospitality, this plan harmonizes sacred Gaye Holud, Bor Jatri arrival, and a grand evening Biye ceremony with meticulous budget allocation and vendor readiness.',
    budgetCategories: [
      { id: 'cat-1', name: 'Venue & Space', allocatedAmount: 140000, actualAmount: 135000, percentage: 28, notes: 'Rajbari courtyard & indoor banquet hall', color: '#4F46E5' },
      { id: 'cat-2', name: 'Catering & Food', allocatedAmount: 160000, actualAmount: 165000, percentage: 32, notes: 'Full Bengali feast with live sweet counters (200 guests)', color: '#EC4899' },
      { id: 'cat-3', name: 'Decoration & Florals', allocatedAmount: 70000, actualAmount: 68000, percentage: 14, notes: 'Sholapith mandap, Rajnigandha and marigold drapes', color: '#8B5CF6' },
      { id: 'cat-4', name: 'Photography & Video', allocatedAmount: 50000, actualAmount: 50000, percentage: 10, notes: 'Traditional + candid 2-photographer team & cinematic teaser', color: '#3B82F6' },
      { id: 'cat-5', name: 'Entertainment & Dhak', allocatedAmount: 25000, actualAmount: 22000, percentage: 5, notes: 'Dhakis for Gaye Holud & Bor Jatri + evening sound setup', color: '#10B981' },
      { id: 'cat-6', name: 'Attire & Styling', allocatedAmount: 20000, actualAmount: 19500, percentage: 4, notes: 'Bridal Chandan makeup & silk saree draper', color: '#F59E0B' },
      { id: 'cat-7', name: 'Invitations & Favors', allocatedAmount: 10000, actualAmount: 9000, percentage: 2, notes: 'Calligraphed Patachitra wedding cards & Dokra gift favors', color: '#06B6D4' },
      { id: 'cat-8', name: 'Emergency Reserve', allocatedAmount: 25000, actualAmount: 0, percentage: 5, notes: 'Dedicated buffer fund for contingency logistics', color: '#64748B' }
    ],
    expenses: [
      { id: 'exp-1', categoryId: 'cat-1', categoryName: 'Venue & Space', name: 'Banquet Hall Advance Deposit', amount: 50000, date: '2026-09-15', paid: true, notes: '50% advance' },
      { id: 'exp-2', categoryId: 'cat-2', categoryName: 'Catering & Food', name: 'Caterer Tasting & Reservation Token', amount: 30000, date: '2026-09-20', paid: true, notes: 'Secured menu dates' },
      { id: 'exp-3', categoryId: 'cat-4', categoryName: 'Photography & Video', name: 'Lead Photographer Advance', amount: 20000, date: '2026-10-01', paid: true, notes: 'Pre-wedding photoshoot and teaser locked' }
    ],
    tasks: [
      { id: 't-1', title: 'Confirm Bor Jatri welcome route & Sandalwood Tilak trays', category: 'Coordination', priority: 'High', dueDate: '2026-11-20', completed: true, notes: 'Assign cousin to oversee welcome drink distribution' },
      { id: 't-2', title: 'Schedule Final Caterer Menu Tasting for Bhetki Paturi & Kosha Mangsho', category: 'Catering', priority: 'High', dueDate: '2026-11-22', completed: true, notes: 'Confirm non-veg and vegetarian plate ratio (140 non-veg / 60 veg)' },
      { id: 't-3', title: 'Finalize Shola & Fresh Tuberose Mandap Decor Layout', category: 'Decoration', priority: 'Medium', dueDate: '2026-11-24', completed: false, notes: 'Check electric outlets for ambient 2700K warm lights' },
      { id: 't-4', title: 'Verify Sound Permit for Dhakis and Evening Music with Kolkata Police', category: 'Logistics', priority: 'High', dueDate: '2026-11-25', completed: false, notes: '10:00 PM loudspeaker compliance adherence' },
      { id: 't-5', title: 'Assemble Bridal Emergency Kit & Safety Pins', category: 'Styling', priority: 'Low', dueDate: '2026-11-27', completed: false, notes: 'Include hair pins, touchup compact, safety pins, glucose' }
    ],
    daySchedule: [
      { id: 'ds-1', time: '08:00 AM', activity: 'Gaye Holud Setup & Turmeric Paste Ceremony', location: 'Home Courtyard', responsiblePerson: 'Bride’s Aunt' },
      { id: 'ds-2', time: '01:00 PM', activity: 'Traditional Aiburobhat Feast for Bride & Groom', location: 'Family Dining Hall', responsiblePerson: 'Family Elders' },
      { id: 'ds-3', time: '04:30 PM', activity: 'Bridal Makeup, Saree Pleating & Chandan Artistry', location: 'Bridal Suite', responsiblePerson: 'Kolkata Glamour Artists' },
      { id: 'ds-4', time: '06:30 PM', activity: 'Bor Jatri Arrival with Dhakis & Sandalwood Welcome', location: 'Banquet Entrance Arch', responsiblePerson: 'Hospitality Lead' },
      { id: 'ds-5', time: '07:30 PM', activity: 'Saat Paak, Subho Drishti & Mala Badal Ceremony', location: 'Central Shola Mandap', responsiblePerson: 'Purohit & Family' },
      { id: 'ds-6', time: '08:30 PM', activity: 'Grand Bengali Bhoj Buffet & Live Mishti Counter', location: 'Dining Hall', responsiblePerson: 'Royal Caterers Chef' },
      { id: 'ds-7', time: '11:00 PM', activity: 'Sindoor Daan & Farewell Send-off', location: 'Mandap & Foyer', responsiblePerson: 'Family Representative' }
    ],
    vendors: [
      { id: 'v-1', name: 'Sovabazar Heritage Banquet & Courtyard', category: 'Venue', contactName: 'Subhasish Roy', phone: '+91 98301 23456', email: 'heritage@banquetkolkata.in', estimatedPrice: 140000, agreedPrice: 135000, paymentStatus: 'Deposit Paid', bookingStatus: 'Booked', notes: 'Advance paid. Access starts at 11 AM.' },
      { id: 'v-2', name: 'Gourmet Bengal Caterers & Confectioners', category: 'Catering', contactName: 'Chef Debanjan Sen', phone: '+91 98312 87654', email: 'debanjan@gourmetbengal.com', estimatedPrice: 160000, agreedPrice: 165000, paymentStatus: 'Deposit Paid', bookingStatus: 'Booked', notes: 'Menu includes live Nolen Gur Rosogolla counter.' },
      { id: 'v-3', name: 'Ananda Sholapith & Floral Art Studio', category: 'Decoration', contactName: 'Bikash Pal', phone: '+91 98365 43210', email: 'artisan@anandadecor.in', estimatedPrice: 70000, agreedPrice: 68000, paymentStatus: 'Unpaid', bookingStatus: 'Negotiating', notes: 'Reviewing terracotta bell accents mockup.' },
      { id: 'v-4', name: 'Kolkata Frames Candid Wedding Photography', category: 'Photography', contactName: 'Tanmoy Mukherjee', phone: '+91 98300 98765', email: 'tanmoy@kolkataframes.in', estimatedPrice: 50000, agreedPrice: 50000, paymentStatus: 'Deposit Paid', bookingStatus: 'Booked', notes: 'Teaser delivery promised within 14 days.' }
    ],
    ideas: [
      {
        id: 'idea-bg-1',
        title: 'Sholapith Mukut and Heritage Red Border Saree Backdrop',
        category: 'Decoration',
        description: 'Create an iconic photo station framed with handcrafted Bengali Shola floral carvings and traditional Lal-Paar draping for timeless couple and family portraits.',
        estimatedCostRange: '₹12,000 - ₹20,000',
        suitability: 'Reception Entrance & Stage',
        implementationTips: ['Use soft amber 2700K spot lights', 'Add a basket of fresh tuberose strings']
      },
      {
        id: 'idea-bg-2',
        title: 'Live Steaming Bhetki Paturi & Hot Nolen Gur Rosogolla Bar',
        category: 'Menu',
        description: 'Delight guests with fresh Kolkata Bhetki fish wrapped in fragrant banana leaves and steamed right before service, followed by hot winter date-palm jaggery sweets.',
        estimatedCostRange: 'Included in catering budget',
        suitability: 'Dinner Banquet',
        implementationTips: ['Station 2 dedicated cooks at the live frying and steaming station to eliminate waiting']
      }
    ],
    risks: [
      {
        id: 'r-1',
        description: 'Evening Kolkata Traffic Delay for Bor Jatri Procession',
        severity: 'High',
        reason: 'Peak weekend traffic on central Kolkata corridors can cause a 60-90 minute delay in groom arrival.',
        recommendedAction: 'Schedule groom departure 90 minutes earlier than normal GPS estimates and designate a traffic pilot car.',
        deadline: 'Brief driver 24 hours prior'
      },
      {
        id: 'r-2',
        description: 'Municipal 10:00 PM Loudspeaker Curfew Enforcement',
        severity: 'Medium',
        reason: 'City environmental norms strictly prohibit exterior horn speakers past 10 PM.',
        recommendedAction: 'Shift open-air Dhak and procession instruments to indoor acoustic banquet halls by 9:45 PM.',
        deadline: 'Verify banquet guidelines during final rehearsal'
      }
    ],
    contingencySuggestions: [
      'Keep backup emergency generator diesel fueled for seamless stage illumination.',
      'Maintain an envelope with emergency cash/UPI for unexpected extra banquet plates.',
      'Designate one trusted family member with the master vendor contact checklist.'
    ],
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-10-25T12:00:00Z'
  },
  {
    id: 'sample-birthday-party',
    name: 'Aarav’s 7th Superhero Adventure Birthday',
    type: 'birthday',
    date: '2026-11-05',
    city: 'Mumbai',
    guests: 30,
    totalBudget: 20000,
    currency: 'INR',
    durationHours: 4,
    language: 'English & Hindi',
    indoorOutdoor: 'Indoor',
    theme: 'Superhero Academy',
    culturalTradition: 'Contemporary Birthday Party',
    foodPreference: 'Kid-friendly appetizers, mini sliders, cupcakes, and customized themed cake',
    decorationStyle: 'Balloon arch, comic book action cutouts & superhero photo booth',
    entertainmentPreference: 'Magic show, interactive superhero obstacle course games & kids DJ',
    topPriorities: ['Engaging Entertainment', 'Delicious Birthday Cake', 'Fun Return Favors'],
    overviewSummary: 'An action-packed 7th birthday celebration designed for 30 energetic kids and parents with a smart ₹20,000 budget.',
    budgetCategories: [
      { id: 'cat-b1', name: 'Venue / Party Hall', allocatedAmount: 5000, actualAmount: 5000, percentage: 25, notes: 'Society clubhouse rental' },
      { id: 'cat-b2', name: 'Food & Beverages', allocatedAmount: 7000, actualAmount: 7200, percentage: 35, notes: 'Cake, finger snacks, pasta, juices' },
      { id: 'cat-b3', name: 'Theme Decor & Balloons', allocatedAmount: 3000, actualAmount: 2800, percentage: 15, notes: 'Superhero backdrop & balloon garland' },
      { id: 'cat-b4', name: 'Entertainment & Games', allocatedAmount: 2500, actualAmount: 2500, percentage: 12.5, notes: 'Magician & game emcee' },
      { id: 'cat-b5', name: 'Photography', allocatedAmount: 1200, actualAmount: 1000, percentage: 6, notes: 'Candid photo highlights' },
      { id: 'cat-b6', name: 'Return Favors & Reserve', allocatedAmount: 1300, actualAmount: 1200, percentage: 6.5, notes: 'Superhero cape hampers & buffer' }
    ],
    expenses: [
      { id: 'exp-b1', categoryId: 'cat-b1', categoryName: 'Venue / Party Hall', name: 'Clubhouse booking receipt', amount: 5000, date: '2026-10-10', paid: true }
    ],
    tasks: [
      { id: 'tb-1', title: 'Order Superhero Theme Fondant Cake (2 kg)', category: 'Food', priority: 'High', dueDate: '2026-10-30', completed: true },
      { id: 'tb-2', title: 'Confirm Magician & Game Host Timing', category: 'Entertainment', priority: 'High', dueDate: '2026-11-01', completed: true },
      { id: 'tb-3', title: 'Assemble Superhero Mask and Cape Return Gift Hampers', category: 'Favors', priority: 'Medium', dueDate: '2026-11-03', completed: false }
    ],
    daySchedule: [
      { id: 'dsb-1', time: '04:00 PM', activity: 'Decor setup & Balloon garland inflation', location: 'Clubhouse' },
      { id: 'dsb-2', time: '05:00 PM', activity: 'Kids Arrival & Superhero Tattoo/Face Painting', location: 'Welcome Corner' },
      { id: 'dsb-3', time: '05:45 PM', activity: 'Magic Show & Superhero Agility Games', location: 'Center Area' },
      { id: 'dsb-4', time: '07:00 PM', activity: 'Cake Cutting Ceremony & Superhero Cheers', location: 'Stage' },
      { id: 'dsb-5', time: '07:30 PM', activity: 'Snacks Buffet & Return Hamper Distribution', location: 'Dining Corner' }
    ],
    vendors: [
      { id: 'vb-1', name: 'Sweet Dreams Cake Studio', category: 'Catering', contactName: 'Megha', phone: '+91 98200 11223', estimatedPrice: 3000, agreedPrice: 2800, paymentStatus: 'Deposit Paid', bookingStatus: 'Booked' }
    ],
    ideas: [],
    risks: [],
    contingencySuggestions: ['Keep extra juice boxes in cooling fridge for warm afternoon.'],
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-25T12:00:00Z'
  }
];

export const storage = {
  getEvents(): EventPlan[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (!data) {
        // Seed initial sample events (clone so SAMPLE_EVENTS is not mutated)
        const initial = JSON.parse(JSON.stringify(SAMPLE_EVENTS));
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(data);
    } catch {
      return JSON.parse(JSON.stringify(SAMPLE_EVENTS));
    }
  },

  saveEvents(events: EventPlan[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    } catch (err) {
      console.error('Error saving events to storage:', err);
    }
  },

  saveEvent(event: EventPlan): void {
    const events = this.getEvents();
    const idx = events.findIndex((e) => e.id === event.id);
    if (idx >= 0) {
      events[idx] = { ...event, updatedAt: new Date().toISOString() };
    } else {
      events.unshift({ ...event, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    this.saveEvents(events);
    this.setActiveEventId(event.id);
  },

  deleteEvent(id: string): void {
    const events = this.getEvents().filter((e) => e.id !== id);
    this.saveEvents(events);
    const activeId = this.getActiveEventId();
    if (activeId === id && events.length > 0) {
      this.setActiveEventId(events[0].id);
    }
  },

  getActiveEventId(): string {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_EVENT_ID) || SAMPLE_EVENTS[0].id;
  },

  setActiveEventId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_EVENT_ID, id);
  },

  getActiveEvent(): EventPlan {
    const events = this.getEvents();
    const activeId = this.getActiveEventId();
    const found = events.find((e) => e.id === activeId);
    return found || events[0] || SAMPLE_EVENTS[0];
  },

  getTheme(): 'light' | 'dark' {
    return (localStorage.getItem(STORAGE_KEYS.THEME) as 'light' | 'dark') || 'light';
  },

  setTheme(theme: 'light' | 'dark'): void {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  getUser(): { name: string; email: string; avatar?: string } | null {
    try {
      const u = localStorage.getItem(STORAGE_KEYS.USER);
      return u ? JSON.parse(u) : { name: 'Priya Sharma', email: 'priya.sharma@planora.ai' };
    } catch {
      return { name: 'Priya Sharma', email: 'priya.sharma@planora.ai' };
    }
  },

  setUser(user: { name: string; email: string; avatar?: string } | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }
};
