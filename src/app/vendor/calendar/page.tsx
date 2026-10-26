'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { 
  FiCalendar, 
  FiClock, 
  FiLock, 
  FiUnlock, 
  FiPlus, 
  FiTrash2, 
  FiEdit2, 
  FiUser, 
  FiPhone, 
  FiMail, 
  FiInstagram, 
  FiChevronLeft, 
  FiChevronRight, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiX,
  FiGlobe,
  FiFilter
} from 'react-icons/fi';

const STANDARD_SLOTS = ['09:00 AM', '12:00 PM', '03:00 PM', '05:00 PM'];
const DAY_ORDER = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function normalizeTimeString(input: string): string {
  const trimmed = (input || '').trim();
  if (!trimmed) return '';

  const match = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (match) {
    let [_, hStr, mStr, ampmStr] = match;
    let h = parseInt(hStr, 10);
    let m = mStr ? parseInt(mStr, 10) : 0;
    let ampm = ampmStr ? ampmStr.toUpperCase() : null;

    if (!ampm) {
      if (h >= 1 && h <= 8) ampm = 'PM';
      else if (h >= 9 && h <= 11) ampm = 'AM';
      else if (h === 12) ampm = 'PM';
      else if (h > 12 && h < 24) {
        h -= 12;
        ampm = 'PM';
      } else ampm = 'AM';
    }

    const formattedH = h.toString().padStart(2, '0');
    const formattedM = m.toString().padStart(2, '0');
    return `${formattedH}:${formattedM} ${ampm}`;
  }
  return trimmed;
}

