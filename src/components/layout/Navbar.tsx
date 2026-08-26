'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { items, setIsOpen } = useCart();
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const normalizedPath = pathname.toLowerCase();
  const isHiddenRoute = normalizedPath.startsWith('/login') || normalizedPath.startsWith('/register') || normalizedPath.startsWith('/dashboard') || normalizedPath.startsWith('/vendor') || normalizedPath.startsWith('/profile');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isHiddenRoute) return null;

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-10 ${scrolled || mobileMenuOpen ? 'py-2 md:py-3 bg-[#1A1414]/95 backdrop-blur-xl shadow-lg border-b border-white/10' : 'py-4 md:py-6 bg-transparent'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between relative z-50">
          
          <div className="flex items-center gap-6 md:gap-12 flex-1">
            {/* Logo */}
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className={`flex items-center shrink-0 bg-white/60 md:bg-white/40 backdrop-blur-md rounded-xl shadow-sm border border-white/40 transition-all duration-300 ${scrolled ? 'p-1.5 px-3' : 'p-2 px-3'}`}>
               {/* Mobile Icon */}
               <Image src="/logo.png" alt="E.star" width={40} height={20} className={`md:hidden object-contain transition-all duration-300 ${scrolled ? 'h-5 w-auto' : 'h-6 w-auto'}`} />
               {/* Desktop Wordmark */}
               <Image src="/logo.png" alt="E.star SleekNails" width={140} height={40} className={`hidden md:block object-contain transition-all duration-300 ${scrolled ? 'h-7 w-auto' : 'h-10 w-auto'}`} priority />
            </Link>
            
            {/* Glassmorphism Links Pill - Desktop Only */}
            <div className={`hidden md:flex items-center gap-8 px-10 rounded-full bg-black/20 backdrop-blur-md border border-white/30 shadow-lg transition-all duration-300 ${scrolled ? 'py-2.5' : 'py-4'}`}>
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link 
                    key={link.name} 
                    href={link.href} 
                    className={`relative text-[17px] font-medium transition-all ${isActive ? 'text-primary' : 'text-white hover:text-primary/80'}`}
                    style={!scrolled && !isActive ? { color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.4)' } : undefined}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute left-0 -bottom-1.5 w-full h-[1.5px] bg-primary"></span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 md:gap-4">
            <Link 
              href="/login"
              className={`hidden md:block text-[15px] font-semibold transition-colors px-4 py-2 ${scrolled ? 'text-white hover:text-primary' : 'text-white hover:text-primary drop-shadow-md'}`}
              style={!scrolled ? { textShadow: '0 2px 4px rgba(0,0,0,0.6)' } : undefined}
            >
              Sign in
            </Link>
            <button onClick={() => setIsOpen(true)} className="bg-primary text-white text-sm md:text-[15px] px-5 py-2.5 md:px-7 md:py-3 rounded-[1rem] md:rounded-full font-semibold shadow-[0_4px_14px_0_rgba(232,87,42,0.4)] hover:bg-primary/90 transition-all whitespace-nowrap flex items-center gap-2">
              <span>Bookings</span>
              {cartCount > 0 && (
                <span className="bg-white text-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 ml-1 ${scrolled || mobileMenuOpen ? 'text-white' : 'text-white drop-shadow-md'}`} 
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
              ) : (
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path></svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <div className={`md:hidden absolute top-full left-0 w-full bg-[#1A1414] border-b border-white/10 shadow-2xl transition-all duration-300 ease-in-out overflow-hidden flex flex-col ${mobileMenuOpen ? 'max-h-96 opacity-100 py-4' : 'max-h-0 opacity-0 py-0'}`}>
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="px-6 py-4 text-white text-lg font-medium hover:bg-white/5 transition-colors border-b border-white/5"
            >
              {link.name}
            </Link>
          ))}
          <Link 
            href="/login" 
            onClick={() => setMobileMenuOpen(false)}
            className="px-6 py-4 text-white text-lg font-medium hover:bg-white/5 transition-colors border-b border-white/5"
          >
            Sign in
          </Link>
          <button 
            onClick={() => { setMobileMenuOpen(false); setIsOpen(true); }}
            className="px-6 py-4 text-left text-white text-lg font-medium hover:bg-white/5 transition-colors"
          >
            My bookings
          </button>
        </div>
      </nav>
    </>
  );
}
