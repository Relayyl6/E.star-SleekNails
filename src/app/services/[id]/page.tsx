'use client';

import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { use } from 'react';

// Normally, this would be fetched from a database based on the ID.
const getServiceData = (id: string) => {
  const services = [
    {
      id: "signature-full-set",
      name: "Signature Full Set",
      category: "Full Sets",
      duration: "2h",
      price: "₦20,000",
      description: "Acrylics, BIAB & hard gel extensions with either French tips, simple accents, swirls, simple ombré. The perfect balance of elegance and detail.",
      longDescription: "Our Signature Full Set is the ultimate canvas for your personal style. We meticulously prep your natural nails, apply the perfect extension (choosing between acrylic, BIAB, or hard gel depending on your nail health and lifestyle), and shape them to your exact specifications. This tier includes classic art options like pristine French tips, elegant swirls, delicate minimalist accents, or a seamless ombré fade. Every set is finished with a nourishing cuticle oil treatment and a high-gloss top coat to ensure lasting shine and durability for weeks.",
      image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=400&q=80"
      ]
    },
    // Adding a generic fallback for other IDs for the prototype
    {
      id: "generic",
      name: "Luxury Nail Service",
      category: "Nails",
      duration: "1h 30min",
      price: "₦15,000",
      description: "A premium nail care experience tailored to your exact specifications.",
      longDescription: "Experience the ultimate in nail care and artistry. Our premium services combine high-quality products with expert techniques to deliver flawless, long-lasting results. We begin with a detailed consultation to understand your aesthetic goals, followed by meticulous prep work to ensure the health and longevity of your manicure. Whether you're looking for subtle elegance or a bold statement, our skilled technicians will bring your vision to life.",
      image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=400&q=80"
      ]
    }
  ];

  return services.find(s => s.id === id) || { ...services[1], id, name: id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) };
};

export default function ServiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const service = getServiceData(resolvedParams.id);
  const { items, addItem, updateQuantity, removeItem } = useCart();
  
  if (!service) return notFound();

  const cartItem = items.find(i => i.id === service.id);
  const isSelected = !!cartItem;
  const quantity = cartItem?.quantity || 0;

  const toggleSelect = () => {
    if (isSelected) {
      removeItem(service.id);
    } else {
      addItem({ ...service, quantity: 1 });
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F7] pt-28 pb-32 flex flex-col">
      <div className="max-w-6xl mx-auto px-6 md:px-12 w-full flex-1 flex flex-col">
        {/* Back navigation */}
        <Link href="/services" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-6 font-medium text-sm w-fit">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to services
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 flex-1">
          {/* Left Column: Visuals */}
          <div className="space-y-6 flex flex-col">
            <div className="relative w-full flex-1 min-h-[400px] lg:min-h-[500px] rounded-xl overflow-hidden shadow-xl bg-white border border-black/5">
              <Image 
                src={service.image} 
                alt={service.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            
            {/* Mini Gallery */}
            {service.gallery && service.gallery.length > 0 && (
              <div className="grid grid-cols-3 gap-4 shrink-0">
                {service.gallery.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden shadow-sm border border-black/5 cursor-pointer hover:shadow-md transition-shadow">
                    <Image src={img} alt={`${service.name} gallery ${idx + 1}`} fill className="object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details & Actions */}
          <div className="flex flex-col">
            <div className="inline-block px-4 py-1.5 bg-black/5 text-[#1A1414] rounded-full text-xs font-bold uppercase tracking-wider mb-6 w-fit">
              {service.category}
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#1A1414] mb-6 leading-tight">
              {service.name}
            </h1>
            
            <div className="flex items-center gap-6 mb-10 pb-10 border-b border-black/10 shrink-0">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 uppercase tracking-widest mb-1">Price</span>
                <span className="text-2xl font-sans font-medium text-[#1A1414]">{service.price}</span>
              </div>
              <div className="w-px h-10 bg-black/10"></div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 uppercase tracking-widest mb-1">Duration</span>
                <span className="text-2xl font-sans font-medium text-[#1A1414]">{service.duration}</span>
              </div>
            </div>

            <div className="prose prose-lg text-gray-600 mb-12 font-light leading-relaxed shrink-0">
              <p>{service.longDescription}</p>
            </div>

            <div className="mt-auto bg-white p-8 rounded-[2rem] shadow-sm border border-black/5 shrink-0">
              {!isSelected ? (
                <button 
                  onClick={toggleSelect}
                  className="w-full bg-[#1A1414] text-white py-5 rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                  Add to Booking
                </button>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between p-4 bg-primary/10 rounded-2xl border border-primary/20">
                    <span className="font-semibold text-primary">Selected for booking</span>
                    <div className="flex items-center bg-white rounded-full shadow-sm">
                      <button 
                        onClick={() => updateQuantity(service.id, -1)}
                        className="w-10 h-10 flex items-center justify-center rounded-full text-primary font-bold text-xl hover:bg-gray-50 transition-colors"
                      >-</button>
                      <span className="w-8 text-center font-bold text-lg text-[#1A1414]">{quantity}</span>
                      <button 
                        onClick={() => updateQuantity(service.id, 1)}
                        className="w-10 h-10 flex items-center justify-center rounded-full text-primary font-bold text-xl hover:bg-gray-50 transition-colors"
                      >+</button>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      document.querySelector('button[aria-label="Bookings"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                    }}
                    className="w-full bg-primary text-white py-5 rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/30"
                  >
                    View Cart Summary
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
