'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useSettings } from '@/context/SettingsContext';

export default function VendorDashboardPage() {
  const { settings } = useSettings();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportConfig, setExportConfig] = useState({
    startDate: '',
    endDate: '',
    status: 'ALL', // ALL, PENDING, CONFIRMED, WAITLIST, CANCELLED
    sortBy: 'date' // date, price
  });

  const fetchBookings = async () => {
    try {
      const [bookingsRes, waitlistRes] = await Promise.all([
        fetch(`/api/bookings?type=full&_t=${Date.now()}`),
        fetch(`/api/waitlist?_t=${Date.now()}`)
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
      
      // Sort by when it was booked (most recent first)
      const sorted = allData.sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt || a.date).getTime();
        const dateB = new Date(b.createdAt || b.date).getTime();
        return dateB - dateA;
      });
      
      setBookings(sorted);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error('Failed to load bookings');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateBookingStatus = async (id: string, newStatus: string, currentStatus?: string) => {
    if (newStatus === 'CANCELLED') {
      if (!window.confirm("Are you sure you want to cancel this booking? An email will be sent to the client.")) return;
    }
    try {
      if (currentStatus === 'WAITLIST' && newStatus === 'CANCELLED') {
        // Waitlist entries are simply deleted
        const res = await fetch(`/api/waitlist?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
          toast.success('Removed from waitlist');
          fetchBookings();
        } else {
          toast.error('Failed to remove from waitlist');
        }
        return;
      }
      
      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      
      if (!res.ok) {
        toast.error('Failed to update booking status');
        return;
      }
      
      toast.success(`Booking marked as ${newStatus}`);
      fetchBookings(); // Refresh the list
    } catch (error) {
      console.error(error);
      toast.error('Failed to update booking status');
    }
  };

  const [sendingReceipt, setSendingReceipt] = useState(false);

  const sendReceipt = async (bookingId: string) => {
    setSendingReceipt(true);
    const toastId = toast.loading('Sending receipt...');
    try {
      const res = await fetch('/api/bookings/receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId })
      });
      
      if (!res.ok) {
        toast.error('Failed to send receipt', { id: toastId });
      } else {
        toast.success('Receipt sent successfully!', { id: toastId });
      }
    } catch (error) {
      toast.error('Failed to send receipt', { id: toastId });
    }
    setSendingReceipt(false);
  };

  const handleDownloadDocument = (booking: any) => {
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
              <p>Status: <span class="status" style="${booking.status?.toUpperCase() === 'COMPLETED' ? 'color: green;' : ''}">${booking.status || 'PENDING'}</span></p>
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
                  <td>${item.name}</td>
                  <td>${item.quantity || 1}</td>
                  <td style="text-align: right;">${item.price}</td>
                </tr>
              `).join('') || `<tr><td>Custom Service</td><td>1</td><td style="text-align: right;">-</td></tr>`}
              <tr class="total-row">
                <td colspan="2" style="text-align: right; padding-top: 20px;">${booking.status?.toUpperCase() === 'COMPLETED' ? 'Total Paid:' : 'Total Amount:'}</td>
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
            <p>If you have any questions about this document, please contact us.</p>
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

  const handleExportCSV = () => {
    let filtered = [...bookings];

    // Filter by Date
    if (exportConfig.startDate) {
      filtered = filtered.filter(b => new Date(b.date) >= new Date(exportConfig.startDate));
    }
    if (exportConfig.endDate) {
      filtered = filtered.filter(b => new Date(b.date) <= new Date(exportConfig.endDate));
    }

    // Filter by Status
    if (exportConfig.status !== 'ALL') {
      filtered = filtered.filter(b => b.status === exportConfig.status);
    }

    // Sort
    if (exportConfig.sortBy === 'price') {
      filtered.sort((a, b) => {
        const priceA = parseInt(String(a.total || '0').replace(/\D/g, '')) || 0;
        const priceB = parseInt(String(b.total || '0').replace(/\D/g, '')) || 0;
        return priceB - priceA;
      });
    }

    if (filtered.length === 0) {
      toast.error("No bookings match these filters.");
      return;
    }

    // Generate CSV
    const headers = ['Booking ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Instagram', 'Date', 'Time', 'Services', 'Total Price', 'Status', 'Booked At'];
    
    const rows = filtered.map(b => [
      b.id,
      b.firstName || '',
      b.lastName || '',
      b.email || '',
      b.phone ? `="${b.phone}"` : '',
      b.instagram ? (b.instagram.startsWith('@') ? b.instagram : `@${b.instagram}`) : '',
      b.date || '',
      b.time || '',
      `"${b.items?.map((i: any) => i.name).join(', ') || 'Custom'}"`, // Quotes to handle commas in services list
      `"${b.total || '0'}"`,
      b.status || 'PENDING',
      b.createdAt ? new Date(b.createdAt).toLocaleString() : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bookings_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setShowExportModal(false);
    toast.success(`Exported ${filtered.length} bookings successfully.`);
  };

  return (
    <div className="bg-white min-h-full p-6 md:p-10 shadow-sm border border-black/5">
      <div className="flex flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-serif text-[#1A1414]">Overview</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowExportModal(true)}
            className="px-5 py-2.5 bg-[#1A1414] text-white rounded-xl text-sm font-bold hover:bg-black transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            Export CSV
          </button>
        </div>
      </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-10">
          <div className="p-6 border border-gray-100 rounded-2xl bg-gray-50 flex flex-col justify-center">
            <p className="text-base md:text-lg font-semibold text-gray-600 mb-2">Total Bookings</p>
            <p className="text-4xl md:text-5xl font-bold text-gray-900">{bookings.length}</p>
          </div>
          <div className="p-6 border border-gray-100 rounded-2xl bg-gray-50 flex flex-col justify-center">
            <p className="text-base md:text-lg font-semibold text-gray-600 mb-2">Pending</p>
            <p className="text-4xl md:text-5xl font-bold text-gray-900">{bookings.filter(b => !b.status || b.status.toUpperCase() === 'PENDING').length}</p>
          </div>
          <div className="p-6 border border-gray-100 rounded-2xl bg-gray-50 flex flex-col justify-center">
            <p className="text-base md:text-lg font-semibold text-gray-600 mb-2">Upcoming</p>
            <p className="text-4xl md:text-5xl font-bold text-gray-900">{bookings.filter(b => b.status?.toUpperCase() === 'CONFIRMED').length}</p>
          </div>
          <div className="p-6 border border-gray-100 rounded-2xl bg-gray-50 flex flex-col justify-center">
            <p className="text-base md:text-lg font-semibold text-gray-600 mb-2">Waitlist</p>
            <p className="text-4xl md:text-5xl font-bold text-gray-900">{bookings.filter(b => b.status?.toUpperCase() === 'WAITLIST').length}</p>
          </div>
          <div className="p-6 border border-gray-100 rounded-2xl bg-gray-50 flex flex-col justify-center">
            <p className="text-base md:text-lg font-semibold text-gray-600 mb-2">Completed</p>
            <p className="text-4xl md:text-5xl font-bold text-gray-900">{bookings.filter(b => b.status?.toUpperCase() === 'COMPLETED').length}</p>
          </div>
          <div className="p-6 border border-gray-100 rounded-2xl bg-gray-50 flex flex-col justify-center">
            <p className="text-base md:text-lg font-semibold text-gray-600 mb-2">Cancelled</p>
            <p className="text-4xl md:text-5xl font-bold text-gray-900">{bookings.filter(b => b.status?.toUpperCase() === 'CANCELLED').length}</p>
          </div>
        </div>

      <h2 className="text-xl font-bold mb-6 text-[#1A1414]">Recent Bookings Pipeline</h2>
      
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A1414]"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-500 font-medium">No bookings found in the pipeline.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => {
            const isConfirmed = booking.status?.toUpperCase() === 'CONFIRMED';
            const isWaitlist = booking.status?.toUpperCase() === 'WAITLIST';
            
            return (
              <div 
                key={booking.id} 
                onClick={() => setSelectedBooking(booking)}
                className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-black/10 hover:shadow-md transition-all flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 cursor-pointer"
              >
                
                {/* 1. Customer Info */}
                <div className="flex items-center gap-3 w-full md:w-1/4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-base md:text-lg shrink-0">
                    {booking.firstName?.[0] || 'W'}{booking.lastName?.[0] || ''}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm md:text-base leading-tight truncate">
                      {booking.firstName ? `${booking.firstName} ${booking.lastName}` : 'Waitlist User'}
                    </h3>
                    <a href={`mailto:${booking.email}`} onClick={e => e.stopPropagation()} className="text-xs text-gray-500 hover:text-primary transition-colors line-clamp-1 truncate block">{booking.email}</a>
                    {booking.phone && <p className="text-xs text-gray-400 mt-0.5">{booking.phone}</p>}
                  </div>
                  {/* Status Pill (Visible top-right on mobile) */}
                  <div className="md:hidden ml-auto">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                      booking.status?.toUpperCase() === 'COMPLETED' ? 'bg-black text-white' :
                      isConfirmed ? 'bg-green-100 text-green-700' : 
                      isWaitlist ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {booking.status || 'PENDING'}
                    </span>
                  </div>
                </div>

                {/* Mobile Grid Wrapper for 2 & 3 */}
                <div className="grid grid-cols-2 md:flex md:w-2/4 md:justify-between gap-4 w-full bg-gray-50 md:bg-transparent p-3 md:p-0 rounded-xl">
                  {/* 2. Date & Time */}
                  <div className="flex flex-col justify-center w-full min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 text-gray-700">
                      <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span className="text-xs md:text-sm font-bold truncate">
                        {new Date(booking.date + "T12:00:00").toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    {booking.time && (
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="text-xs md:text-sm">{booking.time}</span>
                      </div>
                    )}
                  </div>

                  {/* 3. Services & Price */}
                  <div className="flex flex-col justify-center border-l md:border-none border-gray-200 pl-4 md:pl-0 w-full min-w-0">
                    <p className="text-xs md:text-sm font-medium text-gray-800 line-clamp-1 mb-1 truncate">
                      {booking.items?.map((item: any) => item.name).join(', ') || (isWaitlist ? 'Waitlist Request' : 'Custom')}
                    </p>
                    <p className="text-sm md:text-base font-bold text-primary">{booking.total || (isWaitlist ? '-' : '₦0')}</p>
                  </div>
                </div>

                {/* 4. Status & Actions */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center w-full md:w-1/4 gap-3 mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-none border-gray-100">
                  <span className={`hidden md:inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                    booking.status?.toUpperCase() === 'COMPLETED' ? 'bg-black text-white' :
                    isConfirmed ? 'bg-green-100 text-green-700' : 
                    isWaitlist ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {booking.status || 'PENDING'}
                  </span>
                  
                  <div className="flex gap-2 w-full md:w-auto md:justify-end">
                    {booking.status?.toUpperCase() === 'PENDING' && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); updateBookingStatus(booking.id, 'CONFIRMED'); }}
                        className="flex-1 md:flex-none px-4 py-2 md:px-3 md:py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm font-bold transition-colors text-center"
                      >
                        Confirm
                      </button>
                    )}
                    {booking.status?.toUpperCase() === 'CONFIRMED' && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); updateBookingStatus(booking.id, 'COMPLETED'); }}
                        className="flex-1 md:flex-none px-4 py-2 md:px-3 md:py-1.5 bg-[#1A1414] text-white hover:bg-black rounded-lg text-sm font-bold transition-colors text-center"
                      >
                        Receipt
                      </button>
                    )}
                    {booking.status?.toUpperCase() !== 'CANCELLED' && booking.status?.toUpperCase() !== 'COMPLETED' && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); updateBookingStatus(booking.id, 'CANCELLED', booking.status); }}
                        className="flex-1 md:flex-none px-4 py-2 md:px-3 md:py-1.5 bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg text-sm font-bold transition-colors text-center"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
                
              </div>
            );
          })}
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <button 
              onClick={() => setShowExportModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-black"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <h2 className="text-2xl font-bold mb-6 font-serif">Export Bookings</h2>
            
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Start Date</label>
                  <input 
                    type="date" 
                    value={exportConfig.startDate}
                    onChange={e => setExportConfig({...exportConfig, startDate: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-black outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">End Date</label>
                  <input 
                    type="date" 
                    value={exportConfig.endDate}
                    onChange={e => setExportConfig({...exportConfig, endDate: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-black outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Filter Status</label>
                <select 
                  value={exportConfig.status}
                  onChange={e => setExportConfig({...exportConfig, status: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-black outline-none appearance-none bg-white"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="COMPLETED">Completed (Receipts)</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PENDING">Pending</option>
                  <option value="WAITLIST">Waitlist</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sort CSV By</label>
                <select 
                  value={exportConfig.sortBy}
                  onChange={e => setExportConfig({...exportConfig, sortBy: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-black outline-none appearance-none bg-white"
                >
                  <option value="date">Date (Newest First)</option>
                  <option value="price">Price (Highest First)</option>
                </select>
              </div>

              <button 
                onClick={handleExportCSV}
                className="w-full py-3.5 bg-primary text-white rounded-xl font-bold mt-4 hover:bg-[#E06633]/90 transition-colors"
              >
                Download CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Details Drawer */}
      <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${selectedBooking ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setSelectedBooking(null)} />
      
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${selectedBooking ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto`}>
        {selectedBooking && (
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10 backdrop-blur-md">
              <h2 className="text-xl font-serif font-bold text-[#1A1414]">Booking Details</h2>
              <button onClick={() => setSelectedBooking(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 flex-1 space-y-8">
              {/* Reference Number */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Reference Number</p>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="font-mono font-bold tracking-wider text-gray-900">{selectedBooking.id}</p>
                </div>
              </div>

              {/* Customer */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Customer Information</p>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="font-bold text-gray-900">{selectedBooking.firstName} {selectedBooking.lastName}</p>
                  <p className="text-sm text-gray-500 mt-1">{selectedBooking.email}</p>
                  <p className="text-sm text-gray-500">{selectedBooking.phone || 'No phone provided'}</p>
                  {selectedBooking.instagram && (
                    <p className="text-sm text-gray-500 mt-2 font-medium">IG: {selectedBooking.instagram}</p>
                  )}
                </div>
              </div>

              {/* Appointment */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Appointment</p>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900">{new Date(selectedBooking.date + "T12:00:00").toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    <p className="text-sm text-gray-500 mt-1">{selectedBooking.time}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                      selectedBooking.status?.toUpperCase() === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 
                      selectedBooking.status?.toUpperCase() === 'WAITLIST' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-gray-200 text-gray-700'
                    }`}>
                      {selectedBooking.status || 'PENDING'}
                  </span>
                </div>
              </div>

              {/* Services */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Services</p>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                  {selectedBooking.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-sm text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.duration}</p>
                      </div>
                      <p className="font-bold text-sm text-gray-900">{item.price}</p>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                    <p className="font-bold text-gray-900">Total</p>
                    <p className="font-bold text-primary text-lg">{selectedBooking.total}</p>
                  </div>
                </div>
              </div>

              {/* Inspiration Photo */}
              {selectedBooking.photoUrl && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Inspiration Photo</p>
                  <div className="rounded-xl overflow-hidden border border-gray-200">
                    <img src={selectedBooking.photoUrl} alt="Inspiration" className="w-full object-cover" />
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedBooking.notes && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Notes</p>
                  <div className="bg-yellow-50/50 p-4 rounded-xl border border-yellow-100/50">
                    <p className="text-sm text-gray-700 italic">"{selectedBooking.notes}"</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Actions Footer */}
            <div className="p-6 border-t border-gray-100 bg-white space-y-3">
              {selectedBooking.status?.toUpperCase() === 'PENDING' && (
                <button 
                  onClick={() => { updateBookingStatus(selectedBooking.id, 'CONFIRMED'); setSelectedBooking(null); }}
                  className="w-full py-3 bg-green-500 text-white hover:bg-green-600 rounded-xl font-bold transition-colors"
                >
                  Confirm Payment
                </button>
              )}

              {selectedBooking.status?.toUpperCase() === 'CONFIRMED' && (
                <div className="flex flex-col md:flex-row gap-3">
                  <button 
                    onClick={() => handleDownloadDocument(selectedBooking)}
                    className="flex-1 py-3 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-bold transition-colors"
                  >
                    Download Invoice
                  </button>
                  <button 
                    onClick={() => { updateBookingStatus(selectedBooking.id, 'COMPLETED'); setSelectedBooking(null); }}
                    className="flex-1 py-3 bg-[#1A1414] text-white hover:bg-black rounded-xl font-bold transition-colors"
                  >
                    Generate Receipt
                  </button>
                </div>
              )}

              {selectedBooking.status?.toUpperCase() === 'COMPLETED' && (
                <div className="flex flex-col md:flex-row gap-3">
                  <button 
                    onClick={() => handleDownloadDocument(selectedBooking)}
                    className="flex-1 py-3 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download Receipt
                  </button>
                  <button 
                    onClick={() => sendReceipt(selectedBooking.id)}
                    disabled={sendingReceipt}
                    className="flex-1 py-3 bg-[#1A1414] text-white hover:bg-black rounded-xl font-bold transition-colors disabled:opacity-50"
                  >
                    {sendingReceipt ? 'Emailing...' : 'Email Receipt'}
                  </button>
                </div>
              )}

              {selectedBooking.status?.toUpperCase() !== 'CANCELLED' && selectedBooking.status?.toUpperCase() !== 'COMPLETED' && (
                <button 
                  onClick={() => { updateBookingStatus(selectedBooking.id, 'CANCELLED'); setSelectedBooking(null); }}
                  className="w-full py-3 bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl font-bold transition-colors"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
