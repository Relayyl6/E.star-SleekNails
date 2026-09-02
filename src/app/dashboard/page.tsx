'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase/config';
import { toast } from 'sonner';
import { useSettings } from '@/context/SettingsContext';

export default function MyBookingsPage() {
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Past' | 'Waitlist'>('Upcoming');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyBookings = async (user: any) => {
      if (!user) return;
      setLoading(true);
      try {
        // Prefer matching by userId (more reliable than email if user changes email)
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
        } catch(e) {}
        
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
        
        // Sort bookings by date and time (newest first)
        const sortedBookings = allData.sort((a: any, b: any) => {
          const dateA = new Date(`${a.date} ${a.time || '00:00'}`).getTime();
          const dateB = new Date(`${b.date} ${b.time || '00:00'}`).getTime();
          return dateB - dateA;
        });
        
        setBookings(sortedBookings);
        
        // Clear guest refs once successfully fetched and auto-linked
        if (guestRefs) {
          localStorage.removeItem('guest_booking_refs');
        }
      } catch (error) {
        console.error("Error fetching bookings", error);
        toast.error("Failed to fetch bookings.");
      }
      setLoading(false);
    };
    
    // Listen for auth state since this is a client component
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchMyBookings(user);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Simple mock filtering based on status/dates (you'd refine this with actual Date objects)
  const filteredBookings = bookings.filter(b => {
    const status = (b.status || '').toUpperCase();
    if (activeTab === 'Waitlist') return status === 'WAITLIST';
    if (activeTab === 'Upcoming') return status === 'CONFIRMED' || status === 'PENDING';
    return status === 'COMPLETED' || status === 'CANCELLED';
  });

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleCancel = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this appointment? This action cannot be undone.")) return;
    
    try {
      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'CANCELLED' })
      });
      
      if (res.ok) {
        toast.success("Booking cancelled successfully.");
        // Update local state to move it to 'Past' (Cancelled)
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b));
      } else {
        toast.error("Failed to cancel booking.");
      }
    } catch (e) {
      toast.error("An error occurred.");
    }
  };

  const handleDownloadInvoice = (booking: any) => {
    const docTitle = booking.status?.toUpperCase() === 'COMPLETED' ? 'OFFICIAL RECEIPT' : booking.status?.toUpperCase() === 'PENDING' ? 'PAYMENT REQUEST' : 'INVOICE';
    
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
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
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
              <p style="color: #666; margin-bottom: 4px; font-size: 12px; text-transform: uppercase;">Bill To</p>
              <p style="margin: 0; font-weight: bold;">${booking.firstName} ${booking.lastName}</p>
              <p style="margin: 4px 0;">${booking.email}</p>
              <p style="margin: 0;">${booking.phone}</p>
            </div>
            <div class="text-right">
              <p style="color: #666; margin-bottom: 4px; font-size: 12px; text-transform: uppercase;">Service Details</p>
              <p style="margin: 0;">Date: <strong>${new Date(booking.date + "T12:00:00").toLocaleDateString()}</strong></p>
              <p style="margin: 4px 0;">Time: <strong>${booking.time || 'N/A'}</strong></p>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Service Description</th>
                <th>Qty</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
                ${booking.items?.map((item: any) => `
                  <tr>
                    <td>
                      <div>${item.name}</div>
                      <div style="font-size: 11px; color: #666; margin-top: 4px;">
                        ${item.selectedLength ? `<div>&bull; Length: ${item.selectedLength.name}</div>` : ''}
                        ${item.selectedDesign ? `<div>&bull; Design: ${item.selectedDesign.name}</div>` : ''}
                        ${item.selectedExtras?.map((e: any) => `<div>&bull; Extra: ${e.name}</div>`).join('') || ''}
                      </div>
                    </td>
                    <td style="vertical-align: top;">${item.quantity || 1}</td>
                    <td style="text-align: right; vertical-align: top;">${item.price}</td>
                  </tr>
                `).join('') || `<tr><td>Custom Service</td><td>1</td><td style="text-align: right;">-</td></tr>`}
                <tr class="total-row">
                <td colspan="2" style="text-align: right; padding-top: 20px;">Total Amount:</td>
                <td style="text-align: right; font-size: 18px; padding-top: 20px;">${String(booking.total || '0').includes('₦') ? booking.total : `₦${booking.total || '0'}`}</td>
              </tr>
            </tbody>
          </table>
          
          ${(booking.status?.toUpperCase() === 'PENDING') ? `
          <div style="margin-top: 40px; padding: 20px; background-color: #f9f9f9; border-left: 4px solid #1A1414;">
            <h3 style="margin-top: 0; color: #1A1414; font-size: 14px; text-transform: uppercase;">Payment Instructions</h3>
            <p style="margin: 0; font-size: 13px; line-height: 1.5; white-space: pre-wrap;">Please transfer your payment to the following account to confirm your booking:<br/><br/><strong>${settings?.bankDetails?.trim() ? settings.bankDetails : 'GTBank\\n0123456789\\nE.star SleekNails'}</strong></p>
          </div>
          ` : ''}
          
          <div style="margin-top: 60px; font-size: 12px; color: #666; text-align: center;">
            <p>Thank you for choosing E.star SleekNails.</p>
            <p>If you have any questions about this invoice, please contact us.</p>
          </div>
          
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;
    const blob = new Blob([invoiceHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-black/5">
      <h1 className="text-3xl font-serif text-[#1A1414] mb-8">My Bookings</h1>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-100 mb-8 overflow-x-auto [&::-webkit-scrollbar]:hidden">
        {['Upcoming', 'Past', 'Waitlist'].map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab as any); setExpandedId(null); }}
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
          {filteredBookings.map(booking => (
            <div key={booking.id} className="p-5 border border-gray-100 rounded-2xl hover:border-black/10 transition-colors flex flex-col gap-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-lg truncate">
                      {new Date(booking.date + "T12:00:00").toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      {booking.time ? ` at ${booking.time}` : ''}
                    </h3>
                    <span className={`shrink-0 text-xs font-medium px-2 py-1 rounded-md uppercase ${booking.status?.toUpperCase() === 'CANCELLED' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                      {booking.status || 'PENDING'}
                    </span>
                  </div>
                  {booking.status?.toUpperCase() !== 'WAITLIST' ? (
                    <p className="text-gray-500 text-sm truncate">
                      {booking.items?.map((i:any) => i.name).join(', ') || 'Custom Service'} • <span className="font-semibold text-primary">{booking.total || '₦0'}</span>
                    </p>
                  ) : (
                    <p className="text-gray-500 text-sm truncate">
                      Requested Date
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2 w-full md:w-auto shrink-0">
                  {booking.status?.toUpperCase() !== 'WAITLIST' && (
                    <button 
                      onClick={() => setExpandedId(expandedId === booking.id ? null : booking.id)}
                      className="flex-1 md:flex-none px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                    >
                      {expandedId === booking.id ? 'Hide Details' : 'Details'}
                    </button>
                  )}
                  {activeTab === 'Upcoming' && booking.status?.toUpperCase() !== 'CANCELLED' && (
                    <button 
                      onClick={() => handleCancel(booking.id)}
                      className="flex-1 md:flex-none px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
              
              {/* Expanded Details */}
              {expandedId === booking.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm animate-in fade-in slide-in-from-top-4 duration-300">
                  <div>
                    <p className="text-gray-500 mb-1">Reference ID</p>
                    <p className="font-mono font-medium">{booking.ref || booking.id}</p>
                    
                    <p className="text-gray-500 mb-1 mt-4">Contact Info</p>
                    <p className="font-medium">{booking.firstName} {booking.lastName}</p>
                    <p className="text-gray-600">{booking.email}</p>
                    <p className="text-gray-600">{booking.phone}</p>
                  </div>
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
                                {item.selectedLength && <div>+ {item.selectedLength.name} (+₦{item.selectedLength.price.toLocaleString()})</div>}
                                {item.selectedDesign && <div>+ {item.selectedDesign.name} (+₦{item.selectedDesign.price.toLocaleString()})</div>}
                                {item.selectedExtras?.map((ex: any, i: number) => (
                                  <div key={i}>+ {ex.name} (+₦{ex.price.toLocaleString()})</div>
                                ))}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    
                    {booking.notes && (
                      <>
                        <p className="text-gray-500 mb-1 mt-4">Special Notes</p>
                        <p className="bg-gray-50 p-3 rounded-lg text-gray-700 italic border border-gray-100">{booking.notes}</p>
                      </>
                    )}

                    <div className="mt-6">
                      <button
                        onClick={() => handleDownloadInvoice(booking)}
                        className="flex items-center justify-center gap-2 w-full md:w-auto px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        {booking.status?.toUpperCase() === 'COMPLETED' ? 'Download Receipt' : 'Download Invoice'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
