'use client';

import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function SuccessPage() {
  const { items, setIsOpen } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Close the cart drawer if it's open, but we don't clear it yet so they see the summary.
    setIsOpen(false);
  }, [setIsOpen]);

  if (!mounted) return null;

  const total = items.reduce((sum, item) => {
    const priceNum = parseInt(item.price.replace(/[^\d]/g, ''));
    return sum + (priceNum * item.quantity);
  }, 0);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount).replace('NGN', '₦');
  };

  const bookingRef = "ESN-" + Math.random().toString(36).substr(2, 6).toUpperCase();
  const whatsappMessage = encodeURIComponent(`Hi! I just booked an appointment on E.star SleekNails.\n\nBooking Ref: ${bookingRef}\nDeposit: ₦10,000\n\nI am attaching my payment receipt below. 💅✨`);

  // Calendar Event Data
  const eventDetails = {
    title: 'Nail Appointment @ E.star SleekNails',
    details: 'Looking forward to seeing you! Please arrive on time.',
    location: 'Lagos, Nigeria',
    // Using dummy future date for demo (tomorrow at 10am)
    start: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().replace(/-|:|\.\d\d\d/g, "").slice(0, 15) + "Z",
    end: new Date(new Date().setHours(new Date().getHours() + 26)).toISOString().replace(/-|:|\.\d\d\d/g, "").slice(0, 15) + "Z"
  };

  const googleCalLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventDetails.title)}&dates=${eventDetails.start}/${eventDetails.end}&details=${encodeURIComponent(eventDetails.details)}&location=${encodeURIComponent(eventDetails.location)}`;
  
  const handleDownloadICS = () => {
    const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${eventDetails.start}\nDTEND:${eventDetails.end}\nSUMMARY:${eventDetails.title}\nDESCRIPTION:${eventDetails.details}\nLOCATION:${eventDetails.location}\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'estar_appointment.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGetDirections = () => {
    // Attempt to use Geolocation to route from their current location to Lagos Studio
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          window.open(`https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=Lagos,Nigeria`, '_blank');
        },
        () => {
          // fallback
          window.open(`https://www.google.com/maps/dir/?api=1&destination=Lagos,Nigeria`, '_blank');
        }
      );
    } else {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=Lagos,Nigeria`, '_blank');
    }
  };

  return (
    <div className="flex flex-col items-center">
      
      {/* Success Header */}
      <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-green-200">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h1 className="font-serif text-4xl text-[#1A1414] mb-3">Booking Reserved!</h1>
        <p className="text-gray-500 text-lg max-w-md mx-auto">Your slot is temporarily held. Complete your deposit payment below to secure it permanently.</p>
      </div>

      {/* Grid for Invoice & Map */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        
        {/* Invoice Card */}
        <div className="bg-[#1A1414] text-white rounded-[2rem] p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between animate-in fade-in slide-in-from-left-8 duration-700 delay-300 fill-mode-both">
          {/* Aesthetic Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full mix-blend-screen filter blur-[60px]"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start border-b border-white/10 pb-6 mb-6">
              <div>
                <p className="text-white/50 text-xs font-bold tracking-widest uppercase mb-1">Invoice / Deposit</p>
                <p className="font-serif text-2xl">E.star SleekNails</p>
              </div>
              <div className="text-right">
                <p className="text-white/50 text-xs font-bold tracking-widest uppercase mb-1">Ref</p>
                <p className="font-mono text-lg">{bookingRef}</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-lg">
                <span className="text-white/80">Deposit Amount</span>
                <span className="font-bold text-[#F8D9CE]">₦10,000</span>
              </div>
              <div className="flex justify-between items-center text-sm text-white/50">
                <span>Remaining Balance</span>
                <span>{formatMoney(total - 10000)} (Due at Studio)</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 mb-6">
              <p className="text-[#F8D9CE] mb-2 text-sm font-medium">Transfer to:</p>
              <p className="font-bold text-xl mb-1">GTBank</p>
              <div className="flex items-center justify-between group cursor-pointer">
                <span className="font-mono text-3xl tracking-[0.1em] text-white">0123456789</span>
                <svg className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              </div>
            </div>
          </div>

          <a 
            href={`https://wa.me/2347049022919?text=${whatsappMessage}`} 
            target="_blank" 
            rel="noreferrer" 
            className="w-full flex items-center justify-center gap-3 bg-[#F8D9CE] text-[#1A1414] py-4 rounded-xl font-bold hover:bg-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 relative z-10"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.599-.187-.968-.306-1.554-.5-2.738-1.579-3.214-2.22-.058-.078-.771-1.02-.771-1.942 0-.923.479-1.378.648-1.555.151-.159.39-.236.621-.236.075 0 .145.002.207.005.184.008.277.021.401.32.155.372.531 1.297.578 1.393.047.096.078.209.02.327-.058.118-.088.191-.175.293-.087.103-.186.223-.263.31-.083.095-.172.199-.074.368.098.169.435.718.932 1.163.642.575 1.182.753 1.352.836.17.083.27.073.37-.04.101-.114.436-.508.552-.682.115-.174.229-.145.385-.088.156.058.986.465 1.155.55.17.085.283.128.324.198.041.07.041.404-.103.809z" /></svg>
            Send Receipt via WhatsApp
          </a>
        </div>

        {/* Studio Location & Calendar */}
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-8 duration-700 delay-500 fill-mode-both">
          {/* Map */}
          <div className="flex-1 bg-gray-100 rounded-[2rem] overflow-hidden relative shadow-inner border border-gray-200 min-h-[300px]">
            <iframe 
              src="https://maps.google.com/maps?q=Lagos,Nigeria&t=&z=12&ie=UTF8&iwloc=&output=embed" 
              width="100%" 
              height="100%" 
              frameBorder="0" 
              style={{ border: 0, position: 'absolute', top: 0, left: 0 }} 
              allowFullScreen 
              aria-hidden="false" 
              tabIndex={0}
            ></iframe>
            <div className="absolute bottom-4 left-4 right-4 flex justify-center">
              <button onClick={handleGetDirections} className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-white flex items-center gap-2 border border-black/5 text-[#1A1414] transition-all">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z"></path></svg>
                Get Live Directions
              </button>
            </div>
          </div>

          {/* Calendar Actions */}
          <div className="grid grid-cols-2 gap-4">
            <a href={googleCalLink} target="_blank" rel="noreferrer" className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center hover:border-primary hover:shadow-md transition-all group">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"></path></svg>
              </div>
              <span className="text-sm font-semibold text-gray-700">Google Calendar</span>
            </a>
            
            <button onClick={handleDownloadICS} className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center hover:border-primary hover:shadow-md transition-all group">
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"></path></svg>
              </div>
              <span className="text-sm font-semibold text-gray-700">Apple Calendar (.ics)</span>
            </button>
          </div>
        </div>

      </div>

      <div className="border-t border-black/5 pt-8 w-full text-center">
        <Link href="/" className="text-gray-500 hover:text-black font-medium transition-colors">
          Return to Home
        </Link>
      </div>
    </div>
  );
}
