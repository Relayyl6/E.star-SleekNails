'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DetailsForm() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: ''
  });

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (agreed && formData.firstName && formData.phone) {
      router.push('/book/success');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl text-[#1A1414] mb-3">Your Details</h1>
        <p className="text-gray-500">Almost there! We just need a few details to secure your spot.</p>
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
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50" 
              placeholder="Jane" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Last Name</label>
            <input 
              type="text" 
              value={formData.lastName}
              onChange={e => setFormData({...formData, lastName: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50" 
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
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50" 
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
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50" 
              placeholder="+234 800 000 0000" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex justify-between">
            <span>Inspiration Photo (Optional)</span>
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer group">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Additional Notes</label>
          <textarea 
            rows={3}
            value={formData.notes}
            onChange={e => setFormData({...formData, notes: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50 resize-none" 
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

        <div className="flex justify-between items-center border-t border-black/5 pt-8">
          <button type="button" onClick={() => router.push('/book/date-time')} className="text-gray-500 hover:text-black font-medium text-sm">
            Back
          </button>
          <button 
            type="submit"
            disabled={!agreed || !formData.firstName || !formData.phone}
            className="bg-[#1A1414] text-white px-8 py-3 rounded-full font-semibold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 hover:bg-black transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
          >
            Review & Pay Deposit
          </button>
        </div>

      </form>
    </div>
  );
}
