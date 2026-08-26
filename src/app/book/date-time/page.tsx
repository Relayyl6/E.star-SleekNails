'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DateTimeSelection() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Dummy calendar data (Current month + next 14 days)
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1); // start from tomorrow
    return {
      date: d.getDate(),
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      fullDate: d,
      isFullyBooked: i === 3 || i === 7 // mock fully booked days
    };
  });

  const availableSlots = [
    "09:00 AM", "10:30 AM", "12:00 PM", "02:30 PM", "04:00 PM"
  ];

  const handleContinue = () => {
    if (selectedDate !== null && selectedTime !== null) {
      // Typically save to context or local storage here
      router.push('/book/details');
    }
  };

  const selectedDayInfo = days.find(d => d.date === selectedDate);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl text-[#1A1414] mb-3">Select Date & Time</h1>
        <p className="text-gray-500">All appointments are automatically held for 30 minutes while you complete checkout.</p>
      </div>

      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium text-lg text-[#1A1414]">October 2026</h2>
          <div className="flex gap-2">
            <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-[#1A1414]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>
        </div>

        {/* Date Horizontal Scroll */}
        <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar">
          {days.map((day, idx) => (
            <div 
              key={idx}
              onClick={() => !day.isFullyBooked && setSelectedDate(day.date)}
              className={`flex flex-col items-center justify-center min-w-[70px] h-24 rounded-2xl border transition-all cursor-pointer ${
                day.isFullyBooked 
                  ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed' 
                  : selectedDate === day.date 
                    ? 'border-[#1A1414] bg-[#1A1414] text-white shadow-lg scale-105'
                    : 'border-gray-200 bg-white hover:border-[#F8D9CE] text-[#1A1414]'
              }`}
            >
              <span className={`text-xs font-semibold uppercase mb-1 ${selectedDate === day.date ? 'text-white/80' : 'text-gray-400'}`}>{day.dayName}</span>
              <span className="text-xl font-bold">{day.date}</span>
              {day.isFullyBooked && <span className="text-[10px] text-red-400 mt-1 font-bold">FULL</span>}
            </div>
          ))}
        </div>
      </div>

      {selectedDate && selectedDayInfo?.isFullyBooked ? (
         <div className="bg-red-50 text-red-800 p-6 rounded-2xl text-center border border-red-100">
            <h3 className="font-semibold mb-2">This day is fully booked</h3>
            <p className="text-sm mb-4">Want to be notified if a spot opens up?</p>
            <button className="bg-red-600 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-red-700">Join Waitlist</button>
         </div>
      ) : selectedDate ? (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <h2 className="font-medium text-lg text-[#1A1414] mb-4">Available Time Slots</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-10">
            {availableSlots.map((time, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedTime(time)}
                className={`py-3 rounded-xl border font-semibold text-sm transition-all ${
                  selectedTime === time
                    ? 'border-[#F8D9CE] bg-[#F8D9CE]/20 text-[#1A1414] ring-2 ring-[#F8D9CE]'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-10 text-center border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 mb-10">
          Please select a date to view available times.
        </div>
      )}

      <div className="flex justify-between items-center border-t border-black/5 pt-6">
        <button onClick={() => router.push('/services')} className="text-gray-500 hover:text-black font-medium text-sm">
          Back
        </button>
        <button 
          onClick={handleContinue}
          disabled={!selectedDate || !selectedTime}
          className="bg-primary text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Details
        </button>
      </div>

    </div>
  );
}
