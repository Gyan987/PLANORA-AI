import {
  Calendar,
  CheckCircle2,
  Download,
  FileText,
  Printer,
  Sparkles,
  Users,
  Wallet
} from 'lucide-react';
import React, { useState } from 'react';
import { useEventContext } from '../context/EventContext';
import { formatINR } from '../utils/currency';

export const ExportPage: React.FC = () => {
  const { activeEvent } = useEventContext();
  const [isExporting, setIsExporting] = useState(false);

  if (!activeEvent) return null;

  const handleGeneratePDF = async () => {
    setIsExporting(true);

    try {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
      ]);

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Header Banner
      doc.setFillColor(79, 70, 229); // Deep Indigo
      doc.rect(0, 0, 210, 32, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('PLANORA AI — MASTER EVENT PLAN', 14, 16);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Your Celebration. Our Intelligence. | Powered by Google Gemini', 14, 24);

      // Event Metadata Grid
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(activeEvent.name, 14, 42);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Type: ${activeEvent.type.toUpperCase()}  |  City: ${activeEvent.city}  |  Date: ${activeEvent.date}`, 14, 48);
      doc.text(`Guests: ${activeEvent.guests}  |  Total Budget: Rs. ${activeEvent.totalBudget.toLocaleString('en-IN')}  |  Setting: ${activeEvent.indoorOutdoor}`, 14, 53);

      // Overview text
      doc.setTextColor(51, 65, 85);
      doc.setFontSize(9);
      const splitOverview = doc.splitTextToSize(activeEvent.overviewSummary, 182);
      doc.text(splitOverview, 14, 60);

      let currentY = 60 + splitOverview.length * 4.5 + 6;

      // 1. Budget Breakdown Table
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229);
      doc.text('1. ITEMIZED BUDGET BREAKDOWN', 14, currentY);
      currentY += 4;

      const budgetRows = activeEvent.budgetCategories.map((cat) => [
        cat.name,
        `Rs. ${cat.allocatedAmount.toLocaleString('en-IN')}`,
        `Rs. ${cat.actualAmount.toLocaleString('en-IN')}`,
        `${cat.percentage}%`,
        cat.notes || '-'
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['Category', 'Planned (INR)', 'Actual Paid', 'Share %', 'Notes']],
        body: budgetRows,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229], fontSize: 8 },
        styles: { fontSize: 8, cellPadding: 2 },
        margin: { left: 14, right: 14 }
      });

      // @ts-ignore
      currentY = doc.lastAutoTable.finalY + 10;

      // Check if we need a new page
      if (currentY > 240) {
        doc.addPage();
        currentY = 20;
      }

      // 2. Preparation Timeline
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229);
      doc.text('2. PREPARATION MILESTONES & TIMELINE', 14, currentY);
      currentY += 4;

      const taskRows = activeEvent.tasks.map((t) => [
        t.dueDate,
        t.priority,
        t.category,
        t.title,
        t.completed ? 'COMPLETED' : 'PENDING'
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['Due Date', 'Priority', 'Category', 'Milestone', 'Status']],
        body: taskRows,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229], fontSize: 8 },
        styles: { fontSize: 8, cellPadding: 2 },
        margin: { left: 14, right: 14 }
      });

      // @ts-ignore
      currentY = doc.lastAutoTable.finalY + 10;

      if (currentY > 230) {
        doc.addPage();
        currentY = 20;
      }

      // 3. Event-Day Schedule
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229);
      doc.text('3. EVENT-DAY ITINERARY', 14, currentY);
      currentY += 4;

      const scheduleRows = (activeEvent.daySchedule || []).map((s) => [
        s.time,
        s.activity,
        s.location || '-',
        s.responsiblePerson || '-'
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['Time', 'Activity', 'Location', 'Lead Person']],
        body: scheduleRows,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229], fontSize: 8 },
        styles: { fontSize: 8, cellPadding: 2 },
        margin: { left: 14, right: 14 }
      });

      // @ts-ignore
      currentY = doc.lastAutoTable.finalY + 10;

      if (currentY > 230) {
        doc.addPage();
        currentY = 20;
      }

      // 4. Vendors Checklist
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229);
      doc.text('4. VENDOR CONTRACTS & BOOKINGS', 14, currentY);
      currentY += 4;

      const vendorRows = activeEvent.vendors.map((v) => [
        v.category,
        v.name,
        `Rs. ${v.agreedPrice.toLocaleString('en-IN')}`,
        v.bookingStatus,
        v.paymentStatus,
        v.phone || '-'
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['Category', 'Vendor Name', 'Agreed Price', 'Booking', 'Payment', 'Phone']],
        body: vendorRows,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229], fontSize: 8 },
        styles: { fontSize: 8, cellPadding: 2 },
        margin: { left: 14, right: 14 }
      });

      // @ts-ignore
      currentY = doc.lastAutoTable.finalY + 10;

      if (currentY > 240) {
        doc.addPage();
        currentY = 20;
      }

      // 5. Risk Safeguards
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229);
      doc.text('5. RISK SAFEGUARDS & CONTINGENCY', 14, currentY);
      currentY += 4;

      const riskRows = activeEvent.risks.map((r) => [
        r.severity,
        r.description,
        r.recommendedAction,
        r.deadline
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['Severity', 'Identified Risk', 'Recommended Action', 'Deadline']],
        body: riskRows,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229], fontSize: 8 },
        styles: { fontSize: 8, cellPadding: 2 },
        margin: { left: 14, right: 14 }
      });

      // Footer pagination on all pages
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Planora AI • Document generated on ${new Date().toLocaleDateString()} • Page ${i} of ${pageCount}`,
          14,
          290
        );
      }

      // Download
      const safeFilename = `${activeEvent.name.replace(/[^a-zA-Z0-9]/g, '_')}_Planora_Plan.pdf`;
      doc.save(safeFilename);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Export Event Plan
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generate and download a professional, multi-page PDF document formatted for family and vendors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <Printer className="h-4 w-4" />
            Print View
          </button>

          <button
            onClick={handleGeneratePDF}
            disabled={isExporting}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-5 py-2 text-xs font-bold text-white shadow-soft-sm hover:opacity-95 transition"
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Generating PDF...' : 'Download Plan as PDF'}
          </button>
        </div>
      </div>

      {/* Printable Preview Container */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-soft-lg dark:border-slate-800 dark:bg-slate-900 space-y-8">
        {/* Document Header */}
        <div className="border-b-2 border-brand-600 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl font-black text-brand-600">Planora AI</span>
              <span className="text-xs font-bold text-slate-400">| Certified Event Plan</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">{activeEvent.name}</h2>
            <p className="text-xs text-slate-500 mt-1">
              {activeEvent.city} • {activeEvent.date} • {activeEvent.guests} Guests • {formatINR(activeEvent.totalBudget)} Budget
            </p>
          </div>

          <div className="text-right text-xs text-slate-400">
            <p>Plan ID: {activeEvent.id.substring(0, 12)}</p>
            <p>Status: Active Blueprint</p>
          </div>
        </div>

        {/* Narrative Overview */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Executive Summary</h3>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            {activeEvent.overviewSummary}
          </p>
        </div>

        {/* Budget Table Preview */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">1. Budget Breakdown</h3>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-[10px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Allocated Amount</th>
                  <th className="py-2.5 px-3">Actual Spent</th>
                  <th className="py-2.5 px-3">Share</th>
                  <th className="py-2.5 px-3">Inclusions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeEvent.budgetCategories.map((cat) => (
                  <tr key={cat.id}>
                    <td className="py-2.5 px-3 font-semibold">{cat.name}</td>
                    <td className="py-2.5 px-3 font-bold">{formatINR(cat.allocatedAmount)}</td>
                    <td className="py-2.5 px-3">{formatINR(cat.actualAmount)}</td>
                    <td className="py-2.5 px-3">{cat.percentage}%</td>
                    <td className="py-2.5 px-3 text-slate-400">{cat.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Milestones Preview */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">2. Preparation Milestones</h3>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-[10px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Milestone Action</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeEvent.tasks.map((t) => (
                  <tr key={t.id}>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{t.dueDate}</td>
                    <td className="py-2.5 px-3 font-bold">{t.priority}</td>
                    <td className="py-2.5 px-3">{t.category}</td>
                    <td className="py-2.5 px-3">{t.title}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {t.completed ? 'Done' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vendors Preview */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">3. Contracted Vendors</h3>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-[10px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Vendor</th>
                  <th className="py-2.5 px-3">Agreed Amount</th>
                  <th className="py-2.5 px-3">Booking Status</th>
                  <th className="py-2.5 px-3">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeEvent.vendors.map((v) => (
                  <tr key={v.id}>
                    <td className="py-2.5 px-3 font-bold text-brand-600">{v.category}</td>
                    <td className="py-2.5 px-3 font-semibold">{v.name}</td>
                    <td className="py-2.5 px-3 font-bold">{formatINR(v.agreedPrice)}</td>
                    <td className="py-2.5 px-3">{v.bookingStatus}</td>
                    <td className="py-2.5 px-3 text-slate-500">{v.phone || v.email || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
