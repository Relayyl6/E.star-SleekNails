'use client';

import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const CATEGORIES = ["All", "Full Sets", "In-Fill", "Pedicure", "Nail Art", "Removal", "Add-ons"];

const servicesList = [
  {
    id: "signature-full-set",
    name: "Signature Full Set",
    category: "Full Sets",
    duration: "2h",
    price: "₦20,000",
    description: "Acrylics, BIAB & hard gel extensions with either French tips, simple accents, swirls, simple ombré. The perfect balance of elegance and detail.",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "elevated-full-set",
    name: "Elevated Full Set",
    category: "Full Sets",
    duration: "2h",
    price: "₦25,000",
    description: "Acrylics, BIAB & hard gel extensions with up to two design elements or 3d art. For those who want their nails to stand out just a bit more.",
    image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "statement-full-set",
    name: "Statement Full Set",
    category: "Full Sets",
    duration: "2h 30min",
    price: "₦35,000",
    description: "Acrylic, BIAB or hard gel extensions with intricate nail art, detailed hand painted designs and multiple layered nail design elements.",
    image: "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "gel-manicure",
    name: "Gel Polish Manicure",
    category: "Full Sets",
    duration: "1h 15min",
    price: "₦12,000",
    description: "Detailed cuticle work and shaping, finished with your choice of solid gel color.",
    image: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "in-fill",
    name: "In-Fill / Maintenance",
    category: "In-Fill",
    duration: "1h 30min",
    price: "₦15,000",
    description: "Rebalancing and filling growth on existing enhancements. Includes one gel color.",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "nail-art-addons",
    name: "Nail Art / Add-ons",
    category: "Nail Art",
    duration: "15min+",
    price: "From ₦2,000",
    description: "Extra length, intricate character art, chrome powders, or rhinestones added to any service.",
    image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "biab-overlay",
    name: "BIAB Natural Overlay",
    category: "Full Sets",
    duration: "1h 30min",
    price: "₦18,000",
    description: "Builder in a bottle applied over natural nails to add strength and promote growth.",
    image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "classic-pedicure",
    name: "Classic Pedicure",
    category: "Pedicure",
    duration: "1h",
    price: "₦15,000",
    description: "Relaxing foot soak, cuticle care, callus removal, scrub, massage and polish.",
    image: "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "jelly-pedicure",
    name: "Luxury Jelly Pedicure",
    category: "Pedicure",
    duration: "1h 30min",
    price: "₦25,000",
    description: "Premium pedicure featuring a warm jelly soak, deep exfoliation, and hot towel wrap.",
    image: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "acrylic-toes",
    name: "Acrylic Toes",
    category: "Pedicure",
    duration: "1h",
    price: "₦12,000",
    description: "Acrylic overlay applied to all toes for a perfect, long-lasting square shape.",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "sculpted-extensions",
    name: "Sculpted Extensions",
    category: "Full Sets",
    duration: "2h 30min",
    price: "₦30,000",
    description: "Extensions created using forms rather than tips for a more natural curve and structure.",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "soak-off",
    name: "Professional Soak Off",
    category: "Removal",
    duration: "45min",
    price: "₦5,000",
    description: "Safe and healthy removal of previous enhancements to preserve natural nail integrity.",
    image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "french-tips",
    name: "Classic French Tips",
    category: "Nail Art",
    duration: "1h 45min",
    price: "₦22,000",
    description: "Timeless pink and white acrylic or gel application for a clean, classic look.",
    image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "repair",
    name: "Nail Repair",
    category: "Add-ons",
    duration: "15min",
    price: "₦2,500",
    description: "Fixing a broken, chipped, or cracked nail enhancement.",
    image: "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=400&q=80"
  }
];

