'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

export default function DateTimeSelection() {
  const router = useRouter();
  const { bookingDetails, setBookingDetails, clearCart, timeLeft, startTimer } = useCart();
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    bookingDetails.date ? new Date(bookingDetails.date) : null
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(bookingDetails.time);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // New States
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  
  const [allBookings, setAllBookings] = useState<Record<string, string[]>>({});
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  
  const [storeHours, setStoreHours] = useState<any[]>([]);
  const [isHoursLoaded, setIsHoursLoaded] = useState(false);

  // Helper to get day name from date (e.g., 'monday')
  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  };

  // Fixed appointment slots — filter to only those within open/close hours
  const FIXED_SLOT_HOURS = [9, 12, 15, 17]; // 9:00 AM, 12:00 PM, 3:00 PM, 5:00 PM
  const DAY_ORDER = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  const generateSlotsForDate = (date: Date) => {
    if (!isHoursLoaded || storeHours.length === 0) return [];
    
    const dayName = getDayName(date);
    const daySettings = storeHours.find(h => h.day === dayName);
    
    if (!daySettings || daySettings.isClosed) return [];
    
    const [openH] = daySettings.open.split(':').map(Number);
    const [closeH] = daySettings.close.split(':').map(Number);

    const today = new Date();
    const isToday = date.getFullYear() === today.getFullYear() && 
                    date.getMonth() === today.getMonth() && 
                    date.getDate() === today.getDate();
    const currentHour = today.getHours();

    const toSlot = (h: number) => {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayH = h > 12 ? h - 12 : (h === 0 ? 12 : h);
      return `${displayH.toString().padStart(2, '0')}:00 ${ampm}`;
    };

    let validHours = FIXED_SLOT_HOURS.filter(h => h >= openH && (closeH <= openH || h < closeH));
    
    if (isToday) {
      validHours = validHours.filter(h => h > currentHour);
    }
    
    return validHours.map(toSlot);
  };

  const allSlots = selectedDate ? generateSlotsForDate(selectedDate) : [];

  useEffect(() => {
    startTimer();
  }, [startTimer]);

  useEffect(() => {
    if (timeLeft === 0) {
      router.push('/');
    }
  }, [timeLeft, router]);

  // Fetch all bookings for availability checking
  useEffect(() => {
    fetch('/api/bookings', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.bookingsByDate) {
          setAllBookings(data.bookingsByDate);
        }
      })
      .catch(err => console.error("Failed to fetch all bookings", err))
      .finally(() => setIsLoadingBookings(false));
  }, []);

  // Fetch store operating hours for dynamic slot generation
  useEffect(() => {
    const fetchHours = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.hours) {
            // Firebase may convert arrays to objects with numeric keys — convert back and sort by day order
            const raw = Array.isArray(data.hours) ? data.hours : Object.values(data.hours);
            const sorted = [...(raw as any[])].sort(
              (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
            );
            setStoreHours(sorted);
          } else {
            // Fallback default hours if not yet saved by vendor
            setStoreHours([
              { day: 'monday', open: '09:00', close: '18:00', isClosed: false },
              { day: 'tuesday', open: '09:00', close: '18:00', isClosed: false },
              { day: 'wednesday', open: '09:00', close: '18:00', isClosed: false },
              { day: 'thursday', open: '09:00', close: '18:00', isClosed: false },
              { day: 'friday', open: '09:00', close: '19:00', isClosed: false },
              { day: 'saturday', open: '09:00', close: '19:00', isClosed: false },
              { day: 'sunday', open: '12:00', close: '17:00', isClosed: true },
            ]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch store hours", err);
      } finally {
        setIsHoursLoaded(true);
      }
    };
    fetchHours();
  }, []);

  const toLocalDateStr = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const bookedSlots = selectedDate ? (allBookings[toLocalDateStr(selectedDate)] || []) : [];
  
  const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Helper to get days in month
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      const pad = (n: number) => n.toString().padStart(2, '0');
      const localDateStr = `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}`;
      setBookingDetails(prev => ({
        ...prev,
        date: localDateStr,
        time: selectedTime
      }));
      router.push('/book/details');
    }
  };

  const [isSubmittingWaitlist, setIsSubmittingWaitlist] = useState(false);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(waitlistEmail && selectedDate) {
      setIsSubmittingWaitlist(true);
      try {
        const res = await fetch('/api/waitlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: waitlistEmail,
            date: `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`
          })
        });
        
        if (res.ok) {
          setWaitlistSuccess(true);
          toast.success("You've been added to the waitlist!");
        } else {
          toast.error("Something went wrong joining the waitlist.");
        }
      } catch (error) {
        console.error("Failed to submit waitlist:", error);
        toast.error("Failed to connect. Please check your internet.");
      } finally {
        setIsSubmittingWaitlist(false);
      }
    }
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    // Empty cells for days before the 1st
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 md:h-12"></div>);
    }

    // Actual days
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      // Use local YYYY-MM-DD string — NOT toISOString() which shifts to UTC
      const pad = (n: number) => n.toString().padStart(2, '0');
      const dateStr = `${year}-${pad(month + 1)}-${pad(i)}`;
      
      const isPast = date < today;
      const isSelected = selectedDate?.toDateString() === date.toDateString();
      
      const slotsForThisDay = generateSlotsForDate(date);
      const isClosed = isHoursLoaded && slotsForThisDay.length === 0;
      
      const dayBookings = allBookings[dateStr] || [];
      const isFullyBooked = !isClosed && dayBookings.length >= slotsForThisDay.length;
      const hasSomeBookings = dayBookings.length > 0 && !isFullyBooked;
      
      const isDisabled = isPast || isClosed || isFullyBooked;

      days.push(
        <div 
          key={i}
          onClick={() => {
            if(!isDisabled) {
              setSelectedDate(date);
              setSelectedTime(null);
              setShowWaitlist(false);
              setWaitlistSuccess(false);
            }
          }}
          className={`relative h-10 md:h-12 rounded-xl flex flex-col items-center justify-center border transition-all ${
            isDisabled 
              ? 'opacity-30 cursor-not-allowed border-transparent bg-transparent'
              : isSelected
                  ? 'border-[#1A1414] bg-[#1A1414] text-white shadow-md cursor-pointer'
                  : 'border-gray-200 bg-white hover:border-primary/30 text-[#1A1414] cursor-pointer'
          }`}
        >
          <span className="font-bold text-sm">{i}</span>
          
          {/* Green dot for partially booked days */}
          {hasSomeBookings && !isDisabled && !isSelected && (
            <span className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-green-500"></span>
          )}
          {/* White dot if selected and partially booked */}
          {hasSomeBookings && !isDisabled && isSelected && (
            <span className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-white/50"></span>
          )}
        </div>
      );
    }
    return days;
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl text-[#1A1414] mb-3">Select Date & Time</h1>
          <p className="text-gray-500">All appointments are automatically held for 30 minutes while you complete checkout.</p>
        </div>
        <div className="bg-[#1A1414] text-white px-4 py-2 rounded-xl text-center hidden md:block shrink-0 ml-4">
          <p className="text-[10px] uppercase font-bold tracking-widest text-white/50 mb-0.5">Time Left</p>
          <p className="font-mono font-bold text-lg leading-none">{formatTime(timeLeft)}</p>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 items-start mb-10">
        <div className="bg-white border border-gray-100 p-4 md:p-6 rounded-3xl shadow-sm w-full max-w-md shrink-0 mx-auto xl:mx-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-medium text-lg text-[#1A1414]">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <button onClick={handlePrevMonth} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-[#1A1414] transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
              </button>
              <button onClick={handleNextMonth} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-[#1A1414] transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {renderCalendar()}
          </div>
        </div>

        <div className="flex-1 w-full">
          {selectedDate ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 xl:slide-in-from-right-4">
              {showWaitlist ? (
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                  {waitlistSuccess ? (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                      <h3 className="font-bold text-lg mb-1">You're on the list!</h3>
                      <p className="text-sm text-gray-500 mb-4">We'll email {waitlistEmail} if a slot opens up on {selectedDate.toLocaleDateString()}.</p>
                      <button onClick={() => setShowWaitlist(false)} className="text-sm font-semibold text-primary hover:underline">Go back to time slots</button>
                    </div>
                  ) : (
                    <form onSubmit={handleWaitlistSubmit}>
                      <h3 className="font-bold text-lg mb-2">Join Waitlist</h3>
                      <p className="text-sm text-gray-500 mb-4">Get notified if someone cancels on <strong>{selectedDate.toLocaleDateString()}</strong>.</p>
                      <input 
                        type="email" 
                        required 
                        placeholder="Enter your email address" 
                        value={waitlistEmail}
                        onChange={(e) => setWaitlistEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 mb-3 focus:outline-none focus:border-primary"
                      />
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setShowWaitlist(false)} disabled={isSubmittingWaitlist} className="flex-1 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50">Cancel</button>
                        <button type="submit" disabled={isSubmittingWaitlist} className="flex-1 py-3 bg-[#1A1414] text-white rounded-xl font-semibold hover:bg-black transition-colors shadow-md disabled:opacity-50 flex justify-center items-center">
                          {isSubmittingWaitlist ? (
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          ) : (
                            'Join List'
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex flex-col justify-between mb-6 gap-2">
                     <h2 className="font-medium text-xl text-[#1A1414]">Available Time Slots</h2>
                     <button onClick={() => setShowWaitlist(true)} className="text-xs font-semibold text-primary underline underline-offset-2 hover:text-[#1A1414] w-fit">Join Waitlist instead</button>
                  </div>
                  <div className="grid grid-cols-2 xl:grid-cols-1 gap-3 max-w-xs">
                    {isLoadingBookings ? (
                      <div className="col-span-full py-10 flex flex-col items-center justify-center text-gray-400">
                        <svg className="animate-spin h-6 w-6 text-primary mb-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <p className="text-xs font-medium">Checking availability...</p>
                      </div>
                    ) : allSlots.map((time, idx) => {
                      const isBooked = bookedSlots.includes(time);
                      return (
                        <button
                          key={idx}
                          disabled={isBooked}
                          onClick={() => !isBooked && setSelectedTime(time)}
                          className={`py-3 rounded-xl border font-semibold text-sm transition-all flex justify-center items-center gap-2 ${
                            isBooked
                              ? 'border-transparent bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                              : selectedTime === time
                                ? 'border-[#1A1414] bg-[#1A1414] text-white shadow-md'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {time} {isBooked && <span className="text-[10px] uppercase font-bold text-gray-400 bg-white px-2 py-0.5 rounded-md">Full</span>}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-10 text-center border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
              Please select a date from the calendar to view available times.
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center border-t border-black/5 pt-6">
        <button onClick={() => router.push('/services')} className="text-gray-500 hover:text-black font-medium text-sm">
          Back to Services
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
