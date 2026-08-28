'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function VendorSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'General' | 'Hours' | 'Policies'>('General');

  const [settings, setSettings] = useState({
    storeName: 'E.star SleekNails',
    phone: '+2347049022919',
    instagram: '@estar_sleeknails',
    address: 'Lagos, Nigeria',
    bio: '',
    heroImage: '',
    depositPercentage: 30,
    adminEmail: '',
    bankDetails: 'GTBank\n0123456789\nE.star SleekNails',
    hours: [
      { day: 'monday', open: '09:00', close: '18:00', isClosed: false },
      { day: 'tuesday', open: '09:00', close: '18:00', isClosed: false },
      { day: 'wednesday', open: '09:00', close: '18:00', isClosed: false },
      { day: 'thursday', open: '09:00', close: '18:00', isClosed: false },
      { day: 'friday', open: '09:00', close: '19:00', isClosed: false },
      { day: 'saturday', open: '09:00', close: '19:00', isClosed: false },
      { day: 'sunday', open: '12:00', close: '17:00', isClosed: true },
    ],
    policyText: `1. Deposit & Payment
- A non-refundable ₦10,000 deposit is required to secure your appointment.
- Payment must be completed within 30 mins or your slot will be forfeited.

2. Reschedule & Cancellation
- Appointments may be rescheduled with at least 12 hours notice.
- Late cancellations, no-shows or reschedules made within the 12 hour period will result in deposit forfeiture.

3. Arrival
- Please arrive on time.
- A 15 min grace period applies after which a ₦5,000 lateness fee applies.
- Arrivals after 20 mins may be rescheduled or cancelled.

4. Prep & Add-ons
- Nails must be bare & polish-free (unless soak-off or removal is booked).
- Additional services without prior booking may not be accommodated.

5. Health & Safety
- Services cannot be done on nails with infections, wounds, or contagious skin conditions.

6. Guests
- Be polite and respectful; disruptive behavior may result in service refusal.
- No children allowed.
- 1 extra guest is permitted per appointment.`
  });

  const DAY_ORDER = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.hours) {
          const raw = Array.isArray(data.hours) ? data.hours : Object.values(data.hours);
          data.hours = [...(raw as any[])].sort(
            (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
          );
        }
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (!res.ok) {
        toast.error('Failed to save settings. Please try again.');
        setSaving(false);
        return;
      }
      toast.success('Settings saved successfully!');
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to save settings. Please try again.');
    }
    setSaving(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading('Uploading image...');
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData
      });
      
      if (!res.ok) {
        toast.error('Failed to upload image', { id: toastId });
        return;
      }
      
      const data = await res.json();
      setSettings({ ...settings, heroImage: data.url });
      toast.success('Image uploaded successfully', { id: toastId });
    } catch (error) {
      toast.error('Failed to upload image', { id: toastId });
    }
  };

  const handleHourChange = (index: number, field: string, value: any) => {
    const newHours = [...settings.hours];
    newHours[index] = { ...newHours[index], [field]: value };
    setSettings({ ...settings, hours: newHours });
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A1414]"></div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-full p-6 md:p-10 shadow-sm border border-black/5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-serif text-[#1A1414]">Storefront Settings</h1>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-[#1A1414] text-white rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="flex border-b border-gray-100 mb-8 overflow-x-auto [&::-webkit-scrollbar]:hidden">
        {['General', 'Hours', 'Policies'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
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

      <form onSubmit={handleSave} className="max-w-2xl">
        {activeTab === 'General' && (
          <div className="space-y-5 pb-20">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Store Name</label>
              <input 
                type="text" 
                value={settings.storeName}
                onChange={e => setSettings({...settings, storeName: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1A1414]" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Phone</label>
                <input 
                  type="text" 
                  value={settings.phone}
                  onChange={e => setSettings({...settings, phone: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1A1414]" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Instagram Handle</label>
                <input 
                  type="text" 
                  value={settings.instagram}
                  onChange={e => setSettings({...settings, instagram: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1A1414]" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Admin Alert Email</label>
                <input 
                  type="email" 
                  placeholder="Where to send booking notifications"
                  value={settings.adminEmail || ''}
                  onChange={e => setSettings({...settings, adminEmail: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1A1414]" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Required Deposit (%)</label>
                <input 
                  type="number" 
                  min="0"
                  max="100"
                  value={settings.depositPercentage || 30}
                  onChange={e => setSettings({...settings, depositPercentage: parseInt(e.target.value) || 0})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1A1414]" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Bank Account Details</label>
              <textarea 
                rows={3}
                placeholder="e.g. GTBank - 0123456789 - E.star SleekNails"
                value={settings.bankDetails || ''}
                onChange={e => setSettings({...settings, bankDetails: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1A1414]" 
              />
              <p className="text-xs text-gray-500 mt-1">This will be printed on pending invoices for clients to make transfers.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Storefront Hero Image</label>
              <div className="flex gap-4 items-center">
                {settings.heroImage && (
                  <img src={settings.heroImage} alt="Hero" className="h-16 w-32 object-cover rounded-lg border border-gray-200" />
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Store Address</label>
              <input 
                type="text" 
                value={settings.address}
                onChange={e => setSettings({...settings, address: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1A1414]" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Store Bio / Description</label>
              <textarea 
                rows={3}
                value={settings.bio}
                onChange={e => setSettings({...settings, bio: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1A1414] resize-none" 
              />
            </div>
          </div>
        )}

        {activeTab === 'Hours' && (
          <div className="space-y-4 pb-20">
            <p className="text-sm text-gray-500 mb-4">Set your standard operating hours. These will dictate what time slots are available to customers.</p>
            {settings.hours.map((hour, idx) => (
              <div key={hour.day} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50/50 gap-4">
                <div className="w-28 font-semibold text-gray-700 capitalize">{hour.day}</div>
                
                <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={hour.isClosed}
                    onChange={e => handleHourChange(idx, 'isClosed', e.target.checked)}
                    className="w-4 h-4 accent-[#1A1414]"
                  />
                  Closed
                </label>

                {!hour.isClosed ? (
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <select 
                      value={hour.open}
                      onChange={e => handleHourChange(idx, 'open', e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none bg-white font-medium" 
                    >
                      {Array.from({ length: 24 }).map((_, i) => {
                        const val = i.toString().padStart(2, '0') + ':00';
                        const display = i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`;
                        return <option key={val} value={val}>{display}</option>;
                      })}
                    </select>
                    <span className="text-gray-400 font-medium">to</span>
                    <select 
                      value={hour.close}
                      onChange={e => handleHourChange(idx, 'close', e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none bg-white font-medium" 
                    >
                      {Array.from({ length: 24 }).map((_, i) => {
                        const val = i.toString().padStart(2, '0') + ':00';
                        const display = i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`;
                        return <option key={val} value={val}>{display}</option>;
                      })}
                    </select>
                  </div>
                ) : (
                  <div className="flex-1 text-right text-sm text-gray-400 italic">Not available</div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Policies' && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Cancellation & Arrival Policy</label>
              <textarea 
                rows={10}
                value={settings.policyText}
                onChange={e => setSettings({...settings, policyText: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1A1414] resize-none" 
                placeholder="Enter your storefront policies here..."
              />
              <p className="text-xs text-gray-500 mt-2">This will be displayed on the public Policy & Terms page.</p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
