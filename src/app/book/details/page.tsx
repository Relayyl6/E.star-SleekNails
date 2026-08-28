'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

export default function DetailsForm() {
  const router = useRouter();
  const { items, bookingDetails, setBookingDetails, clearCart, timeLeft, startTimer } = useCart();
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    startTimer();
  }, [startTimer]);

  useEffect(() => {
    if (timeLeft === 0) {
      router.push('/');
    }
  }, [timeLeft, router]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdTokenResult();
        setIsAdmin(!!token.claims.admin);
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: bookingDetails.firstName || '',
    lastName: bookingDetails.lastName || '',
    email: bookingDetails.email || '',
    phone: bookingDetails.phone || '',
    instagram: bookingDetails.instagram || '',
    notes: bookingDetails.notes || ''
  });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a local URL for the preview immediately
      const tempUrl = URL.createObjectURL(file);
      setBookingDetails(prev => ({ ...prev, photoUrl: tempUrl }));
      
      setIsUploading(true);
      const uploadData = new FormData();
      uploadData.append('file', file);
      
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData
        });
        if (res.ok) {
          const data = await res.json();
          // Update context with the real URL
          setBookingDetails(prev => ({ ...prev, photoUrl: data.url }));
        } else {
          toast.error("Failed to upload image. Please try again.");
          setBookingDetails(prev => ({ ...prev, photoUrl: null }));
        }
      } catch (error) {
        console.error("Upload failed", error);
        toast.error("Failed to upload image. Please try again.");
        setBookingDetails(prev => ({ ...prev, photoUrl: null }));
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isAdmin) {
      toast.error("You're an admin, remember? You want to book yourself? 🤨");
      return; // Stops the function so no API call is made
    }

    if (agreed && formData.firstName && formData.phone) {
      setIsSubmitting(true);

      const total = items.reduce((sum, item) => {
        const priceNum = parseInt(item.price.replace(/[^\d]/g, ''));
        return sum + (priceNum * (item.quantity || 1));
      }, 0);

      const bookingRef = "ESN-" + Math.random().toString(36).substr(2, 6).toUpperCase();

      try {
        // Prevent any lingering base64 strings from old localStorage state
        const safePhotoUrl = bookingDetails.photoUrl && bookingDetails.photoUrl.startsWith('data:image') 
          ? null 
          : (bookingDetails.photoUrl || null);

        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            date: bookingDetails.date,
            time: bookingDetails.time,
            items,
            total,
            ref: bookingRef,
            photoUrl: safePhotoUrl,
            userId: auth.currentUser?.uid || null
          })
        });

        const data = await res.json();

        if (res.status === 409) {
          toast.error("Sorry, this time slot was just booked by someone else. Please go back and select a different time.");
          setIsSubmitting(false);
          return;
        }

        if (!data.success) {
          toast.error(data.error || "Failed to book");
          setIsSubmitting(false);
          return;
        }

        setBookingDetails(prev => ({
          ...prev,
          ...formData,
          bookingRef
        }));
        
        // If guest booking, save ref to localStorage so it can be claimed upon signup
        if (!auth.currentUser) {
          try {
            const existingStr = localStorage.getItem('guest_booking_refs');
            const existing = existingStr ? JSON.parse(existingStr) : [];
            existing.push(bookingRef);
            localStorage.setItem('guest_booking_refs', JSON.stringify(existing));
          } catch(e) {}
        }
        
        router.push('/book/success');
        
      } catch (err: any) {
        console.error(err);
        toast.error("An error occurred. Please try again.");
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl text-[#1A1414] mb-3">Your Details</h1>
          <p className="text-gray-500">Almost there! We just need a few details to secure your spot.</p>
        </div>
        <div className="bg-[#1A1414] text-white px-4 py-2 rounded-xl text-center hidden md:block shrink-0 ml-4">
          <p className="text-[10px] uppercase font-bold tracking-widest text-white/50 mb-0.5">Time Left</p>
          <p className="font-mono font-bold text-lg leading-none">{formatTime(timeLeft)}</p>
        </div>
      </div>

      <form onSubmit={handleContinue} className="space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">First Name *</label>
            <input 
              type="text" 
              required
              value={formData.firstName}
              onChange={e => setFormData({...formData, firstName: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-black/[0.02] backdrop-blur-md shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]" 
              placeholder="Jane" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Last Name</label>
            <input 
              type="text" 
              value={formData.lastName}
              onChange={e => setFormData({...formData, lastName: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-black/[0.02] backdrop-blur-md shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]" 
              placeholder="Doe" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Email Address *</label>
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-black/[0.02] backdrop-blur-md shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]" 
              placeholder="jane@example.com" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Phone Number (WhatsApp) *</label>
            <input 
              type="tel" 
              required
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-black/[0.02] backdrop-blur-md shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]" 
              placeholder="+234 800 000 0000" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex justify-between">
            <span>Inspiration Photo (Optional)</span>
          </label>
          <label className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer group flex flex-col items-center justify-center relative overflow-hidden h-32">
            <input 
              type="file" 
              accept="image/*"
              className="hidden" 
              onChange={handlePhotoUpload}
            />
            {bookingDetails.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={bookingDetails.photoUrl} alt="Inspiration" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <>
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
              </>
            )}
          </label>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Additional Notes</label>
          <textarea 
            rows={3}
            value={formData.notes}
            onChange={e => setFormData({...formData, notes: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-black/[0.02] backdrop-blur-md shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] resize-none" 
            placeholder="Any specific requests, allergies, or questions?" 
          ></textarea>
        </div>

        <div className="bg-[#F8D9CE]/20 p-5 rounded-xl border border-[#F8D9CE]">
          <label className="flex items-start gap-4 cursor-pointer">
            <input 
              type="checkbox" 
              required
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary" 
            />
            <span className="text-sm text-gray-700 leading-relaxed">
              I have read and agree to the <a href="/policy" target="_blank" className="font-semibold text-[#1A1414] hover:underline">Studio Policies</a>, including the non-refundable deposit, late fee terms, and health & safety requirements.
            </span>
          </label>
        </div>

        <div className="flex justify-between items-center pt-8 border-t border-black/5 mt-10">
          <button type="button" onClick={() => router.back()} className="text-gray-500 font-semibold hover:text-black transition-colors px-4 py-2">
            Back
          </button>
          <button 
            type="submit" 
            disabled={!agreed || !formData.firstName || !formData.phone || isSubmitting || isUploading}
            className="bg-[#1A1414] text-white px-8 py-3.5 rounded-xl font-bold shadow-xl shadow-black/10 hover:bg-black transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center min-w-[200px]"
          >
            {isSubmitting ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : (
              isUploading ? "Uploading Image..." : "Confirm & Book"
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
