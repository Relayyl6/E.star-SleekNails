'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type StoreSettings = {
  name: string;
  phone: string;
  instagram: string;
  adminEmail: string;
  depositPercentage: number;
  heroImage: string;
  address: string;
  bio: string;
  hours: Array<{ day: string; open: string; close: string; isClosed: boolean }>;
  bankDetails?: string;
};

const defaultSettings: StoreSettings = {
  name: "E.star SleekNails",
  phone: "+2347049022919",
  instagram: "@estar_sleeknails",
  adminEmail: "oseghaleleonard39@gmail.com",
  depositPercentage: 30,
  heroImage: "",
  address: "Lagos, Nigeria",
  bio: "Specializing in acrylic, hardgel, and BIAB services, creating clean, detailed, and long-lasting nail sets.",
  bankDetails: "GTBank\n0123456789\nE.star SleekNails",
  hours: [
    { day: "Sunday", open: "14:00", close: "18:00", isClosed: true },
    { day: "Monday", open: "09:00", close: "17:00", isClosed: false },
    { day: "Tuesday", open: "09:00", close: "17:00", isClosed: false },
    { day: "Wednesday", open: "09:00", close: "17:00", isClosed: false },
    { day: "Thursday", open: "09:00", close: "17:00", isClosed: false },
    { day: "Friday", open: "09:00", close: "17:00", isClosed: false },
    { day: "Saturday", open: "10:00", close: "15:00", isClosed: false },
  ]
};

type SettingsContextType = {
  settings: StoreSettings;
  isLoading: boolean;
};

const SettingsContext = createContext<SettingsContextType>({ settings: defaultSettings, isLoading: true });

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const cached = localStorage.getItem('sleeknails_settings');
        if (cached) {
          setSettings(JSON.parse(cached));
        }

        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          // Normalize hours if it's an object from Firebase
          let parsedHours = data.hours || defaultSettings.hours;
          if (typeof parsedHours === 'object' && !Array.isArray(parsedHours)) {
            parsedHours = Object.values(parsedHours);
          }
          
          const newSettings = {
            name: data.name || defaultSettings.name,
            phone: data.phone || defaultSettings.phone,
            instagram: data.instagram || defaultSettings.instagram,
            adminEmail: data.adminEmail || defaultSettings.adminEmail,
            depositPercentage: data.depositPercentage ?? defaultSettings.depositPercentage,
            heroImage: data.heroImage || defaultSettings.heroImage,
            address: data.address || defaultSettings.address,
            bio: data.bio || defaultSettings.bio,
            bankDetails: data.bankDetails || defaultSettings.bankDetails,
            hours: parsedHours
          };
          
          setSettings(newSettings);
          localStorage.setItem('sleeknails_settings', JSON.stringify(newSettings));
        }
      } catch (error) {
        console.error("Failed to fetch settings", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}

export function formatGroupedHours(hours: StoreSettings['hours']) {
  if (!hours || hours.length === 0) return [];
  
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const sorted = [...hours].sort((a, b) => {
    const aIndex = daysOfWeek.findIndex(d => d.toLowerCase() === a.day.toLowerCase());
    const bIndex = daysOfWeek.findIndex(d => d.toLowerCase() === b.day.toLowerCase());
    return aIndex - bIndex;
  });

  const grouped = [];
  let currentGroup = { startDay: sorted[0].day, endDay: sorted[0].day, open: sorted[0].open, close: sorted[0].close, isClosed: sorted[0].isClosed };

  for (let i = 1; i < sorted.length; i++) {
    const h = sorted[i];
    if (h.open === currentGroup.open && h.close === currentGroup.close && h.isClosed === currentGroup.isClosed) {
      currentGroup.endDay = h.day;
    } else {
      grouped.push(currentGroup);
      currentGroup = { startDay: h.day, endDay: h.day, open: h.open, close: h.close, isClosed: h.isClosed };
    }
  }
  grouped.push(currentGroup);

  return grouped.map(g => {
    const label = g.startDay === g.endDay ? g.startDay : `${g.startDay.substring(0,3)} - ${g.endDay.substring(0,3)}`;
    return {
      label,
      value: g.isClosed ? 'Closed' : `${g.open} - ${g.close}`
    };
  });
}
