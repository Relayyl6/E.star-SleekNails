'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';

export default function BookingDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem } = useCart();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-50 transition-opacity backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-[400px] bg-[#1A1414] text-white z-50 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-serif">Selected Services</h2>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {items.length === 0 ? (
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 text-center mt-10">
              <p className="text-white/60 mb-4">No services selected yet.</p>
              <button onClick={() => setIsOpen(false)} className="text-primary font-medium hover:underline">
                <Link href="/services">
                  Browse services
                </Link>
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="bg-white/5 rounded-2xl p-4 border border-white/10 flex gap-4">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-serif text-lg leading-tight">{item.name}</h3>
                    <button onClick={() => removeItem(item.id)} className="text-white/40 hover:text-white transition-colors">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </div>
                  <p className="text-sm text-white/50 mb-3">{item.duration} · {item.price}</p>
                  
                  {/* Custom Stepper matching user spec */}
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-primary font-bold text-lg hover:bg-white/80 transition-colors shadow-sm"
                    >-</button>
                    <span className="w-4 text-center font-bold">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-primary font-bold text-lg hover:bg-white/80 transition-colors shadow-sm"
                    >+</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="p-6 border-t border-white/10 bg-[#1A1414]">
          <Link href="/book/date" onClick={() => setIsOpen(false)} className={`block w-full py-4 text-center rounded-full font-bold transition-all shadow-lg ${items.length > 0 ? 'bg-primary text-white hover:bg-primary/90' : 'bg-white/10 text-white/40 cursor-not-allowed pointer-events-none'}`}>
            Continue to Date & Time
          </Link>
        </div>
      </div>
    </>
  );
}
