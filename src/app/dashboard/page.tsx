'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { toast } from 'sonner';

export default function MyBookingsPage() {
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Past' | 'Waitlist'>('Upcoming');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyBookings = async () => {
      if (!auth.currentUser) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/bookings?type=full&email=${encodeURIComponent(auth.currentUser.email)}`);
        if (!res.ok) {
          toast.error("Failed to fetch bookings");
          return;
        }
        const data = await res.json();
        
        // Sort bookings by date and time (newest first)
        const sortedBookings = data.sort((a: any, b: any) => {
          const dateA = new Date(`${a.date} ${a.time || '00:00'}`).getTime();
          const dateB = new Date(`${b.date} ${b.time || '00:00'}`).getTime();
          return dateB - dateA;
        });
        
        setBookings(sortedBookings);
      } catch (error) {
        console.error("Error fetching bookings", error);
        toast.error("Failed to fetch bookings.");
      }
      setLoading(false);
    };
    
    // Listen for auth state since this is a client component
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) fetchMyBookings();
    });
    return () => unsubscribe();
  }, []);

  // Simple mock filtering based on status/dates (you'd refine this with actual Date objects)
  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'Waitlist') return b.status === 'Waitlist';
    if (activeTab === 'Upcoming') return b.status === 'Confirmed' || b.status === 'Pending';
    return b.status === 'Completed' || b.status === 'Cancelled';
  });

  return (
    <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-black/5">
      <h1 className="text-3xl font-serif text-[#1A1414] mb-8">My Bookings</h1>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-100 mb-8 overflow-x-auto [&::-webkit-scrollbar]:hidden">
        {['Upcoming', 'Past', 'Waitlist'].map(tab => (
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
            <div key={booking.id} className="p-5 border border-gray-100 rounded-2xl hover:border-black/10 transition-colors flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-lg">{new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {booking.time}</h3>
                  <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-md text-gray-600 uppercase">{booking.status || 'PENDING'}</span>
                </div>
                <p className="text-gray-500 text-sm">
                  {booking.items?.map((i:any) => i.name).join(', ') || 'Custom Service'} • <span className="font-semibold text-primary">{booking.total || '₦0'}</span>
                </p>
              </div>
              
              <div className="flex gap-2 w-full md:w-auto">
                <button className="flex-1 md:flex-none px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                  Details
                </button>
                {activeTab === 'Upcoming' && (
                  <button className="flex-1 md:flex-none px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
