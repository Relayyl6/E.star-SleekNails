'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from '@/context/CartContext';
import { useSettings } from '@/context/SettingsContext';
import { useRef } from 'react';
import SignatureGallery from "@/components/ui/SignatureGallery";
import PolicySection from "@/components/ui/PolicySection";

import { toast } from 'sonner';

export default function HomePage() {
  const router = useRouter();
  const { items, addItem, updateQuantity, removeItem } = useCart();
  const { settings } = useSettings();
  const [servicesList, setServicesList] = useState<any[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const CATEGORIES_TO_FEATURE = [
    "Acrylic Nail Set - Plain",
    "BIAB on Natural Nails",
    "Plain Gel X Nail Set",
    "Gel Stick-On Set - Plain",
    "Toenails",
    "Others"
  ];

  const getFeaturedServices = (allServices: any[]) => {
    const featured = [];
    for (const cat of CATEGORIES_TO_FEATURE) {
      const match = allServices.find(s => (s.category || "Acrylic Nail Set — Plain") === cat);
      if (match) featured.push(match);
    }
    return featured;
  };

  useEffect(() => {
    const fetchServices = async () => {
      // 1. Load from cache immediately
      const cached = localStorage.getItem('sleeknails_services');
      if (cached) {
        try {
          const rawData = JSON.parse(cached);
          setServicesList(getFeaturedServices(rawData));
        } catch (e) {}
      }

      // 2. Fetch fresh data in background
      try {
        const res = await fetch('/api/services');
        if (!res.ok) {
          if (!cached) toast.error('Failed to fetch services');
          return;
        }
        const data = await res.json();
        setServicesList(getFeaturedServices(data)); // Update UI silently
        localStorage.setItem('sleeknails_services', JSON.stringify(data)); // Update cache
      } catch (error) {
        console.error("Error fetching services:", error);
        if (!cached) toast.error('An error occurred while fetching services.');
      }
    };
    fetchServices();
  }, []);

  const handlePointerDown = () => {
    timerRef.current = setTimeout(() => {
      router.push('/services');
    }, 600); // 600ms long press routes to services
  };

  const handlePointerUp = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const categories = [
    { name: "Acrylic Nail Set — Plain", image: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?auto=format&fit=crop&w=600&q=80" },
    { name: "Gel Stick-On Set — Plain", image: "https://images.unsplash.com/photo-1516975080661-460d3dce895b?auto=format&fit=crop&w=600&q=80" },
    { name: "Toenails", image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=600&q=80" },
    { name: "Extras", image: "https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&w=600&q=80" },
  ];

  const socialImages = [
    "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1595868840212-32b53443a290?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=400&q=80",
  ];

  return (
    <div className="relative">
      {/* 2. Hero Section */}
      <section className="relative h-screen min-h-[600px] flex flex-col items-center justify-center pt-24 pb-12">
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0 bg-surface">
          {settings.heroImage ? (
            <img 
              src={settings.heroImage} 
              alt="Studio Background"
              className="absolute inset-0 w-full h-full object-cover opacity-90"
            />
          ) : (
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              poster="https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1920&q=80"
              className="absolute inset-0 w-full h-full object-cover opacity-90"
            >
              <source src="https://assets.mixkit.co/videos/13084/13084-720.mp4" type="video/mp4" />
            </video>
          )}
        {/* Bottom-to-top gradient scrim for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1414] via-[#1A1414]/50 to-transparent"></div>
          {/* Radial vignette to darken edges but keep center video visible */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#1A1414]/20 to-[#1A1414]/80"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center px-6 mt-20 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
          {/* Location Badge */}
          <div className="inline-flex items-center gap-3 mb-8 px-5 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white/90 text-xs font-semibold tracking-[0.3em] uppercase shadow-xl">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            {settings.address.split(',')[0]} · Nail Studio
          </div>
          
          {/* Main Heading */}
          <h1 className="font-serif text-5xl md:text-8xl lg:text-[7.5rem] mb-6 tracking-tight drop-shadow-[0_4px_32px_rgba(0,0,0,0.5)] text-white leading-[1.1]">
            {settings.name}
          </h1>
          
          {/* Tagline */}
          <p className="text-xl md:text-2xl font-light mb-12 max-w-2xl text-white drop-shadow-md leading-relaxed">
            {settings.bio}
          </p>
          
          {/* CTA Group */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Link 
              href="/book" 
              className="group relative flex items-center gap-4 bg-primary text-white px-10 py-5 rounded-full text-lg font-medium shadow-[0_0_40px_rgba(232,87,42,0.4)] hover:shadow-[0_0_60px_rgba(232,87,42,0.6)] hover:bg-[#ff6a3d] hover:-translate-y-1 transition-all duration-300"
            >
              <span className="relative z-10">Book an Appointment</span>
              <svg className="w-5 h-5 relative z-10 transform group-hover:translate-x-1.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            
            <Link href="/services" className="text-white hover:text-primary transition-colors tracking-widest text-sm font-semibold uppercase border-b border-transparent hover:border-primary pb-1">
              Explore Services
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Policies & Terms (compact) */}
        <PolicySection />

      <div className="bg-surface relative z-20">
        {/* Tagline / Typographic Collage */}
        <section className="py-8 md:py-10 px-6 border-t border-black/5 relative flex items-center justify-center">
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes hinge-wobble {
              0%, 100% { transform: rotate(0deg); }
              20% { transform: rotate(12deg); }
              40% { transform: rotate(-6deg); }
              60% { transform: rotate(4deg); }
              80% { transform: rotate(-2deg); }
            }
            .animate-hinge {
              animation: hinge-wobble 4s ease-in-out infinite;
              transform-origin: top left;
              display: inline-block;
            }
          `}} />
          
          <div className="relative max-w-2xl mx-auto flex flex-col items-center justify-center space-y-4">
            <p className="text-sm md:text-base text-gray-500 font-light tracking-[0.2em] uppercase mb-1">
              The E.star Signature
            </p>
            
            <div className="relative flex items-center justify-center flex-wrap gap-x-6 gap-y-2 text-center leading-none">
              <span className="text-3xl md:text-5xl font-serif text-black/80 italic">Clean.</span>
              <span className="text-2xl md:text-4xl font-sans font-bold text-primary tracking-tighter uppercase animate-hinge hover:animate-none cursor-default">Hardgel</span>
              <span className="text-3xl md:text-4xl font-serif text-black/60 font-light">Acrylic</span>
              <div className="w-full h-0"></div>
              <span className="text-xl md:text-2xl font-mono text-gray-400 tracking-tight">detailed</span>
              <span className="text-2xl md:text-4xl font-sans tracking-[0.1em] text-black/90 uppercase -rotate-2 origin-center">BIAB</span>
              <span className="text-xl md:text-3xl font-serif italic text-primary/80">Tailored</span>
              <span className="text-sm md:text-base font-sans tracking-widest text-black/40 uppercase rotate-2 mt-2">Long-lasting</span>
            </div>
            
            <p className="mt-4 text-gray-600 font-light text-center max-w-md text-sm leading-relaxed">
              We specialize in creating flawless, enduring nail sets tailored specifically to your aesthetic.
            </p>
          </div>
        </section>

        {/* 3. Featured Services Grid */}
        <section className="pb-0 pt-4 md:pt-8 px-6 md:px-12 max-w-[1600px] mx-auto bg-surface">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl mb-12 text-foreground">Featured Services</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {servicesList.length === 0 ? (
                <div className="col-span-full py-10 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A1414]"></div>
                </div>
              ) : servicesList.map((service) => {
                const cartItem = items.find(i => i.id === service.id);
                const isSelected = !!cartItem;
                const quantity = cartItem?.quantity || 0;
                
                return (
                  <div 
                    key={service.name}
                    className="bg-white rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary flex flex-row justify-between gap-4 md:gap-6 group"
                  >
                    <div className="flex-1 flex flex-col min-w-0">
                      <h3 className="font-serif text-xl md:text-2xl text-[#1A1414] mb-1">{service.name}</h3>
                      <p className="text-sm font-medium text-gray-500 mb-2">{service.duration} · {service.price}</p>
                      <p className="text-[13px] text-gray-700 leading-relaxed line-clamp-3 mb-2 flex-1">
                        {service.description || service.desc}
                      </p>
                      <Link 
                        href={`/services/${service.id}`}
                        className="mt-auto text-xs font-semibold text-primary hover:underline underline-offset-2 w-fit"
                      >
                        Show more...
                      </Link>
                    </div>
                    
                    <div className="flex flex-col items-end justify-between shrink-0 gap-3">
                        {(service.hasLengths || service.hasDesignTiers || service.hasExtras) ? (
                          <button
                            onClick={() => router.push(`/services?customize=${service.id}`)}
                            className="px-4 py-1.5 rounded-xl text-[13px] font-bold transition-colors bg-[#F8D9CE] text-[#1A1414] hover:bg-primary hover:text-white whitespace-nowrap select-none"
                          >
                            Customize
                          </button>
                        ) : !isSelected ? (
                          <button
                            onClick={() => addItem({ ...service, quantity: 1 }, false)}
                            onDoubleClick={() => router.push('/services')}
                            className="px-4 py-1.5 rounded-xl text-[13px] font-bold transition-colors bg-[#F8D9CE] text-[#1A1414] hover:bg-primary hover:text-white whitespace-nowrap select-none"
                          >
                            Select
                          </button>
                        ) : (
                          <div className="flex items-center bg-primary text-white rounded-full px-1 py-1 shadow-md scale-90 origin-top-right">
                            <button 
                              onClick={() => updateQuantity(service.id, -1)}
                              className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-primary font-bold text-lg hover:bg-white/90 transition-colors"
                            >-</button>
                            <span className="w-6 text-center text-sm font-bold">{quantity}</span>
                            <button 
                              onClick={() => updateQuantity(service.id, 1)}
                              className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-primary font-bold text-lg hover:bg-white/90 transition-colors"
                            >+</button>
                          </div>
                        )}

                      <div 
                        className="relative w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden shadow-sm mt-auto cursor-pointer shrink-0"
                        onPointerDown={handlePointerDown}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                      >
                        <Image 
                          src={service.images?.[0] || service.image} 
                          alt={service.name} 
                          fill 
                          sizes="(max-width: 768px) 100px, 150px"
                          className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                          draggable={false}
                        />
                        {isSelected && (
                          <div className="absolute top-1 right-1 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="text-center mt-12">
              <Link href="/services" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
                View full service menu
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
              </Link>
            </div>
          </div>
        </section>

        {/* 4. Signature Sets Gallery */}
        <SignatureGallery />

        {/* Floating Actions */}
        <div className="fixed bottom-6 right-6 z-40 flex flex-row items-center gap-3">
          <a 
            href="https://wa.me/2347049022919" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-[#25D366] w-12 h-12 md:w-auto md:h-auto md:px-4 md:py-2 rounded-full shadow-lg hover:shadow-xl hover:bg-[#20bd5a] text-white transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-6 h-6 md:w-3.5 md:h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            <span className="hidden md:inline text-xs font-semibold">Chat with us</span>
          </a>
        </div>
      </div>
    </div>
  );
}
