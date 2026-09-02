'use client';

import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function SuccessPage() {
  const { items, bookingDetails, setIsOpen, clearCart } = useCart();
  const [mounted, setMounted] = useState(false);
  const [depositAmount, setDepositAmount] = useState(5000);
  const [bankDetails, setBankDetails] = useState("Moniepoint, 7049022919, E.star SleekNails Luxury studio/ E.star SleekNails");
  const [user, setUser] = useState<User | null>(null);

  // Take a snapshot so we can clear the cart but still show the invoice!
  const [snapshotItems] = useState(items);
  const [snapshotDetails] = useState(bookingDetails);

  const total = snapshotItems.reduce((sum, item) => {
    const priceNum = parseInt(item.price.replace(/[^\d]/g, ''));
    return sum + (priceNum * (item.quantity || 1));
  }, 0);

  useEffect(() => {
    setMounted(true);
    setIsOpen(false);
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.depositAmount != null) setDepositAmount(data.depositAmount);
        if (data.bankDetails) setBankDetails(data.bankDetails);
      })
      .catch(() => {});
    
    // Clear the global cart so the next booking is fresh
    if (items.length > 0) {
      setTimeout(() => clearCart(), 100);
    }
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    
    return () => unsubscribe();
  }, [setIsOpen, clearCart, items.length]);

  if (!mounted) return null;

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount).replace('NGN', '₦');
  };

  // Parse YYYY-MM-DD safely without timezone shift
  // new Date("2026-08-29") parses as UTC midnight → wrong day in +01 zones
  const parseDateStr = (str: string) => {
    if (!str) return new Date();
    const parts = str.split('-');
    if (parts.length === 3) return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return new Date(str); // fallback for old ISO strings
  };
  const dateObj = parseDateStr(snapshotDetails.date || '');
  
  // We passed the booking ref forward from the details page!
  const bookingRef = snapshotDetails.bookingRef || "N/A";

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto pb-20">
      
      {/* Success Header */}
      <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 print:hidden">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-green-200">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h1 className="font-serif text-4xl text-[#1A1414] mb-3">Booking Saved!</h1>
        <p className="text-gray-500 text-lg max-w-md mx-auto">Your appointment details have been recorded. Please save your invoice.</p>
      </div>

      <div className="w-full flex flex-col md:flex-row gap-8 items-start">
        {/* Invoice Printable Area */}
        <div 
          id="invoice-area" 
          className="flex-1 bg-white border border-gray-200 rounded-lg p-8 shadow-sm w-full print:shadow-none print:border-none print:p-0"
        >
          <div className="flex justify-between items-start border-b border-gray-100 pb-6 mb-6">
            <div>
              <h2 className="font-serif text-2xl text-[#1A1414]">E.star SleekNails</h2>
              <p className="text-gray-400 text-sm mt-1">Invoice / Booking Summary</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Ref</p>
              <p className="font-mono text-gray-800">{bookingRef}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="min-w-0 pr-4">
              <p className="text-xs text-gray-400 font-semibold uppercase mb-2">Billed To</p>
              <p className="font-medium text-gray-800 truncate">{snapshotDetails.firstName} {snapshotDetails.lastName}</p>
              <p className="text-sm text-gray-500 break-all">{snapshotDetails.email}</p>
              <p className="text-sm text-gray-500">{snapshotDetails.phone}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase mb-2">Appointment Details</p>
              <p className="font-medium text-gray-800">{dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}</p>
              <p className="text-sm text-gray-500">{snapshotDetails.time}</p>
            </div>
          </div>

          <table className="w-full text-left mb-8">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
                <th className="pb-3 font-semibold">Service</th>
                <th className="pb-3 font-semibold text-right">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {snapshotItems.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-4">
                      <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                      {(item.selectedLength || item.selectedDesign || (item.selectedExtras && item.selectedExtras.length > 0)) && (
                        <div className="text-xs text-gray-500 my-1 space-y-0.5">
                          {item.selectedLength && <div>+ {item.selectedLength.name} (+₦{item.selectedLength.price.toLocaleString()})</div>}
                          {item.selectedDesign && <div>+ {item.selectedDesign.name} (+₦{item.selectedDesign.price.toLocaleString()})</div>}
                          {item.selectedExtras?.map((ex: any, i: number) => (
                            <div key={i}>+ {ex.name} (+₦{ex.price.toLocaleString()})</div>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-400">{item.duration}</p>
                    </td>
                    <td className="py-4 text-right font-medium text-gray-800 text-sm align-top">
                      {item.price}
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>

          {snapshotDetails.photoUrl && (
            <div className="mb-8">
               <p className="text-xs text-gray-400 font-semibold uppercase mb-3">Attached Inspiration</p>
               <div className="w-24 h-24 relative rounded-xl overflow-hidden border border-gray-200 shadow-sm mt-3">
                  <img src={snapshotDetails.photoUrl} alt="Inspo" className="w-full h-full object-cover" />
               </div>
            </div>
          )}

          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>{formatMoney(total)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-[#1A1414] border-t border-gray-100 pt-3">
                <span>Total</span>
                <span>{formatMoney(total)}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 mt-6">
            <p className="text-xs text-gray-500 font-medium mb-1">To permanently secure this booking, a deposit is required.</p>
            <p className="text-[11px] text-gray-400">Please transfer <strong className="text-gray-700">{formatMoney(depositAmount)}</strong> to <strong className="text-gray-700">{bankDetails}</strong> and send the receipt to our WhatsApp.</p>
          </div>
        </div>

        {/* Actions sidebar */}
        <div className="w-full md:w-80 flex flex-col gap-3 print:hidden">
          {/* Calendar buttons */}
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider text-center">Add to Calendar</p>
          <div className="flex gap-2">
            {/* Google Calendar */}
            <a
              href={`/api/calendar?ref=${bookingRef}&type=google`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm text-sm font-semibold text-gray-700"
            >
              {/* Google logo */}
              <svg className="w-4 h-4" viewBox="0 0 48 48" fill="none">
                <path fill="#4285F4" d="M45.5 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h12.1c-.5 2.8-2.1 5.1-4.5 6.7v5.5h7.3c4.2-3.9 6.6-9.6 6.6-15.9z"/>
                <path fill="#34A853" d="M24 46c6.1 0 11.2-2 14.9-5.5l-7.3-5.5c-2 1.4-4.6 2.2-7.6 2.2-5.9 0-10.8-4-12.6-9.4H4v5.7C7.7 41.7 15.4 46 24 46z"/>
                <path fill="#FBBC05" d="M11.4 27.8c-.5-1.4-.7-2.8-.7-4.3s.3-2.9.7-4.3v-5.7H4A22 22 0 002 23.5c0 3.6.9 7 2 10l9.4-5.7z"/>
                <path fill="#EA4335" d="M24 9.5c3.3 0 6.3 1.1 8.6 3.3l6.4-6.4C34.9 2.9 29.8.5 24 .5 15.4.5 7.7 4.8 4 11.5l7.4 5.7C13.2 12.5 18.1 9.5 24 9.5z"/>
              </svg>
              Google
            </a>

            {/* Apple Calendar (.ics) */}
            <a
              href={`/api/calendar?ref=${bookingRef}&type=ics`}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm text-sm font-semibold text-gray-700"
            >
              {/* Apple logo */}
              <svg className="w-4 h-4" viewBox="0 0 814 1000" fill="currentColor">
                <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 376.7 0 248.1 0 124.1 0 56.6 23.7 12.5 70.8 12.5c60.5 0 104.8 82.8 150.2 82.8 38.6 0 91.6-42.5 152.5-42.5 60.9 0 97.9 18.5 148.4 54.2zm-325.8-244.4c14.1-62.5 50.9-136.3 104.2-181.3 53.3-45 102.5-54.2 102.5-54.2 0 54.2-6.4 107.8-54.2 151.1-47.8 43.2-103.5 54.2-152.5 84.4z"/>
              </svg>
              Apple
            </a>
          </div>

          <button
            onClick={() => window.print()}
            className="w-full py-3 rounded-xl border border-gray-300 bg-white font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            Print / Save PDF
          </button>

          {!user ? (
            <div className="bg-[#F8D9CE]/20 border border-[#F8D9CE] rounded-xl p-5 text-center mt-2">
              <h3 className="font-serif text-[#1A1414] text-xl mb-2">Save this booking</h3>
              <p className="text-sm text-gray-600 mb-4">Create an account to manage your appointment, reschedule, and view your history.</p>
              <Link href="/register" className="block w-full py-2.5 bg-[#1A1414] text-white rounded-lg font-semibold text-sm hover:bg-black transition-colors shadow-md">
                Create an account
              </Link>
            </div>
          ) : (
            <div className="bg-green-50/50 border border-green-200 rounded-xl p-5 text-center mt-2">
              <h3 className="font-serif text-[#1A1414] text-xl mb-2">Manage Booking</h3>
              <p className="text-sm text-gray-600 mb-4">You can view and manage this appointment directly from your dashboard.</p>
              <Link href="/dashboard" className="block w-full py-2.5 bg-[#1A1414] text-white rounded-lg font-semibold text-sm hover:bg-black transition-colors shadow-md">
                Go to Dashboard
              </Link>
            </div>
          )}

          <a 
              target="_blank" 
              rel="noreferrer" 
              href={`https://wa.me/2347049022919?text=${encodeURIComponent(`Hi! I just booked an appointment on E.star SleekNails.\n\nBooking Ref: ${bookingRef}\nDeposit: ${formatMoney(depositAmount)}\n\nI am attaching my payment receipt below. 💅✨`)}`} 
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-3.5 rounded-xl font-bold hover:bg-[#1ebd5a] transition-all shadow-md active:scale-95"
            >
             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.599-.187-.968-.306-1.554-.5-2.738-1.579-3.214-2.22-.058-.078-.771-1.02-.771-1.942 0-.923.479-1.378.648-1.555.151-.159.39-.236.621-.236.075 0 .145.002.207.005.184.008.277.021.401.32.155.372.531 1.297.578 1.393.047.096.078.209.02.327-.058.118-.088.191-.175.293-.087.103-.186.223-.263.31-.083.095-.172.199-.074.368.098.169.435.718.932 1.163.642.575 1.182.753 1.352.836.17.083.27.073.37-.04.101-.114.436-.508.552-.682.115-.174.229-.145.385-.088.156.058.986.465 1.155.55.17.085.283.128.324.198.041.07.041.404-.103.809z" /></svg>
             Send Receipt
          </a>
        </div>
      </div>
    </div>
  );
}
