'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';

export default function CustomerNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: '/dashboard', label: 'My Bookings', exact: true },
    { href: '/dashboard/profile', label: 'Profile Settings', exact: false },
  ];

  const handleSignOut = async () => {
    await signOut(auth);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <nav className="flex flex-col space-y-1">
      {links.map(link => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link 
            key={link.href} 
            href={link.href} 
            className={`block px-4 py-3 rounded-xl font-medium transition-colors ${active ? 'bg-[#1A1414] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            {link.label}
          </Link>
        );
      })}
      
      <div className="pt-4 mt-2 border-t border-gray-100 flex flex-col gap-1">
        <Link 
          href="/"
          className="w-full text-left px-4 py-3 rounded-xl font-medium text-gray-500 hover:text-primary hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Website
        </Link>
        <button 
          onClick={handleSignOut}
          className="w-full text-left px-4 py-3 rounded-xl font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}
