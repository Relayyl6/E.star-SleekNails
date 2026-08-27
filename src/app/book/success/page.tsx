'use client';

import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function SuccessPage() {
  const { items, bookingDetails, setIsOpen } = useCart();
  const [mounted, setMounted] = useState(false);

  const total = items.reduce((sum, item) => {
    const priceNum = parseInt(item.price.replace(/[^\d]/g, ''));
    return sum + (priceNum * (item.quantity || 1));
  }, 0);

  useEffect(() => {
    setMounted(true);
    setIsOpen(false);
  }, [setIsOpen]);

  if (!mounted) return null;

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount).replace('NGN', '₦');
  };

  const dateObj = bookingDetails.date ? new Date(bookingDetails.date) : new Date();
  
  // We passed the booking ref forward from the details page!
  const bookingRef = bookingDetails.bookingRef || "N/A";

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
              <p className="font-medium text-gray-800 truncate">{bookingDetails.firstName} {bookingDetails.lastName}</p>
              <p className="text-sm text-gray-500 break-all">{bookingDetails.email}</p>
              <p className="text-sm text-gray-500">{bookingDetails.phone}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase mb-2">Appointment Details</p>
              <p className="font-medium text-gray-800">{dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}</p>
              <p className="text-sm text-gray-500">{bookingDetails.time}</p>
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
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-4">
                    <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.duration}</p>
                  </td>
                  <td className="py-4 text-right font-medium text-gray-800 text-sm">
                    {item.price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {bookingDetails.photoUrl && (
            <div className="mb-8">
               <p className="text-xs text-gray-400 font-semibold uppercase mb-3">Attached Inspiration</p>
               <div className="w-24 h-24 relative rounded-lg overflow-hidden border border-gray-200">
                  <Image src={bookingDetails.photoUrl} alt="Inspo" fill className="object-cover" />
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
            <p className="text-[11px] text-gray-400">Please transfer <strong className="text-gray-700">₦10,000</strong> to GTBank: <strong className="text-gray-700">0123456789</strong> (Account: E.star SleekNails) and send the receipt to our WhatsApp.</p>
          </div>
        </div>

        {/* Actions sidebar */}
        <div className="w-full md:w-80 flex flex-col gap-4 print:hidden">
          <button 
            onClick={() => window.print()} 
            className="w-full py-3 rounded-xl border border-gray-300 bg-white font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            Print / Save PDF
          </button>

          <div className="bg-[#F8D9CE]/20 border border-[#F8D9CE] rounded-xl p-5 text-center mt-4">
            <h3 className="font-serif text-[#1A1414] text-xl mb-2">Save this booking</h3>
            <p className="text-sm text-gray-600 mb-4">Create an account to manage your appointment, reschedule, and view your history.</p>
            <Link href="/register" className="block w-full py-2.5 bg-[#1A1414] text-white rounded-lg font-semibold text-sm hover:bg-black transition-colors shadow-md">
              Create an account
            </Link>
          </div>

          <a 
            href={`https://wa.me/2347049022919?text=${encodeURIComponent(`Hi! I just booked an appointment on E.star SleekNails.\n\nBooking Ref: ${bookingRef}\nDeposit: ₦10,000\n\nI am attaching my payment receipt below. 💅✨`)}`} 
            target="_blank" 
            rel="noreferrer" 
            className="w-full mt-4 flex items-center justify-center gap-3 bg-green-50 text-green-700 py-3 rounded-xl font-bold hover:bg-green-100 transition-all border border-green-200"
          >
             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.599-.187-.968-.306-1.554-.5-2.738-1.579-3.214-2.22-.058-.078-.771-1.02-.771-1.942 0-.923.479-1.378.648-1.555.151-.159.39-.236.621-.236.075 0 .145.002.207.005.184.008.277.021.401.32.155.372.531 1.297.578 1.393.047.096.078.209.02.327-.058.118-.088.191-.175.293-.087.103-.186.223-.263.31-.083.095-.172.199-.074.368.098.169.435.718.932 1.163.642.575 1.182.753 1.352.836.17.083.27.073.37-.04.101-.114.436-.508.552-.682.115-.174.229-.145.385-.088.156.058.986.465 1.155.55.17.085.283.128.324.198.041.07.041.404-.103.809z" /></svg>
             Send Receipt
          </a>
        </div>
      </div>
    </div>
  );
}
