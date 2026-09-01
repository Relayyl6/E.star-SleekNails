'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { db } from '@/lib/firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { toast } from 'sonner';

const CATEGORIES = [
  "All",
  "Acrylic Nail Set — Plain",
  "BIAB on Natural Nails",
  "Plain Gel X Nail Set",
  "Gel Stick-On Set — Plain",
  "Toenails",
  "Extras",
  "Others"
];

export default function ServicesPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeCategory, setActiveCategory] = useState("All");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { items, addItem, updateQuantity, removeItem } = useCart();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      const cached = localStorage.getItem('sleeknails_services');
        if (cached) {
          try {
            const rawData = JSON.parse(cached);
            const data = rawData.map((s: any) => ({ ...s, category: s.category || "Acrylic Nail Set — Plain" }));
            const sortedData = data.sort((a: any, b: any) => {
              const indexA = CATEGORIES.indexOf(a.category);
              const indexB = CATEGORIES.indexOf(b.category);
              return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
            });
            setServicesList(sortedData);
            setLoading(false);
          } catch (e) {}
        }

      try {
        const res = await fetch('/api/services');
        if (!res.ok) {
          if (!cached) toast.error('Failed to fetch services');
          setLoading(false);
          return;
        }
        const rawData = await res.json();

        const data = rawData.map((service: any) => ({
          ...service,
          category: service.category || "Acrylic Nail Set — Plain"
        }));

        // Sort services by CATEGORIES order
        const sortedData = data.sort((a: any, b: any) => {
          const indexA = CATEGORIES.indexOf(a.category);
          const indexB = CATEGORIES.indexOf(b.category);
          return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
        });

        setServicesList(sortedData);
        localStorage.setItem('sleeknails_services', JSON.stringify(sortedData));
      } catch (error) {
        console.error("Error fetching services:", error);
        if (!cached) toast.error('An error occurred while fetching services.');
      }
      setLoading(false);
    };

    fetchServices();
  }, []);

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
        <div className="text-left mb-10">
          <h1 className="text-4xl md:text-5xl font-serif text-[#1A1414] mb-3">Select Services</h1>
          <p className="text-gray-500 max-w-2xl text-sm md:text-base">
            Choose from our premium selection of nail enhancements and care services.
          </p>
        </div>

        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4 mb-6 border-b border-black/5 pb-4">
          <div className="flex overflow-x-auto flex-nowrap lg:flex-wrap gap-2 pb-1 pr-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex-1">
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
          <p className="text-xs md:text-sm text-primary font-medium bg-primary/5 px-4 py-2 rounded-lg shrink-0">
            Tip: Press and hold an image to preview. Double-click card for details.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A1414]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
            {filteredServices.map((service) => {
              const cartItem = items.find(i => i.id === service.id);
              const isSelected = !!cartItem;
              const quantity = cartItem?.quantity || 0;

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
                  onDoubleClick={() => router.push(`/services/${service.id}`)}
                  className={`flex flex-row justify-between rounded-xl p-5 transition-all duration-300 border bg-white select-none relative gap-4 md:gap-6 ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-[#FDFBF9] shadow-[0_0_20px_rgba(232,87,42,0.15)]'
                      : 'border-transparent hover:border-primary shadow-sm hover:shadow-xl'
                  }`}
                >
                  <div className="flex-1 flex flex-col min-w-0">
                    <h3 className="font-serif text-xl text-[#1A1414] mb-1">{service.name}</h3>
                    <p className="text-sm font-medium text-gray-500 mb-2">{service.price} · {service.duration}</p>
                    <p className="text-[13px] text-gray-600 leading-relaxed line-clamp-3 mb-2">
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
                    {!isSelected ? (
                      <button
                        onClick={toggleSelect}
                        className="px-4 py-1.5 rounded-xl text-[13px] font-bold transition-colors bg-[#F8D9CE] text-[#1A1414] hover:bg-primary hover:text-white whitespace-nowrap"
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
                      className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden shadow-sm cursor-pointer mt-auto"
                      onPointerDown={handlePointerDown}
                      onPointerUp={handlePointerUp}
                      onPointerLeave={handlePointerUp}
                    >
                      <img
                        src={service.images?.[0] || service.image || ''}
                        alt={service.name}
                        className="object-cover w-full h-full"
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
        )}

        {filteredServices.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            No services found in this category.
          </div>
        )}
      </div>

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

      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto border-t border-black/5 mt-16 mb-24">
        <h2 className="font-serif text-3xl md:text-4xl mb-10 text-[#1A1414] text-center">Explore by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {[
            { name: "Acrylic Nail Set — Plain", image: "https://placehold.co/600x400/1a1414/ffffff.png?text=Acrylic+Nail+Set" },
            { name: "Plain Gel X Nail Set", image: "https://placehold.co/600x400/1a1414/ffffff.png?text=Plain+Gel+X" },
            { name: "BIAB on Natural Nails", image: "https://placehold.co/600x400/1a1414/ffffff.png?text=BIAB" },
            { name: "Gel Stick-On Set — Plain", image: "https://placehold.co/600x400/1a1414/ffffff.png?text=Gel+Stick-On" },
            { name: "Toenails", image: "https://placehold.co/600x400/1a1414/ffffff.png?text=Toenails" },
            { name: "Extras", image: "https://placehold.co/600x400/1a1414/ffffff.png?text=Extras" },
          ].map((category) => (
            <Link
              key={category.name}
              href={`/services?category=${category.name.toLowerCase().replace(/ /g, '-')}`}
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
