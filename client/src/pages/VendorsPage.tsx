import {
  CheckCircle2,
  Clock,
  Edit2,
  HelpCircle,
  Mail,
  Phone,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Users
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Modal } from '../components/common/Modal';
import { useEventContext } from '../context/EventContext';
import { PaymentStatus, VendorItem, VendorStatus } from '../types';
import { formatINR } from '../utils/currency';

const VENDOR_CATEGORIES = [
  'All',
  'Venue',
  'Catering',
  'Photography',
  'Decoration',
  'Entertainment',
  'Makeup and Styling',
  'Invitation Printing',
  'Event Equipment',
  'Transportation'
];

const BOOKING_STATUSES: VendorStatus[] = [
  'Not Started',
  'Researching',
  'Shortlisted',
  'Contacted',
  'Negotiating',
  'Booked',
  'Completed'
];

const PAYMENT_STATUSES: PaymentStatus[] = [
  'Unpaid',
  'Deposit Paid',
  'Partially Paid',
  'Paid in Full'
];

export const VendorsPage: React.FC = () => {
  const { activeEvent, addVendor, updateVendor, deleteVendor } = useEventContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Vendor Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);
  const [vendorForm, setVendorForm] = useState<Omit<VendorItem, 'id'>>({
    name: '',
    category: 'Venue',
    contactName: '',
    phone: '',
    email: '',
    estimatedPrice: 50000,
    agreedPrice: 50000,
    paymentStatus: 'Unpaid',
    bookingStatus: 'Researching',
    notes: '',
    deadline: ''
  });

  // AI Criteria Checklist drawer
  const [showCriteriaModal, setShowCriteriaModal] = useState(false);
  const [activeCriteriaCategory, setActiveCriteriaCategory] = useState('Catering');

  if (!activeEvent) return null;

  const vendors = activeEvent.vendors || [];

  const filteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      if (selectedCategory !== 'All' && v.category !== selectedCategory) return false;
      if (selectedStatus !== 'All' && v.bookingStatus !== selectedStatus) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          v.name.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q) ||
          (v.contactName && v.contactName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [vendors, selectedCategory, selectedStatus, searchQuery]);

  const handleOpenAdd = () => {
    setEditingVendorId(null);
    setVendorForm({
      name: '',
      category: 'Venue',
      contactName: '',
      phone: '',
      email: '',
      estimatedPrice: 50000,
      agreedPrice: 50000,
      paymentStatus: 'Unpaid',
      bookingStatus: 'Researching',
      notes: '',
      deadline: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: VendorItem) => {
    setEditingVendorId(v.id);
    setVendorForm({
      name: v.name,
      category: v.category,
      contactName: v.contactName || '',
      phone: v.phone || '',
      email: v.email || '',
      estimatedPrice: v.estimatedPrice,
      agreedPrice: v.agreedPrice,
      paymentStatus: v.paymentStatus,
      bookingStatus: v.bookingStatus,
      notes: v.notes || '',
      deadline: v.deadline || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorForm.name) return;

    if (editingVendorId) {
      updateVendor({
        ...vendorForm,
        id: editingVendorId
      });
    } else {
      addVendor(vendorForm);
    }
    setIsModalOpen(false);
  };

  const AI_CRITERIA_GUIDES: Record<string, { questions: string[]; redFlags: string[] }> = {
    Catering: {
      questions: [
        'Does the per-plate quote include live appetizer stations and service staff gratuities?',
        'What is your tasting policy, and can we test non-veg and vegetarian items simultaneously?',
        'What is your guaranteed plate count policy vs. on-demand 10% buffer count?',
        'Do you provide waste disposal and eco-friendly leaf/clay plating?'
      ],
      redFlags: [
        'Reluctance to provide a written ingredient list or tasting session.',
        'Vague extra charges for water bottles, ice cubes, or heating chafing dishes.'
      ]
    },
    Venue: {
      questions: [
        'What is the exact curfew hour for external sound and outdoor amplification?',
        'Is full-capacity air-conditioning and backup generator fuel included in the base tariff?',
        'Are outside caterers or decorators permitted, or is there an exclusive royalty fee?',
        'What is the vehicle parking capacity and is valet management supported?'
      ],
      redFlags: [
        'Inability to show proof of municipal fire safety NOC.',
        'Overtime penalty fees exceeding ₹15,000/hour without prior notice.'
      ]
    },
    Decoration: {
      questions: [
        'Are flowers fresh local seasonal blooms or imported cold-storage exotics?',
        'Will the mandap/stage rigging require drilling into heritage walls or free-standing trussing?',
        'What time does setup access start on the day of the celebration?',
        'Who is responsible for post-event floral dismantling and cleanup?'
      ],
      redFlags: [
        'Using synthetic artificial flowers while billing for fresh blooms.',
        'Not providing 3D sketches or physical color swatches 3 weeks prior.'
      ]
    },
    Photography: {
      questions: [
        'How many lead shooters vs assistants will be on-site simultaneously?',
        'What is the turnaround schedule for raw photos, color-graded album, and cinematic teaser?',
        'Do you shoot in 4K resolution and provide drone aerial coverage if permitted?',
        'What backup camera bodies and dual SD-card redundancy do you maintain?'
      ],
      redFlags: [
        'Delivery timelines exceeding 4 months without milestone delivery guarantees.',
        'Single shooter attempting both candid photography and cinematic video simultaneously.'
      ]
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Smart Vendor Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track contracts, agreed prices, booking stages, and payment disbursements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCriteriaModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 px-4 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 transition"
          >
            <Sparkles className="h-4 w-4" />
            AI Selection Criteria
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-4 py-2 text-xs font-bold text-white shadow-soft-sm hover:opacity-95 transition"
          >
            <Plus className="h-4 w-4" />
            Add Vendor
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-soft-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by vendor name or contact..."
            className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-brand-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 focus:outline-none focus:border-brand-600"
          >
            {VENDOR_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 focus:outline-none focus:border-brand-600"
          >
            <option value="All">Status: All</option>
            {BOOKING_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVendors.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">
            No vendors found matching your filter criteria.
          </div>
        ) : (
          filteredVendors.map((vendor) => {
            const isBooked = vendor.bookingStatus === 'Booked' || vendor.bookingStatus === 'Completed';

            return (
              <div
                key={vendor.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between transition hover:shadow-soft-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                        {vendor.category}
                      </span>
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                        {vendor.name}
                      </h3>
                    </div>

                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md shrink-0 ${
                        isBooked
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : vendor.bookingStatus === 'Negotiating'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {vendor.bookingStatus}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {vendor.contactName && (
                      <p className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        <span>{vendor.contactName}</span>
                      </p>
                    )}
                    {vendor.phone && (
                      <p className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span>{vendor.phone}</span>
                      </p>
                    )}
                    {vendor.email && (
                      <p className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        <span className="truncate">{vendor.email}</span>
                      </p>
                    )}
                  </div>

                  {vendor.notes && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 leading-snug">
                      {vendor.notes}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div>
                      <p className="text-[10px] text-slate-400">Agreed Price</p>
                      <p className="font-extrabold text-slate-900 dark:text-white">
                        {formatINR(vendor.agreedPrice || vendor.estimatedPrice)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] text-slate-400">Payment</p>
                      <span className={`text-[10px] font-bold ${
                        vendor.paymentStatus === 'Paid in Full'
                          ? 'text-emerald-600'
                          : vendor.paymentStatus === 'Deposit Paid'
                          ? 'text-brand-600'
                          : 'text-amber-600'
                      }`}>
                        {vendor.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400">
                      {vendor.deadline || 'Timeline set'}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(vendor)}
                        className="text-slate-400 hover:text-brand-600 transition"
                        title="Edit Vendor"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => deleteVendor(vendor.id)}
                        className="text-slate-400 hover:text-rose-600 transition"
                        title="Delete Vendor"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Vendor Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVendorId ? 'Edit Vendor Details' : 'Add New Vendor'}
        description="Record contract numbers, contact details, and booking state."
        maxWidthClass="max-w-lg"
      >
        <form onSubmit={handleSaveVendor} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Vendor Name</label>
              <input
                type="text"
                required
                value={vendorForm.name}
                onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                placeholder="e.g. Royal Bengal Caterers"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-brand-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select
                value={vendorForm.category}
                onChange={(e) => setVendorForm({ ...vendorForm, category: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-brand-600"
              >
                {VENDOR_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Person</label>
              <input
                type="text"
                value={vendorForm.contactName}
                onChange={(e) => setVendorForm({ ...vendorForm, contactName: e.target.value })}
                placeholder="e.g. Mr. Debanjan"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-brand-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={vendorForm.phone}
                onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                placeholder="+91 98300 00000"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-brand-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={vendorForm.email}
                onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                placeholder="contact@vendor.in"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-brand-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Estimated Price (INR)</label>
              <input
                type="number"
                min="0"
                value={vendorForm.estimatedPrice}
                onChange={(e) => setVendorForm({ ...vendorForm, estimatedPrice: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-brand-600 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Agreed Price (INR)</label>
              <input
                type="number"
                min="0"
                value={vendorForm.agreedPrice}
                onChange={(e) => setVendorForm({ ...vendorForm, agreedPrice: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-brand-600 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Booking Status</label>
              <select
                value={vendorForm.bookingStatus}
                onChange={(e) => setVendorForm({ ...vendorForm, bookingStatus: e.target.value as any })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-brand-600"
              >
                {BOOKING_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Status</label>
              <select
                value={vendorForm.paymentStatus}
                onChange={(e) => setVendorForm({ ...vendorForm, paymentStatus: e.target.value as any })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-brand-600"
              >
                {PAYMENT_STATUSES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Notes / Contract Inclusions</label>
            <textarea
              rows={2}
              value={vendorForm.notes}
              onChange={(e) => setVendorForm({ ...vendorForm, notes: e.target.value })}
              placeholder="Inclusions, backup policies, payment terms"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-brand-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white hover:bg-brand-700 transition"
            >
              Save Vendor
            </button>
          </div>
        </form>
      </Modal>

      {/* AI Vendor Selection Criteria Modal */}
      <Modal
        isOpen={showCriteriaModal}
        onClose={() => setShowCriteriaModal(false)}
        title="AI Vendor Vetting Guide"
        description="Key questions and warning signs curated by AI for Indian celebrations."
        maxWidthClass="max-w-xl"
      >
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {Object.keys(AI_CRITERIA_GUIDES).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCriteriaCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition shrink-0 ${
                activeCriteriaCategory === cat
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Must-Ask Questions:
            </h4>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-300">
              {AI_CRITERIA_GUIDES[activeCriteriaCategory]?.questions.map((q, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
                  <span className="font-bold text-brand-600 shrink-0">•</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-rose-600 dark:text-rose-400 mb-2 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-rose-500" />
              Red Flags to Watch For:
            </h4>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-300">
              {AI_CRITERIA_GUIDES[activeCriteriaCategory]?.redFlags.map((rf, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-rose-50 dark:bg-rose-950/30 p-2 rounded-lg">
                  <span className="font-bold text-rose-500 shrink-0">⚠</span>
                  <span>{rf}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setShowCriteriaModal(false)}
            className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2 text-xs font-bold"
          >
            Got It
          </button>
        </div>
      </Modal>
    </div>
  );
};
