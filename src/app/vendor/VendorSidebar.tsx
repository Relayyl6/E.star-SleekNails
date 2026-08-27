'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { FiMenu, FiHome, FiList, FiSettings, FiLogOut, FiX } from 'react-icons/fi';

export default function VendorSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: '/vendor/dashboard', label: 'Dashboard', icon: FiHome },
    { href: '/vendor/services', label: 'Services', icon: FiList },
    { href: '/vendor/settings', label: 'Settings', icon: FiSettings },
  ];

  const handleSignOut = async () => {
    await signOut(auth);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-40">
        <h2 className="text-xl font-serif font-bold text-[#1A1414]">SleekNails</h2>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-600 bg-gray-50 rounded-lg">
          <FiMenu size={24} />
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-gray-200 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-serif font-bold text-[#1A1414]">SleekNails</h2>
            <p className="text-sm font-medium text-primary mt-1">Hi, E.star</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors">
            <FiX size={20} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 flex flex-col justify-between h-full overflow-y-auto">
          <div className="space-y-2">
            {links.map(link => {
              const active = pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link 
                  key={link.href} 
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${active ? 'bg-[#1A1414] text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}
          </div>
          
          <div className="pt-4 border-t border-gray-100 mt-auto flex flex-col gap-1">
            <Link 
              href="/"
              className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl font-medium text-gray-500 hover:text-primary hover:bg-gray-50 transition-colors"
            >
              <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Website
            </Link>
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl font-medium text-red-500 hover:bg-red-50 transition-colors"
            >
              <FiLogOut size={18} />
              Sign Out
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}
