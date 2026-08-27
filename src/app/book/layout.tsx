'use client';

import { useCart } from "@/context/CartContext";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function BookLayout({ children }: { children: React.ReactNode }) {
  const { items, updateQuantity, removeItem } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const total = items.reduce((sum, item) => {
    const priceNum = parseInt(item.price.replace(/[^\d]/g, ''));
    return sum + (priceNum * item.quantity);
  }, 0);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount).replace('NGN', '₦');
  };

  const steps = [
    { name: "Services", path: "/services" },
    { name: "Date & Time", path: "/book/date-time" },
    { name: "Details", path: "/book/details" },
    { name: "Payment", path: "/book/success" }
  ];

  if (!mounted) return null; // Avoid hydration mismatch for cart items

  return (
    <div className="min-h-screen bg-[#FBF9F7] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col lg:flex-row gap-10">
        
        {/* Left Side - Main Flow */}
        <div className="w-full lg:w-2/3 print:w-full">
          {/* Stepper */}
          <div className="mb-10 flex items-center justify-between border-b border-black/5 pb-6 overflow-x-auto hide-scrollbar print:hidden">
            {steps.map((step, idx) => {
              const isActive = pathname === step.path;
              const isPast = steps.findIndex(s => s.path === pathname) > idx;
              return (
                <div key={idx} className="flex items-center min-w-max">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${isActive ? 'bg-[#1A1414] text-white' : isPast ? 'bg-[#F8D9CE] text-[#1A1414]' : 'bg-gray-200 text-gray-500'}`}>
                      {isPast ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg> : (idx + 1)}
                    </div>
                    <span className={`text-sm font-medium ${isActive ? 'text-[#1A1414]' : isPast ? 'text-gray-800' : 'text-gray-400'}`}>
                      {step.name}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`w-8 md:w-16 h-px mx-4 ${isPast ? 'bg-[#F8D9CE]' : 'bg-gray-200'}`}></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Flow Content */}
          <div className="bg-white rounded-xl p-6 md:p-10 shadow-sm border border-black/5 animate-in fade-in slide-in-from-bottom-4 duration-500 print:shadow-none print:border-none print:p-0 print:m-0">
            {children}
          </div>
        </div>

        {/* Right Side - Sticky Cart Summary */}
        <div className="w-full lg:w-1/3 print:hidden">
          <div className="sticky top-28 bg-white rounded-xl p-6 md:p-8 shadow-xl border border-black/5">
            <h2 className="font-serif text-2xl text-[#1A1414] mb-6">Booking Summary</h2>
            
            {items.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 mb-4">Your cart is empty.</p>
                <Link href="/services" className="text-primary font-semibold hover:underline">Browse Services</Link>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 items-center group">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#1A1414] truncate">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.duration}</p>
                        <p className="text-primary font-semibold text-sm">{item.price}</p>
                      </div>
                      <div className="flex flex-col items-center justify-between h-16 bg-gray-50 rounded-lg w-8">
                        <button onClick={() => updateQuantity(item.id, 1)} className="h-1/3 w-full flex items-center justify-center text-gray-500 hover:text-black">+</button>
                        <span className="text-xs font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, -1)} className="h-1/3 w-full flex items-center justify-center text-gray-500 hover:text-black">-</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-black/5 pt-6 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatMoney(total)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Deposit Required</span>
                    <span>₦10,000</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-[#1A1414] pt-3 border-t border-black/5">
                    <span>Total Estimated</span>
                    <span>{formatMoney(total)}</span>
                  </div>
                </div>

                {pathname !== '/book/success' && (
                  <p className="text-xs text-center text-gray-400 mt-6 mt-4">
                    Taxes and exact fees calculated at checkout.
                  </p>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