export default function VendorCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const today = new Date();
    return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  });

  const [bookings, setBookings] = useState<any[]>([]);
  const [storeHours, setStoreHours] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state for appointments list
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ONLINE' | 'OFFLINE' | 'BLOCKED'>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    date: selectedDateStr,
    time: '12:00 PM',
    customTime: '',
    lockMode: 'single', // 'single' | 'all_day' | 'custom'
    bookingType: 'offline', // 'offline' | 'block'
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    instagram: '',
    serviceName: '',
    total: '',
    notes: ''
  });

  // Fetch calendar data
  const fetchData = async () => {
    setLoading(true);
    try {
      const pad = (n: number) => n.toString().padStart(2, '0');
      const monthParam = `${currentMonth.getFullYear()}-${pad(currentMonth.getMonth() + 1)}`;
      const res = await fetch(`/api/vendor/calendar?month=${monthParam}&_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
        if (data.storeHours) setStoreHours(data.storeHours);
        if (data.services) setServices(data.services);
      } else {
        toast.error('Failed to load calendar data');
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error loading calendar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentMonth]);

  // Calendar Helpers
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    const pad = (n: number) => n.toString().padStart(2, '0');
    setSelectedDateStr(`${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`);
  };

  // Map bookings by date
  const bookingsByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    bookings.forEach(b => {
      if (!b.date || b.status === 'CANCELLED') return;
      if (!map[b.date]) map[b.date] = [];
      map[b.date].push(b);
    });
    return map;
  }, [bookings]);

  // Selected Day Bookings
  const selectedDayBookings = useMemo(() => {
    return bookingsByDate[selectedDateStr] || [];
  }, [bookingsByDate, selectedDateStr]);

  // Today YYYY-MM-DD string
  const todayStr = useMemo(() => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const today = new Date();
    return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  }, []);

  const isPastDay = selectedDateStr < todayStr;

  const isPastSlot = (timeSlot: string) => {
    if (selectedDateStr < todayStr) return true;
    if (selectedDateStr > todayStr) return false;

    // It's today - check if the hour has already passed
    const now = new Date();
    const match = (timeSlot || '').trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
    if (!match) return false;
    let h = parseInt(match[1], 10);
    let min = match[2] ? parseInt(match[2], 10) : 0;
    let ampm = match[3] ? match[3].toUpperCase() : 'AM';
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    const slotMinutes = h * 60 + min;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    return slotMinutes <= nowMinutes;
  };

  // Determine standard slots for the selected date
  const selectedDaySlots = useMemo(() => {
    const [y, m, d] = selectedDateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const daySetting = storeHours.find((h: any) => h.day === dayName);

    const isClosed = daySetting?.isClosed ?? false;

    // If day is closed in store hours, standard slots are closed, but we still display any booked/offline slots
    const set = isClosed ? new Set<string>() : new Set(STANDARD_SLOTS);
    selectedDayBookings.forEach(b => {
      if (b.time) set.add(b.time);
    });

    return Array.from(set).sort((a, b) => {
      const parseTime = (t: string) => {
        const trimmed = (t || '').trim();
        const match = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
        if (match) {
          let h = parseInt(match[1], 10);
          let m = match[2] ? parseInt(match[2], 10) : 0;
          let ampm = match[3] ? match[3].toUpperCase() : 'AM';
          if (ampm === 'PM' && h !== 12) h += 12;
          if (ampm === 'AM' && h === 12) h = 0;
          return h * 60 + m;
        }
        return 9999;
      };
      return parseTime(a) - parseTime(b);
    });
  }, [selectedDateStr, storeHours, selectedDayBookings]);

  const isStoreClosedOnDay = useMemo(() => {
    const [y, m, d] = selectedDateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const daySetting = storeHours.find((h: any) => h.day === dayName);
    return daySetting?.isClosed ?? false;
  }, [selectedDateStr, storeHours]);

  // Open modal for new lock / booking
  const handleOpenModal = (time?: string) => {
    setEditingBooking(null);
    const modalDate = selectedDateStr < todayStr ? todayStr : selectedDateStr;
    setFormData({
      date: modalDate,
      time: time || '12:00 PM',
      customTime: '',
      lockMode: 'single',
      bookingType: 'offline',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      instagram: '',
      serviceName: '',
      total: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  // Open modal to edit existing offline booking / block
  const handleEditBooking = (b: any) => {
    setEditingBooking(b);
    const isStandard = STANDARD_SLOTS.includes(b.time);
    setFormData({
      date: b.date || selectedDateStr,
      time: isStandard ? b.time : '12:00 PM',
      customTime: isStandard ? '' : (b.time || ''),
      lockMode: isStandard ? 'single' : 'custom',
      bookingType: b.isBlocked ? 'block' : 'offline',
      firstName: b.firstName === 'Blocked' || b.firstName === 'Walk-in' ? '' : b.firstName || '',
      lastName: b.lastName === 'Slot' || b.lastName === 'Client' ? '' : b.lastName || '',
      email: b.email || '',
      phone: b.phone || '',
      instagram: b.instagram || '',
      serviceName: b.serviceName || b.items?.[0]?.name || '',
      total: b.total ? String(b.total).replace(/\D/g, '') : '',
      notes: b.notes || ''
    });
    setIsModalOpen(true);
  };

  // Quick lock entire day
  const handleLockEntireDay = async () => {
    if (!window.confirm(`Are you sure you want to lock ALL slots on ${selectedDateStr}? Online customers will not be able to book this day.`)) {
      return;
    }

    const toastId = toast.loading('Locking entire day...');
    try {
      const res = await fetch('/api/vendor/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDateStr,
          time: STANDARD_SLOTS,
          isBlocked: true,
          notes: 'Entire day locked by studio'
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Locked ${data.count} slot(s) for ${selectedDateStr}`, { id: toastId });
        fetchData();
      } else {
        toast.error(data.error || 'Failed to lock day', { id: toastId });
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error', { id: toastId });
    }
  };

  // Submit Modal Form (Create or Update)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (formData.date < todayStr) {
        toast.error('Cannot lock or schedule slots for past dates');
        setIsSubmitting(false);
        return;
      }

      let resolvedTime: string | string[] = formData.time;
      if (formData.lockMode === 'all_day') {
        resolvedTime = STANDARD_SLOTS;
      } else if (formData.lockMode === 'custom') {
        const rawCustom = formData.customTime.trim();
        if (!rawCustom) {
          toast.error('Please enter a valid custom time');
          setIsSubmitting(false);
          return;
        }
        resolvedTime = normalizeTimeString(rawCustom);
      }

      if (editingBooking) {
        // PATCH
        const res = await fetch('/api/vendor/calendar', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingBooking.id,
            date: formData.date,
            time: resolvedTime,
            firstName: formData.firstName.trim() || (formData.bookingType === 'block' ? 'Blocked' : 'Walk-in'),
            lastName: formData.lastName.trim() || (formData.bookingType === 'block' ? 'Slot' : 'Client'),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            instagram: formData.instagram.trim().replace(/^@/, ''),
            serviceName: formData.serviceName.trim(),
            notes: formData.notes.trim(),
            total: formData.total ? Number(formData.total) : 0,
            isBlocked: formData.bookingType === 'block'
          })
        });

        if (res.ok) {
          toast.success('Booking updated successfully');
          setIsModalOpen(false);
          fetchData();
        } else {
          const err = await res.json();
          toast.error(err.error || 'Failed to update booking');
        }
      } else {
        // POST (Create)
        const res = await fetch('/api/vendor/calendar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: formData.date,
            time: resolvedTime,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            instagram: formData.instagram,
            serviceName: formData.serviceName,
            total: formData.total ? Number(formData.total) : 0,
            notes: formData.notes,
            isBlocked: formData.bookingType === 'block'
          })
        });

        const data = await res.json();
        if (res.ok) {
          toast.success(data.message || 'Slot locked successfully! It is now blocked on the website.');
          setIsModalOpen(false);
          fetchData();
        } else {
          toast.error(data.error || 'Failed to lock slot');
        }
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to submit');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Unlock / Delete Slot
  const handleUnlockSlot = async (id: string, time: string) => {
    if (!window.confirm(`Unlock slot ${time}? It will immediately be available for online booking on the website.`)) {
      return;
    }

    const toastId = toast.loading('Unlocking slot...');
    try {
      const res = await fetch(`/api/vendor/calendar?id=${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        toast.success(`Slot ${time} unlocked and re-opened for online booking.`, { id: toastId });
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to unlock slot', { id: toastId });
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error', { id: toastId });
    }
  };

  // Monthly Metrics
  const stats = useMemo(() => {
    const total = bookings.filter(b => b.status !== 'CANCELLED').length;
    const online = bookings.filter(b => !b.isOffline && b.status !== 'CANCELLED').length;
    const offline = bookings.filter(b => b.isOffline && !b.isBlocked && b.status !== 'CANCELLED').length;
    const blocked = bookings.filter(b => b.isBlocked && b.status !== 'CANCELLED').length;
    return { total, online, offline, blocked };
  }, [bookings]);

  return (
    <div className="bg-white min-h-full p-6 md:p-10 shadow-sm border border-black/5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#1A1414] font-bold">Calendar & Schedule</h1>
          <p className="text-sm text-gray-500 mt-1">
            Lock slots for off-site clients, manage appointments, or block studio unavailable hours.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-6 py-3.5 bg-[#1A1414] text-white rounded-2xl text-sm font-bold hover:bg-black transition-all shadow-md flex items-center gap-2.5 shrink-0"
        >
          <FiLock size={16} />
          Lock Slot / Add Offline Client
        </button>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-5 border border-gray-100 rounded-2xl bg-gray-50/70">
          <p className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-1">Total This Month</p>
          <p className="text-3xl font-bold text-[#1A1414]">{stats.total}</p>
        </div>
        <div className="p-5 border border-blue-100 rounded-2xl bg-blue-50/50">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <p className="text-xs uppercase tracking-wider font-bold text-blue-700">Website Bookings</p>
          </div>
          <p className="text-3xl font-bold text-blue-900">{stats.online}</p>
        </div>
        <div className="p-5 border border-emerald-100 rounded-2xl bg-emerald-50/50">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <p className="text-xs uppercase tracking-wider font-bold text-emerald-700">Offline / Walk-ins</p>
          </div>
          <p className="text-3xl font-bold text-emerald-900">{stats.offline}</p>
        </div>
        <div className="p-5 border border-amber-100 rounded-2xl bg-amber-50/50">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <p className="text-xs uppercase tracking-wider font-bold text-amber-700">Locked / Blocked</p>
          </div>
          <p className="text-3xl font-bold text-amber-900">{stats.blocked}</p>
        </div>
      </div>

      {/* Main Calendar + Day Schedule Split */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Month Calendar (7 cols) */}
        <div className="xl:col-span-7 bg-white border border-gray-200 p-6 rounded-3xl shadow-sm">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="font-serif text-2xl font-bold text-[#1A1414]">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <button
                onClick={handleToday}
                className="text-xs font-semibold px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Today
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrevMonth}
                className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-[#1A1414] transition-colors"
                title="Previous Month"
              >
                <FiChevronLeft size={18} />
              </button>
              <button
                onClick={handleNextMonth}
                className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-[#1A1414] transition-colors"
                title="Next Month"
              >
                <FiChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells before month starts */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[72px] rounded-2xl bg-gray-50/40 border border-transparent" />
            ))}

            {/* Actual Month Days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const pad = (n: number) => n.toString().padStart(2, '0');
              const dateStr = `${year}-${pad(month + 1)}-${pad(dayNum)}`;
              const dayBookings = bookingsByDate[dateStr] || [];

              const isSelected = selectedDateStr === dateStr;
              const hasOnline = dayBookings.some(b => !b.isOffline);
              const hasOffline = dayBookings.some(b => b.isOffline && !b.isBlocked);
              const hasBlocked = dayBookings.some(b => b.isBlocked);

              const todayObj = new Date();
              const isToday = todayObj.getFullYear() === year &&
                              todayObj.getMonth() === month &&
                              todayObj.getDate() === dayNum;
              const isPast = dateStr < todayStr;

              return (
                <div
                  key={dayNum}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`min-h-[78px] p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#1A1414] bg-[#1A1414] text-white shadow-lg ring-2 ring-[#1A1414]/20'
                      : isToday
                        ? 'border-primary/50 bg-primary/5 hover:border-primary text-[#1A1414]'
                        : isPast
                          ? 'border-gray-100 bg-gray-50/60 text-gray-400 hover:border-gray-300'
                          : 'border-gray-200 bg-white hover:border-gray-300 text-[#1A1414]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold ${isSelected ? 'text-white' : ''}`}>
                      {dayNum}
                    </span>
                    {isToday && (
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-primary text-white'
                      }`}>
                        Today
                      </span>
                    )}
                  </div>

                  {/* Booking / Lock Dots & Counts */}
                  {dayBookings.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {hasOnline && (
                        <span 
                          title="Website Booking"
                          className={`w-2 h-2 rounded-full ${isSelected ? 'bg-blue-300' : 'bg-blue-500'}`} 
                        />
                      )}
                      {hasOffline && (
                        <span 
                          title="Offline Client"
                          className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-300' : 'bg-emerald-500'}`} 
                        />
                      )}
                      {hasBlocked && (
                        <span 
                          title="Locked Slot"
                          className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-300' : 'bg-amber-500'}`} 
                        />
                      )}
                      <span className={`text-[10px] font-bold ml-auto ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                        {dayBookings.length}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-5 mt-6 pt-5 border-t border-gray-100 text-xs text-gray-600">
            <span className="font-bold text-[#1A1414]">Legend:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span>Website Booking</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Offline Client</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Locked / Blocked</span>
            </div>
          </div>
        </div>

        {/* Right: Selected Day Timeline & Slot Actions (5 cols) */}
        <div className="xl:col-span-5 bg-white border border-gray-200 p-6 rounded-3xl shadow-sm">
          {/* Day Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-gray-100 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs uppercase tracking-wider font-bold text-gray-400">Day Schedule</p>
                {isPastDay && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-500">
                    Past Date
                  </span>
                )}
                {isStoreClosedOnDay && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                    Store Closed
                  </span>
                )}
              </div>
              <h3 className="font-serif text-xl font-bold text-[#1A1414]">
                {(() => {
                  const [y, m, d] = selectedDateStr.split('-').map(Number);
                  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });
                })()}
              </h3>
            </div>
            <div className="flex gap-2">
              {isPastDay ? (
                <span className="px-3.5 py-1.5 bg-gray-100 text-gray-500 rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <FiClock size={13} />
                  Past Date (Read Only)
                </span>
              ) : (
                <>
                  <button
                    onClick={handleLockEntireDay}
                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                    title="Lock all slots on this day so no one can book online"
                  >
                    <FiLock size={12} />
                    Lock Day
                  </button>
                  <button
                    onClick={() => handleOpenModal()}
                    className="px-3.5 py-1.5 bg-[#1A1414] hover:bg-black text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <FiPlus size={14} />
                    Lock Slot
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-1.5 my-4">
            {(['ALL', 'ONLINE', 'OFFLINE', 'BLOCKED'] as const).map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  activeFilter === f
                    ? 'bg-[#1A1414] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'ALL' ? 'All Slots' : f === 'ONLINE' ? 'Website' : f === 'OFFLINE' ? 'Offline' : 'Locked'}
              </button>
            ))}
          </div>

          {/* Time Slot List for the Selected Day */}
          <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
            {selectedDaySlots.length === 0 && (
              <div className="text-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500">
                <FiCalendar size={28} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm font-semibold text-gray-700">No active slots for this day</p>
                <p className="text-xs text-gray-400 mt-1">
                  {isStoreClosedOnDay 
                    ? 'The studio is closed on this day according to your operating hours.' 
                    : 'No appointments or slots have been scheduled.'}
                </p>
                {!isPastDay && (
                  <button
                    onClick={() => handleOpenModal()}
                    className="mt-4 px-4 py-2 bg-[#1A1414] text-white rounded-xl text-xs font-bold hover:bg-black transition-colors"
                  >
                    Add Offline Booking Anyway
                  </button>
                )}
              </div>
            )}

            {selectedDaySlots.map(timeSlot => {
              // Find if this slot has a booking
              const slotBooking = selectedDayBookings.find(b => b.time === timeSlot);
              const isSlotInPast = isPastSlot(timeSlot);

              // Apply active filter if there's a booking
              if (slotBooking) {
                if (activeFilter === 'ONLINE' && slotBooking.isOffline) return null;
                if (activeFilter === 'OFFLINE' && (!slotBooking.isOffline || slotBooking.isBlocked)) return null;
                if (activeFilter === 'BLOCKED' && !slotBooking.isBlocked) return null;
              } else {
                if (activeFilter !== 'ALL') return null;
              }

              return (
                <div
                  key={timeSlot}
                  className={`p-4 rounded-2xl border transition-all ${
                    !slotBooking
                      ? isSlotInPast
                        ? 'border-gray-100 bg-gray-50/50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                      : slotBooking.isBlocked
                        ? 'border-amber-200 bg-amber-50/40'
                        : slotBooking.isOffline
                          ? 'border-emerald-200 bg-emerald-50/40'
                          : 'border-blue-200 bg-blue-50/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-[#1A1414] flex items-center gap-1.5">
                        <FiClock size={14} className="text-gray-400" />
                        {timeSlot}
                      </span>

                      {/* Status Badges */}
                      {!slotBooking ? (
                        isSlotInPast ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500">
                            Past / Unbooked
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                            Open Online
                          </span>
                        )
                      ) : slotBooking.isBlocked ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                          <FiLock size={10} /> Locked Slot {isSlotInPast ? '(Past)' : ''}
                        </span>
                      ) : slotBooking.isOffline ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <FiUser size={10} /> Offline Client {isSlotInPast ? '(Past)' : ''}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 flex items-center gap-1">
                          <FiGlobe size={10} /> Website Booking {isSlotInPast ? '(Past)' : ''}
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      {!slotBooking ? (
                        !isSlotInPast ? (
                          <button
                            onClick={() => handleOpenModal(timeSlot)}
                            className="px-2.5 py-1 text-xs font-bold text-gray-700 hover:text-black bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1"
                            title="Lock this slot for off-site booking"
                          >
                            <FiLock size={12} /> Lock
                          </button>
                        ) : (
                          <span className="text-[11px] text-gray-400 font-medium italic px-1">
                            Passed
                          </span>
                        )
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditBooking(slotBooking)}
                            className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                            title="Edit / Reschedule booking"
                          >
                            <FiEdit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleUnlockSlot(slotBooking.id, timeSlot)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Unlock slot (re-open online)"
                          >
                            <FiUnlock size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Booking Details if occupied */}
                  {slotBooking && (
                    <div className="mt-3 pt-3 border-t border-black/5 text-xs text-gray-600 space-y-1">
                      <div className="flex items-center justify-between font-bold text-gray-900">
                        <span>
                          {slotBooking.firstName} {slotBooking.lastName}
                        </span>
                        {slotBooking.total && (
                          <span className="text-primary font-bold">
                            {slotBooking.total}
                          </span>
                        )}
                      </div>

                      {slotBooking.serviceName && (
                        <p className="text-gray-700 font-medium">
                          Service: <span className="text-gray-900 font-semibold">{slotBooking.serviceName}</span>
                        </p>
                      )}

                      {slotBooking.items?.[0]?.name && !slotBooking.serviceName && (
                        <p className="text-gray-700 font-medium">
                          Service: <span className="text-gray-900 font-semibold">{slotBooking.items[0].name}</span>
                        </p>
                      )}

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-500 pt-1">
                        {slotBooking.phone && (
                          <span className="flex items-center gap-1">
                            <FiPhone size={11} /> {slotBooking.phone}
                          </span>
                        )}
                        {slotBooking.email && (
                          <span className="flex items-center gap-1">
                            <FiMail size={11} /> {slotBooking.email}
                          </span>
                        )}
                        {slotBooking.instagram && (
                          <span className="flex items-center gap-1">
                            <FiInstagram size={11} /> @{slotBooking.instagram}
                          </span>
                        )}
                      </div>

                      {slotBooking.notes && (
                        <p className="text-gray-500 italic bg-white/70 p-2 rounded-lg border border-black/5 mt-1.5">
                          "{slotBooking.notes}"
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* LOCK SLOT / OFFLINE BOOKING MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1A1414]">
                  {editingBooking ? 'Edit Offline Booking / Slot' : 'Lock Slot / Add Offline Client'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Locked slots are immediately blocked from online customer booking.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-5">
              {/* Type Switcher */}
              {!editingBooking && (
                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, bookingType: 'offline' })}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                      formData.bookingType === 'offline'
                        ? 'bg-white text-[#1A1414] shadow-sm'
                        : 'text-gray-500 hover:text-black'
                    }`}
                  >
                    Offline Client Booking
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, bookingType: 'block' })}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                      formData.bookingType === 'block'
                        ? 'bg-white text-[#1A1414] shadow-sm'
                        : 'text-gray-500 hover:text-black'
                    }`}
                  >
                    Block Time / Unavailable
                  </button>
                </div>
              )}

              {/* Date & Time Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Time Slot *
                  </label>
                  <select
                    value={formData.lockMode === 'all_day' ? 'all_day' : formData.lockMode === 'custom' ? 'custom' : formData.time}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === 'all_day') {
                        setFormData({ ...formData, lockMode: 'all_day' });
                      } else if (val === 'custom') {
                        setFormData({ ...formData, lockMode: 'custom' });
                      } else {
                        setFormData({ ...formData, lockMode: 'single', time: val });
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black bg-white"
                  >
                    <optgroup label="Standard Slots">
                      {STANDARD_SLOTS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Custom / Bulk">
                      {!editingBooking && (
                        <option value="all_day">Lock Entire Day (All 4 Slots)</option>
                      )}
                      <option value="custom">Custom Time...</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              {formData.lockMode === 'custom' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Custom Time (e.g. 10:30 AM, 02:00 PM) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10:30 AM"
                    value={formData.customTime}
                    onChange={e => setFormData({ ...formData, customTime: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black"
                  />
                </div>
              )}

              {editingBooking && (
                <p className="text-[11px] text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                  💡 <strong>Rescheduling:</strong> Changing the date or time will automatically check the calendar to ensure the target slot is not already booked.
                </p>
              )}

              {/* Optional Client Details Section */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Client Details <span className="normal-case text-gray-400 font-normal">(Optional)</span>
                  </h4>
                  <span className="text-[11px] text-gray-400">Leave blank to simply lock slot</span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <input
                      type="text"
                      placeholder="First Name (e.g. Amaka)"
                      value={formData.firstName}
                      onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Last Name (e.g. Johnson)"
                      value={formData.lastName}
                      onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <input
                      type="tel"
                      placeholder="Phone (e.g. 08012345678)"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Instagram (e.g. amaka_nails)"
                      value={formData.instagram}
                      onChange={e => setFormData({ ...formData, instagram: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div>
                  <input
                    type="email"
                    placeholder="Email Address (Optional)"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Service & Pipeline Details Section */}
              <div className="pt-2 border-t border-gray-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                  Booking & Service Info <span className="normal-case text-gray-400 font-normal">(Optional)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Service</label>
                    <input
                      type="text"
                      list="services-list"
                      placeholder="e.g. Acrylic Nail Set"
                      value={formData.serviceName}
                      onChange={e => setFormData({ ...formData, serviceName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black"
                    />
                    <datalist id="services-list">
                      {services.map(s => (
                        <option key={s.id} value={s.name} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Agreed Price (₦)</label>
                    <input
                      type="number"
                      placeholder="e.g. 25000"
                      value={formData.total}
                      onChange={e => setFormData({ ...formData, total: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Notes / Reason</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Booked via WhatsApp, cash deposit paid, or Personal appointment"
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black resize-none"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 text-sm font-bold text-white bg-[#1A1414] hover:bg-black rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : editingBooking ? (
                    'Save Changes'
                  ) : (
                    'Lock Slot & Block'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
