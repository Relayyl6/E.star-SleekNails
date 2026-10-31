'use client';

import { useState, useEffect, useRef } from 'react';
import { auth } from '@/lib/firebase/config';
import { toast } from 'sonner';
import { useSettings } from '@/context/SettingsContext';

// ─── Types ────────────────────────────────────────────────────────────────────
interface EditState {
  notes: string;
  phone: string;
  instagram: string;
  inspirationLink: string;
  photoUrl: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function statusBadgeClass(status: string) {
  const s = (status || '').toUpperCase();
  if (s === 'CANCELLED') return 'bg-red-50 text-red-600';
  if (s === 'CONFIRMED') return 'bg-green-50 text-green-700';
  if (s === 'COMPLETED') return 'bg-blue-50 text-blue-700';
  if (s === 'PENDING_VERIFICATION') return 'bg-amber-50 text-amber-800';
  return 'bg-gray-100 text-gray-600';
}

function statusLabel(status: string) {
  const s = (status || '').toUpperCase();
  if (s === 'PENDING_VERIFICATION') return 'PENDING (VERIFY)';
  return s || 'PENDING';
}

function canEdit(booking: any) {
  const s = (booking.status || '').toUpperCase();
  return s !== 'CANCELLED' && s !== 'WAITLIST';
}

function isDepositPaid(booking: any) {
  const s = (booking.status || '').toUpperCase();
  return s === 'CONFIRMED' || s === 'COMPLETED';
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MyBookingsPage() {
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Past' | 'Waitlist'>('Upcoming');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({
    notes: '', phone: '', instagram: '', inspirationLink: '', photoUrl: ''
  });
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Data Fetching ──────────────────────────────────────────────────────────
  const fetchMyBookings = async (user: any) => {
    if (!user) return;
    setLoading(true);
    try {
      const uid = user.uid;
      const email = user.email;

      let guestRefs = '';
      try {
        const refsStr = localStorage.getItem('guest_booking_refs');
        if (refsStr) {
          const parsed = JSON.parse(refsStr);
          if (Array.isArray(parsed) && parsed.length > 0) {
            guestRefs = parsed.join(',');
          }
        }
      } catch (e) {}

      const [bookingsRes, waitlistRes] = await Promise.all([
        fetch(`/api/bookings?type=full&userId=${encodeURIComponent(uid)}&email=${encodeURIComponent(email || '')}&guestRefs=${encodeURIComponent(guestRefs)}&_t=${Date.now()}`),
        fetch(`/api/waitlist?email=${encodeURIComponent(email || '')}&_t=${Date.now()}`)
      ]);

      let allData: any[] = [];

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        allData = [...allData, ...bookingsData];
      }

      if (waitlistRes.ok) {
        const waitlistData = await waitlistRes.json();
        allData = [...allData, ...waitlistData];
      }

      // Sort by date desc (newest first)
      const sortedBookings = allData.sort((a: any, b: any) => {
        const dateA = new Date(`${a.date} ${a.time || '00:00'}`).getTime();
        const dateB = new Date(`${b.date} ${b.time || '00:00'}`).getTime();
        return dateB - dateA;
      });

      setBookings(sortedBookings);

      // Clear guest refs once fetched and auto-linked
      if (guestRefs) {
        localStorage.removeItem('guest_booking_refs');
      }
    } catch (error) {
      console.error('Error fetching bookings', error);
      toast.error('Failed to fetch bookings.');
    }
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user: any) => {
      if (user) {
        fetchMyBookings(user);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Filter by tab ──────────────────────────────────────────────────────────
  const filteredBookings = bookings.filter(b => {
    const status = (b.status || '').toUpperCase();
    if (activeTab === 'Waitlist') return status === 'WAITLIST';
    if (activeTab === 'Upcoming') return status === 'CONFIRMED' || status === 'PENDING' || status === 'PENDING_VERIFICATION' || !status;
    return status === 'COMPLETED' || status === 'CANCELLED';
  });

  // ── Edit Handlers ──────────────────────────────────────────────────────────
  const startEdit = (booking: any) => {
    setEditingId(booking.id);
    setEditState({
      notes: booking.notes || '',
      phone: booking.phone || '',
      instagram: booking.instagram || '',
      inspirationLink: booking.inspirationLink || '',
      photoUrl: booking.photoUrl || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setSaving(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_MB = 10;
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`Image must be under ${MAX_MB}MB`);
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      const url: string = data.url || data.blobUrl || data.downloadUrl || '';
      if (!url) throw new Error('No URL returned from upload');
      setEditState(prev => ({ ...prev, photoUrl: url, inspirationLink: '' }));
      toast.success('Photo uploaded!');
    } catch (err: any) {
      toast.error(err?.message || 'Photo upload failed.');
    }
    setUploadingPhoto(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveEdit = async (booking: any) => {
    if (!editingId) return;
    setSaving(true);

    // Only send changed fields
    const payload: any = { id: editingId };
    if (editState.notes !== (booking.notes || '')) payload.notes = editState.notes;
    if (editState.phone !== (booking.phone || '')) payload.phone = editState.phone;
    if (editState.instagram !== (booking.instagram || '')) payload.instagram = editState.instagram;
    if (editState.inspirationLink !== (booking.inspirationLink || '')) payload.inspirationLink = editState.inspirationLink;
    if (editState.photoUrl !== (booking.photoUrl || '')) payload.photoUrl = editState.photoUrl;

    if (Object.keys(payload).length === 1) {
      toast.info('No changes to save.');
      setSaving(false);
      setEditingId(null);
      return;
    }

    try {
      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        // Reflect changes immediately in local state
        setBookings(prev =>
          prev.map(b =>
            b.id === editingId
              ? {
                  ...b,
                  notes: editState.notes,
                  phone: editState.phone,
                  instagram: editState.instagram,
                  inspirationLink: editState.inspirationLink,
                  photoUrl: editState.photoUrl,
                }
              : b
          )
        );
        toast.success('Changes saved successfully!');
        setEditingId(null);
      } else {
        toast.error(data?.error || 'Failed to save changes.');
      }
    } catch {
      toast.error('An error occurred while saving.');
    }
    setSaving(false);
  };

  // ── Cancel Booking ─────────────────────────────────────────────────────────
  const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this appointment? This action cannot be undone.')) return;

    try {
      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'CANCELLED' }),
      });

      if (res.ok) {
        toast.success('Booking cancelled successfully.');
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b));
      } else {
        const data = await res.json();
        toast.error(data?.error || 'Failed to cancel booking.');
      }
    } catch {
      toast.error('An error occurred.');
    }
  };

  // ── Download Invoice / Receipt ─────────────────────────────────────────────
  const handleDownloadInvoice = (booking: any) => {
    const isPending = !booking.status || booking.status?.toUpperCase() === 'PENDING' || booking.status?.toUpperCase() === 'PENDING_VERIFICATION';
    const docTitle = booking.status?.toUpperCase() === 'COMPLETED' ? 'OFFICIAL RECEIPT' : isPending ? 'PAYMENT REQUEST' : 'INVOICE';

    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${docTitle} - ${booking.ref || booking.id}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
            .header { border-bottom: 2px solid #1A1414; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; }
            h1 { margin: 0; color: #1A1414; }
            .text-right { text-align: right; }
            table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
            th { background-color: #f9f9f9; color: #666; font-size: 12px; text-transform: uppercase; }
            .total-row td { font-weight: bold; border-top: 2px solid #333; }
            .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; background: #eee; }
            .flex-between { display: flex; justify-content: space-between; }
            @media print { body { padding: 0; } button { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>${docTitle}</h1>
              <p>Reference: <strong>${booking.ref || booking.id}</strong></p>
              <p>Date Issued: ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="text-right">
              <h2 style="margin:0;">E.star SleekNails</h2>
              <p>Status: <span class="status">${booking.status || 'PENDING'}</span></p>
            </div>
          </div>
          <div class="flex-between">
            <div>
              <p style="color:#666;margin-bottom:4px;font-size:12px;text-transform:uppercase;">Bill To</p>
              <p style="margin:0;font-weight:bold;">${booking.firstName} ${booking.lastName}</p>
              <p style="margin:4px 0;">${booking.email}</p>
              <p style="margin:0;">${booking.phone}</p>
            </div>
            <div class="text-right">
              <p style="color:#666;margin-bottom:4px;font-size:12px;text-transform:uppercase;">Service Details</p>
              <p style="margin:0;">Date: <strong>${new Date(booking.date + 'T12:00:00').toLocaleDateString()}</strong></p>
              <p style="margin:4px 0;">Time: <strong>${booking.time || 'N/A'}</strong></p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Service Description</th>
                <th>Qty</th>
                <th style="text-align:right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${booking.items?.map((item: any) => `
                <tr>
                  <td>
                    <div>${item.name}</div>
                    <div style="font-size:11px;color:#666;margin-top:4px;">
                      ${item.selectedLength ? `<div>&bull; Length: ${item.selectedLength.name}</div>` : ''}
                      ${item.selectedDesign ? `<div>&bull; Design: ${item.selectedDesign.name}</div>` : ''}
                      ${item.selectedExtras?.map((e: any) => `<div>&bull; Extra: ${e.name}</div>`).join('') || ''}
                    </div>
                  </td>
                  <td style="vertical-align:top;">${item.quantity || 1}</td>
                  <td style="text-align:right;vertical-align:top;">${item.price}</td>
                </tr>
              `).join('') || '<tr><td>Custom Service</td><td>1</td><td style="text-align:right;">-</td></tr>'}
              <tr class="total-row">
                <td colspan="2" style="text-align:right;padding-top:20px;">${(() => { const hp = booking.items?.some((i: any) => i.selectedExtras?.length > 0 || i.selectedDesign?.hasPlus || i.isFreestyle); return hp ? 'Total Estimated:' : 'Total Amount:'; })()}</td>
                <td style="text-align:right;font-size:18px;padding-top:20px;">${(() => { const rawTotal = String(booking.total || '0'); const hasNaira = rawTotal.includes('₦'); const hasPlus = booking.items?.some((i: any) => i.selectedExtras?.length > 0 || i.selectedDesign?.hasPlus || i.isFreestyle) || rawTotal.includes('+'); const formatted = hasNaira ? rawTotal : `₦${rawTotal}`; return hasPlus && !formatted.includes('+') ? formatted + '+' : formatted; })()}</td>
              </tr>
            </tbody>
          </table>
          ${isPending ? `
          <div style="margin-top:40px;padding:20px;background-color:#f9f9f9;border-left:4px solid #1A1414;">
            <h3 style="margin-top:0;color:#1A1414;font-size:14px;text-transform:uppercase;">Payment Instructions</h3>
            <p style="margin:0;font-size:13px;line-height:1.5;white-space:pre-wrap;">Please transfer your payment to the following account to confirm your booking:<br/><br/><strong>${settings?.bankDetails?.trim() ? settings.bankDetails : 'Moniepoint MFB\\n7049022919\\nE.star Sleeknails Luxury Studio - E_star Sleeknails'}</strong></p>
          </div>` : ''}
          <div style="margin-top:60px;font-size:12px;color:#666;text-align:center;">
            <p>Thank you for choosing E.star SleekNails.</p>
            <p>If you have any questions about this invoice, please contact us.</p>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `;
    const blob = new Blob([invoiceHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-black/5">
      <h1 className="text-3xl font-serif text-[#1A1414] mb-8">My Bookings</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 mb-8 overflow-x-auto [&::-webkit-scrollbar]:hidden">
        {(['Upcoming', 'Past', 'Waitlist'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setExpandedId(null); setEditingId(null); }}
            className={`px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === tab
                ? 'border-[#1A1414] text-[#1A1414]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A1414]"></div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-500 font-medium">No {activeTab.toLowerCase()} bookings found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Hidden file input for photo upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
          />

          {filteredBookings.map(booking => {
            const isExpanded = expandedId === booking.id;
            const isEditing = editingId === booking.id;
            const depositPaid = isDepositPaid(booking);
            const editable = canEdit(booking);

            return (
              <div key={booking.id} className="p-5 border border-gray-100 rounded-2xl hover:border-black/10 transition-colors flex flex-col gap-4">

                {/* ── Booking Card Header ─────────────────────────────── */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-lg truncate">
                        {new Date(booking.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        {booking.time ? ` at ${booking.time}` : ''}
                      </h3>
                      <span className={`shrink-0 text-xs font-medium px-2 py-1 rounded-md uppercase ${statusBadgeClass(booking.status)}`}>
                        {statusLabel(booking.status)}
                      </span>
                    </div>
                    {(booking.status || '').toUpperCase() !== 'WAITLIST' ? (
                      <p className="text-gray-500 text-sm truncate">
                        {booking.items?.map((i: any) => i.name).join(', ') || 'Custom Service'} •{' '}
                        <span className="font-semibold text-primary">{booking.total || '₦0'}</span>
                      </p>
                    ) : (
                      <p className="text-gray-500 text-sm truncate">Requested Date</p>
                    )}
                  </div>

                  <div className="flex gap-2 w-full md:w-auto shrink-0">
                    {(booking.status || '').toUpperCase() !== 'WAITLIST' && (
                      <button
                        onClick={() => {
                          if (isExpanded) { setExpandedId(null); setEditingId(null); }
                          else { setExpandedId(booking.id); setEditingId(null); }
                        }}
                        className="flex-1 md:flex-none px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                      >
                        {isExpanded ? 'Hide Details' : 'Details'}
                      </button>
                    )}
                    {activeTab === 'Upcoming' && (booking.status || '').toUpperCase() !== 'CANCELLED' && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="flex-1 md:flex-none px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* ── Expanded Panel ──────────────────────────────────── */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300 space-y-6">

                    {/* ════ VIEW MODE ════ */}
                    {!isEditing && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">

                          {/* Left: contact & notes */}
                          <div>
                            <p className="text-gray-500 mb-1">Reference ID</p>
                            <p className="font-mono font-medium">{booking.ref || booking.id}</p>

                            <p className="text-gray-500 mb-1 mt-4">Contact Info</p>
                            <p className="font-medium">{booking.firstName} {booking.lastName}</p>
                            <p className="text-gray-600">{booking.email}</p>
                            <p className="text-gray-600">{booking.phone}</p>
                            {booking.instagram && (
                              <p className="text-gray-600">@{booking.instagram}</p>
                            )}

                            {booking.notes && (
                              <>
                                <p className="text-gray-500 mb-1 mt-4">Special Notes</p>
                                <p className="bg-gray-50 p-3 rounded-lg text-gray-700 italic border border-gray-100">{booking.notes}</p>
                              </>
                            )}
                          </div>

                          {/* Right: services & inspiration */}
                          <div>
                            <p className="text-gray-500 mb-1">Services Breakdown</p>
                            <ul className="space-y-3 mb-4">
                              {booking.items?.map((item: any, idx: number) => (
                                <li key={idx} className="flex flex-col">
                                  <div className="flex justify-between w-full">
                                    <span className="font-medium text-gray-900">{item.name} x{item.quantity || 1}</span>
                                    <span className="font-medium whitespace-nowrap ml-2">{item.price}</span>
                                  </div>
                                  {(item.selectedLength || item.selectedDesign || (item.selectedExtras && item.selectedExtras.length > 0)) && (
                                    <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                                      {item.selectedLength && <div>+ {item.selectedLength.name} (+ ₦{item.selectedLength.price.toLocaleString()})</div>}
                                      {item.selectedDesign && <div>+ {item.selectedDesign.name} (+ ₦{item.selectedDesign.price.toLocaleString()})</div>}
                                      {item.selectedExtras?.map((ex: any, i: number) => (
                                        <div key={i}>+ {ex.name} (+ ₦{ex.price.toLocaleString()})</div>
                                      ))}
                                    </div>
                                  )}
                                </li>
                              ))}
                            </ul>

                            {/* Nail inspiration preview */}
                            {(booking.photoUrl || booking.inspirationLink) && (
                              <>
                                <p className="text-gray-500 mb-2">Nail Inspiration</p>
                                {booking.photoUrl && booking.photoUrl.startsWith('http') && !booking.photoUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                                  <a href={booking.photoUrl} target="_blank" rel="noopener noreferrer">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={booking.photoUrl}
                                      alt="Nail inspiration"
                                      className="w-full max-w-[200px] h-32 object-cover rounded-xl border border-gray-200 hover:opacity-80 transition-opacity cursor-pointer"
                                    />
                                  </a>
                                ) : booking.inspirationLink ? (
                                  <a
                                    href={booking.inspirationLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-blue-600 underline text-sm hover:text-blue-800"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    View inspiration link
                                  </a>
                                ) : null}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Action buttons row */}
                        <div className="flex flex-wrap gap-3 pt-2">
                          <button
                            onClick={() => handleDownloadInvoice(booking)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            {booking.status?.toUpperCase() === 'COMPLETED' ? 'Download Receipt' : 'Download Invoice'}
                          </button>

                          {editable && (
                            <button
                              onClick={() => startEdit(booking)}
                              className="flex items-center gap-2 px-4 py-2 bg-[#1A1414] text-white rounded-lg text-sm font-semibold hover:bg-[#333] transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit Booking
                            </button>
                          )}
                        </div>
                      </>
                    )}

                    {/* ════ EDIT MODE ════ */}
                    {isEditing && (
                      <div className="space-y-5 text-sm">

                        {/* Policy notice */}
                        <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                          <svg className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="font-semibold text-amber-800">Service package is locked</p>
                            <p className="text-amber-700 text-xs mt-0.5">
                              {depositPaid
                                ? 'Deposit paid — contact the studio to change services or reschedule your appointment.'
                                : 'Contact the studio to change your selected services or total.'}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* Phone */}
                          <div>
                            <label className="block text-gray-500 mb-1.5 font-medium">Phone Number</label>
                            <input
                              type="tel"
                              value={editState.phone}
                              onChange={e => setEditState(prev => ({ ...prev, phone: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
                              placeholder="+234 800 000 0000"
                            />
                          </div>

                          {/* Instagram */}
                          <div>
                            <label className="block text-gray-500 mb-1.5 font-medium">
                              Instagram Handle <span className="font-normal text-gray-400">(optional)</span>
                            </label>
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-black/10">
                              <span className="px-3 text-gray-400 bg-gray-50 border-r border-gray-200 py-2 select-none">@</span>
                              <input
                                type="text"
                                value={editState.instagram}
                                onChange={e => setEditState(prev => ({ ...prev, instagram: e.target.value.replace(/^@/, '') }))}
                                className="flex-1 px-3 py-2 focus:outline-none"
                                placeholder="yourusername"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Special Notes */}
                        <div>
                          <label className="block text-gray-500 mb-1.5 font-medium">
                            Special Notes / Requests <span className="font-normal text-gray-400">(optional)</span>
                          </label>
                          <textarea
                            rows={3}
                            value={editState.notes}
                            onChange={e => setEditState(prev => ({ ...prev, notes: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 resize-none"
                            placeholder="Any special requests or notes for the studio…"
                          />
                        </div>

                        {/* Nail Inspiration */}
                        <div>
                          <label className="block text-gray-500 mb-2 font-medium">Nail Inspiration</label>

                          {/* Current image preview with remove button */}
                          {editState.photoUrl && editState.photoUrl.startsWith('http') && !editState.photoUrl.match(/\.(mp4|webm|ogg)$/i) && (
                            <div className="mb-3 relative inline-block">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={editState.photoUrl}
                                alt="Current inspiration"
                                className="w-32 h-32 object-cover rounded-xl border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => setEditState(prev => ({ ...prev, photoUrl: '', inspirationLink: '' }))}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold hover:bg-red-600 transition-colors"
                                title="Remove photo"
                              >
                                ×
                              </button>
                            </div>
                          )}

                          <div className="flex flex-col gap-3">
                            {/* Upload button */}
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={uploadingPhoto}
                              className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-50 w-fit"
                            >
                              {uploadingPhoto ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                                  Uploading…
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  Upload a photo
                                </>
                              )}
                            </button>

                            {/* Divider */}
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-px bg-gray-200" />
                              <span className="text-xs text-gray-400 uppercase tracking-wide">or paste a link</span>
                              <div className="flex-1 h-px bg-gray-200" />
                            </div>

                            {/* Inspiration URL */}
                            <input
                              type="url"
                              value={editState.inspirationLink}
                              onChange={e => setEditState(prev => ({ ...prev, inspirationLink: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 text-sm"
                              placeholder="https://pinterest.com/pin/... or Instagram link"
                            />
                          </div>
                        </div>

                        {/* Save / Discard */}
                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={() => handleSaveEdit(booking)}
                            disabled={saving || uploadingPhoto}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#1A1414] text-white rounded-lg text-sm font-semibold hover:bg-[#333] transition-colors disabled:opacity-50"
                          >
                            {saving ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Saving…
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Save Changes
                              </>
                            )}
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={saving}
                            className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                          >
                            Discard
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
