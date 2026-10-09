'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { upload } from '@vercel/blob/client';

export default function DetailsForm() {
  const router = useRouter();
  const { items, bookingDetails, setBookingDetails, clearCart, timeLeft, startTimer } = useCart();
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);

  // Settings state
  const [depositAmount, setDepositAmount] = useState(5000);
  const [bankDetails, setBankDetails] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);

  useEffect(() => {
    startTimer();
  }, [startTimer]);

  useEffect(() => {
    if (timeLeft === 0) {
      router.push('/');
    }
  }, [timeLeft, router]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.depositAmount !== undefined) setDepositAmount(data.depositAmount);
          if (data.bankDetails) setBankDetails(data.bankDetails);
        }
      } catch (e) {
        console.error("Failed to fetch settings", e);
      }
    };
    fetchSettings();
  }, []);

  // Restore payment modal state if page reloads
  useEffect(() => {
    const savedState = localStorage.getItem('estar_payment_started');
    if (savedState === 'true' && items.length > 0) {
      setShowPaymentModal(true);
      setAgreed(true); // they already agreed if they got to payment
    }
  }, [items.length]);

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
      try {
        const uniqueFilename = `inspo_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const newBlob = await upload(uniqueFilename, file, {
          access: 'public',
          handleUploadUrl: '/api/upload',
        });
        
        // Update context with the real URL
        setBookingDetails(prev => ({ ...prev, photoUrl: newBlob.url }));
      } catch (error) {
        console.error("Upload failed", error);
        toast.error("Failed to upload image. Please try again.");
        setBookingDetails(prev => ({ ...prev, photoUrl: null }));
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingReceipt(true);
      try {
        const uniqueFilename = `receipt_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const newBlob = await upload(uniqueFilename, file, {
          access: 'public',
          handleUploadUrl: '/api/upload',
        });
        setReceiptUrl(newBlob.url);
      } catch (error) {
        console.error("Receipt upload failed", error);
        toast.error("Failed to upload receipt. Please try again.");
      } finally {
        setIsUploadingReceipt(false);
      }
    }
  };

  const totalAmount = items.reduce((sum, item) => {
    const digits = item.price.replace(/[^\d]/g, '');
    const priceNum = digits ? parseInt(digits, 10) : 0;
    return sum + (priceNum * (item.quantity || 1));
  }, 0);

  const requiredDeposit = Math.min(totalAmount, depositAmount);

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isAdmin) {
      toast.error("You're an admin, remember? You want to book yourself? 🤨");
      return; 
    }

    if (agreed && formData.firstName && formData.phone) {
      // Save details to CartContext
      setBookingDetails(prev => ({
        ...prev,
        ...formData
      }));
      
      // Save state to localStorage to survive bank app switching
      localStorage.setItem('estar_payment_started', 'true');
      setShowPaymentModal(true);
    }
  };

  const finalizeBooking = async () => {
    if (!receiptUrl) {
      toast.error("Please upload your payment receipt to continue.");
      return;
    }

    setIsSubmitting(true);
    const bookingRef = bookingDetails.bookingRef || "ESN-" + Math.random().toString(36).substr(2, 6).toUpperCase();

    try {
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
          total: totalAmount,
          ref: bookingRef,
          photoUrl: safePhotoUrl,
          receiptUrl: receiptUrl,
          userId: auth.currentUser?.uid || null
        })
      });

      const data = await res.json();

      if (res.status === 409) {
        toast.error("Sorry, this time slot was just booked by someone else. Please go back and select a different time.");
        setIsSubmitting(false);
        setShowPaymentModal(false);
        localStorage.removeItem('estar_payment_started');
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
      
      if (!auth.currentUser) {
        try {
          const existingStr = localStorage.getItem('guest_booking_refs');
          const existing = existingStr ? JSON.parse(existingStr) : [];
          existing.push(bookingRef);
          localStorage.setItem('guest_booking_refs', JSON.stringify(existing));
        } catch(e) {}
      }
      
      localStorage.removeItem('estar_payment_started');
      router.push('/book/success');
      
    } catch (err: any) {
      console.error(err);
      toast.error("An error occurred. Please try again.");
      setIsSubmitting(false);
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
              isUploading ? "Uploading Image..." : "Proceed to Payment"
            )}
          </button>
        </div>

      </form>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
            <button 
              onClick={() => {
                setShowPaymentModal(false);
                localStorage.removeItem('estar_payment_started');
              }}
              className="absolute top-4 right-4 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-black transition-colors"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
              <h2 className="text-2xl font-serif text-[#1A1414] mb-2">Secure Your Slot</h2>
              <p className="text-gray-500 text-sm px-4">
                Please transfer the required deposit to confirm your booking. <br/>
                <span className="font-semibold text-primary mt-1 inline-block">Time left: {formatTime(timeLeft)}</span>
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-6 text-center">
              <p className="text-sm text-gray-500 mb-1">Required Deposit</p>
              <p className="text-4xl font-bold text-[#1A1414] mb-4">₦{requiredDeposit.toLocaleString()}</p>
              
              <div className="bg-white rounded-xl p-4 border border-gray-200 text-left">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bank Details</p>
                <p className="font-medium text-gray-800 whitespace-pre-wrap">{bankDetails || 'Moniepoint\n7049022919\nE.star SleekNails'}</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer group flex flex-col items-center justify-center relative overflow-hidden h-32">
                <input 
                  type="file" 
                  accept="image/*"
                  className="hidden" 
                  onChange={handleReceiptUpload}
                />
                {receiptUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={receiptUrl} alt="Receipt" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="w-10 h-10 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      {isUploadingReceipt ? (
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      {isUploadingReceipt ? "Uploading..." : "Upload Payment Receipt"}
                    </p>
                  </>
                )}
              </label>
            </div>

            <button 
              onClick={finalizeBooking}
              disabled={!receiptUrl || isSubmitting}
              className="w-full bg-[#1A1414] text-white py-4 rounded-xl font-bold hover:bg-black transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Verifying...
                </>
              ) : (
                "Verify & Complete Booking"
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
