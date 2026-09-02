'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';

export default function BookingDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, clearCart, startTimer } = useCart();

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
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar">
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
            items.map((item) => (
              <div key={item.id} className="bg-white/5 rounded-2xl p-4 border border-white/10 flex gap-4">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-white/5 flex items-center justify-center">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white/40 text-lg font-bold font-serif">{item.name.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-serif text-lg leading-tight">{item.name}</h3>
                      <button onClick={() => removeItem(item.id)} className="text-white/40 hover:text-white transition-colors">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                    </div>

                    {/* Render Add-ons */}
                    {(item.selectedLength || item.selectedDesign || (item.selectedExtras && item.selectedExtras.length > 0)) && (
                      <div className="text-xs text-white/60 mb-2 space-y-0.5">
                        {item.selectedLength && <div>• {item.selectedLength.name} (+₦{item.selectedLength.price.toLocaleString()})</div>}
                        {item.selectedDesign && <div>• {item.selectedDesign.name} (+₦{item.selectedDesign.price.toLocaleString()})</div>}
                        {item.selectedExtras?.map((ex, i) => (
                          <div key={i}>• {ex.name} (+₦{ex.price.toLocaleString()})</div>
                        ))}
                      </div>
                    )}

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
          <>
            {items.length !== 0 && (
                <div className='flex flex-row gap-3 mx-auto mt-4'>
                  <button onClick={() => setIsOpen(false)} className="text-primary font-medium hover:underline">
                    <Link href="/services">
                      Browse services
                    </Link>
                  </button>

                  <button onClick={() => { clearCart(); setIsOpen(false) }} className="text-red-600 font-medium hover:underline">
                    Clear Cart
                  </button>
                </div>
              )
            }
          </>
        </div>
        
        <div className="p-6 border-t border-white/10 bg-[#1A1414]">
          <Link href="/book/date-time" onClick={() => { startTimer(); setIsOpen(false); }} className={`block w-full py-4 text-center rounded-full font-bold transition-all shadow-lg ${items.length > 0 ? 'bg-primary text-white hover:bg-primary/90' : 'bg-white/10 text-white/40 cursor-not-allowed pointer-events-none'}`}>
            Continue to Date & Time
          </Link>
        </div>
      </div>
    </>
  );
}