export default function ServicesPage() {
  const { items, addItem, updateQuantity, removeItem } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      const formatted = CATEGORIES.find(c => c.toLowerCase().replace(/ /g, '-') === categoryParam);
      if (formatted) setActiveCategory(formatted);
    }
  }, [searchParams]);

  const filteredServices = activeCategory === "All" 
    ? servicesList 
    : servicesList.filter(s => s.category === activeCategory);

  return (
    <div className="min-h-screen pt-32 pb-40 bg-[#FBF9F7]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-serif text-[#1A1414] mb-4">Select Services</h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base">
            Choose from our premium selection of nail enhancements and care services. <br className="hidden md:block" />
            <span className="font-medium text-primary mt-2 inline-block">Tip: Press and hold a service to preview its gallery. Double-click to view full details.</span>
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex overflow-x-auto pb-4 mb-10 gap-3 no-scrollbar justify-start md:justify-center px-2">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap px-6 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === category 
                  ? 'bg-[#1A1414] text-white shadow-md' 
                  : 'bg-white text-gray-600 border border-black/5 hover:border-black/20 hover:bg-gray-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const cartItem = items.find(i => i.id === service.id);
            const isSelected = !!cartItem;
            const quantity = cartItem?.quantity || 0;
            
            // Long press logic
            let timer: NodeJS.Timeout;
            const handlePointerDown = () => { timer = setTimeout(() => setPreviewImage(service.image), 500); };
            const handlePointerUp = () => { clearTimeout(timer); };

            const toggleSelect = () => {
              if (isSelected) {
                removeItem(service.id);
              } else {
                addItem({ ...service, quantity: 1 });
              }
            };
            
            return (
              <div 
                key={service.id}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onDoubleClick={() => router.push(`/services/${service.id}`)}
                className={`flex flex-col rounded-3xl p-6 transition-all duration-300 border bg-white select-none relative ${
                  isSelected 
                    ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-[#FDFBF9] shadow-[0_0_20px_rgba(232,87,42,0.15)]' 
                    : 'border-transparent hover:border-primary shadow-sm hover:shadow-xl'
                }`}
              >
                <div className="flex-1 flex flex-col mb-4">
                  <h3 className="font-serif text-xl lg:text-2xl text-[#1A1414] mb-1">{service.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">{service.duration} · {service.price}</p>
                  <p className="text-[13px] text-gray-700 leading-relaxed">
                    {service.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between mt-auto">
                  <Link 
                    href={`/services/${service.id}`}
                    className="text-xs font-semibold text-primary underline underline-offset-2 lg:hidden"
                  >
                    Details
                  </Link>
                  <div className="hidden lg:block"></div>

                  <div className="flex items-center gap-4">
                    {/* Select / Stepper Button */}
                    {!isSelected ? (
                      <button 
                        onClick={toggleSelect}
                        className="px-6 py-2 rounded-xl text-sm font-semibold transition-colors bg-[#F8D9CE] text-[#1A1414] hover:bg-primary hover:text-white whitespace-nowrap"
                      >
                        Select
                      </button>
                    ) : (
                      <div className="flex items-center bg-primary text-white rounded-full px-1 py-1 shadow-md">
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
                    
                    {/* Image Thumbnail */}
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-sm">
                      <Image 
                        src={service.image} 
                        alt={service.name} 
                        fill 
                        className="object-cover"
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
              </div>
            );
          })}
        </div>
        
        {filteredServices.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            No services found in this category.
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative w-full max-w-2xl aspect-square rounded-3xl overflow-hidden shadow-2xl transform scale-100 animate-[pulse_0.2s_ease-out]">
            <Image src={previewImage} alt="Preview" fill className="object-cover" />
            <button className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-black">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>
      )}

      {/* Category Grid (Added at bottom of Services page) */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto border-t border-black/5 mt-16 mb-24">
        <h2 className="font-serif text-3xl md:text-4xl mb-10 text-[#1A1414] text-center">Explore by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {[
            { name: "Full Sets", image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80" },
            { name: "In-Fill", image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=600&q=80" },
            { name: "Pedicure", image: "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=600&q=80" },
            { name: "Nail Art", image: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=600&q=80" },
            { name: "Removal", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80" },
            { name: "Add-ons", image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=600&q=80" },
          ].map((category) => (
            <Link 
              key={category.name}
              href={`/services?category=${category.name.toLowerCase().replace(' ', '-')}`}
              className="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-white shadow-sm hover:shadow-xl transition-all duration-300 flex items-end"
            >
              <Image 
                src={category.image} 
                alt={category.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-primary/20 transition-opacity mix-blend-overlay"></div>
              
              <div className="relative z-10 p-4 md:p-6 w-full flex items-center justify-between">
                <h3 className="text-white font-medium text-lg md:text-xl">{category.name}</h3>
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
