'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase/config';
import { toast } from 'sonner';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  // Notification state
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) return;
      
      setName(auth.currentUser.displayName || '');
      
      try {
        const res = await fetch(`/api/profile?uid=${auth.currentUser.uid}`);
        if (res.ok) {
          const data = await res.json();
          setPhone(data.phone || '');
          setEmailNotifs(data.emailNotifs ?? true);
          setSmsNotifs(data.smsNotifs ?? false);
        }
      } catch (e) {
        console.error("Failed to fetch profile", e);
      }
      setLoading(false);
    };

    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) fetchProfile();
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: auth.currentUser.uid,
          phone,
          emailNotifs,
          smsNotifs,
        })
      });

      if (!res.ok) {
        toast.error('Failed to update profile');
        setSaving(false);
        return;
      }
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-black/5 flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A1414]"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-black/5">
      <h1 className="text-3xl font-serif text-[#1A1414] mb-8">Profile Settings</h1>
      
      <form onSubmit={handleSave} className="max-w-2xl">
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4 border-b border-gray-100 pb-2">Contact Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                disabled // Usually updated via auth directly
                className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none" 
              />
              <p className="text-xs text-gray-400 mt-1">Name is tied to your Google/Auth account.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                value={auth.currentUser?.email || ''} 
                disabled 
                className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
              <input 
                type="tel" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1A1414]" 
                placeholder="+234..." 
              />
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4 border-b border-gray-100 pb-2">Notification Preferences</h2>
          
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={emailNotifs} 
                onChange={e => setEmailNotifs(e.target.checked)}
                className="w-5 h-5 accent-[#1A1414] rounded cursor-pointer"
              />
              <div>
                <p className="font-semibold text-sm">Email Notifications</p>
                <p className="text-xs text-gray-500">Receive booking confirmations and reminders via email.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={smsNotifs} 
                onChange={e => setSmsNotifs(e.target.checked)}
                className="w-5 h-5 accent-[#1A1414] rounded cursor-pointer"
              />
              <div>
                <p className="font-semibold text-sm">SMS Reminders</p>
                <p className="text-xs text-gray-500">Get text messages 24 hours before your appointment.</p>
              </div>
            </label>
          </div>
        </section>

        <button 
          type="submit"
          disabled={saving}
          className="bg-[#1A1414] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-black transition-colors shadow-sm disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
