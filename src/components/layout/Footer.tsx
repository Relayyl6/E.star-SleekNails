'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSettings, formatGroupedHours } from '@/context/SettingsContext';

export default function Footer() {
  const pathname = usePathname();
  const { settings } = useSettings();
  const groupedHours = formatGroupedHours(settings.hours);
  const normalizedPath = pathname.toLowerCase();
  const isHiddenRoute = normalizedPath.startsWith('/login') || normalizedPath.startsWith('/register') || normalizedPath.startsWith('/dashboard') || normalizedPath.startsWith('/vendor') || normalizedPath.startsWith('/profile');

  if (isHiddenRoute) return null;

  return (
    <footer className="bg-[#1A1414] text-white pt-12 print:hidden overflow-hidden flex flex-col">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-8 px-6 md:px-12">
        <div className="flex flex-row items-center gap-4">
          <div className="bg-white p-3 rounded-2xl shrink-0">
            <Image 
              src="/logo.png" 
              alt={settings.name} 
              width={120} 
              height={40} 
              className="object-contain"
            />
          </div>
          <p className="text-white/70 text-xs md:text-sm max-w-xs leading-relaxed">
            {settings.bio}
          </p>
        </div>
        
        <div>
          <h4 className="font-medium mb-4 text-surface">Links</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link href="/policy" className="hover:text-primary transition-colors">Policy & Terms</Link></li>
            <li><Link href="/services" className="hover:text-primary transition-colors">Services</Link></li>
            <li><Link href="/book" className="hover:text-primary transition-colors">Book Appointment</Link></li>
            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium mb-4 text-surface">Hours</h4>
          <ul className="space-y-2 text-sm text-white/70">
            {groupedHours.map((hour, idx) => (
              <li key={idx} className="flex justify-between">
                <span className="w-24 capitalize">{hour.label}:</span> 
                <span>{hour.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto w-full mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/50 mb-8 px-6 md:px-12">
        <p>© {new Date().getFullYear()} {settings.name}. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a href={`https://instagram.com/${settings.instagram?.replace('@', '')}`} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Instagram</a>
        </div>
      </div>

      <div className="w-full flex justify-center items-end opacity-10 mt-auto overflow-hidden">
        <h1 className="font-serif text-[14.8vw] leading-none whitespace-nowrap tracking-tighter text-white pb-2">
          E.star SleekNails
        </h1>
      </div>
    </footer>
  );
}
