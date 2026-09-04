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
  "Acrylic Nail Set - Plain",
  "BIAB on Natural Nails",
  "Plain Gel X Nail Set",
  "Gel Stick-On Set - Plain",
  "Toenails",
  "Others"
];

export default function ServicesPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeCategory, setActiveCategory] = useState("All");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Customization Modal State
  const [customizingService, setCustomizingService] = useState<any | null>(null);
  const [selectedLength, setSelectedLength] = useState<any | null>(null);
  const [selectedDesign, setSelectedDesign] = useState<any | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<any[]>([]);
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
    
    const customizeId = searchParams.get('customize');
    if (customizeId && servicesList.length > 0 && !customizingService) {
      const service = servicesList.find(s => s.id === customizeId);
      if (service && (service.hasLengths || service.hasDesignTiers || service.hasExtras)) {
        setCustomizingService(service);
        setSelectedLength(service.hasLengths && service.lengths?.length > 0 ? service.lengths[0] : null);
        setSelectedDesign(service.hasDesignTiers && service.designTiers?.length > 0 ? service.designTiers[0] : null);
        setSelectedExtras([]);
      }
    }
  }, [searchParams, servicesList]);

  const handleCustomize = (service: any) => {
    if (service.hasLengths || service.hasDesignTiers || service.hasExtras) {
      setCustomizingService(service);
      setSelectedLength(service.hasLengths && service.lengths?.length > 0 ? service.lengths[0] : null);
      setSelectedDesign(service.hasDesignTiers && service.designTiers?.length > 0 ? service.designTiers[0] : null);
      setSelectedExtras([]);
    } else {
      // Direct add
      addItem({ 
        id: service.id + '-' + Date.now(), 
        serviceId: service.id,
        name: service.name, 
        price: service.price,
        basePrice: service.basePrice,
        duration: service.duration, 
        image: service.image || service.images?.[0] || '', 
        quantity: 1 
      }, true);
    }
  };

  const handleAddToCart = () => {
    if (!customizingService) return;
    
    if (customizingService.hasLengths && customizingService.lengths?.length > 0 && !selectedLength) {
      toast.error('Please select a length');
      return;
    }
    
    if (customizingService.hasDesignTiers && customizingService.designTiers?.length > 0 && !selectedDesign) {
      toast.error('Please select a design tier');
      return;
    }

    // Calculate total
    let total = customizingService.basePrice || 0;
    if (selectedLength) total += selectedLength.price;
    if (selectedDesign) total += selectedDesign.price;
    selectedExtras.forEach(e => total += e.price);
    
    const formattedPrice = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(total);
    
    addItem({ 
      id: customizingService.id + '-' + Date.now(), 
      serviceId: customizingService.id,
      name: customizingService.name, 
      price: formattedPrice,
      basePrice: customizingService.basePrice,
      duration: customizingService.duration, 
      image: customizingService.image || customizingService.images?.[0] || '', 
      quantity: 1,
      selectedLength: selectedLength,
      selectedDesign: selectedDesign,
      selectedExtras: selectedExtras
    }, true);
    
    setCustomizingService(null);
  };

  const filteredServices = activeCategory === "All"
    ? servicesList
    : servicesList.filter(s => s.category === activeCategory);

  return (
    <div className="pt-32 pb-16 bg-[#FBF9F7] flex-1">
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
                    {(service.hasLengths || service.hasDesignTiers || service.hasExtras) ? (
                      <button
                        onClick={() => handleCustomize(service)}
                        className="px-4 py-1.5 rounded-xl text-[13px] font-bold transition-colors bg-[#F8D9CE] text-[#1A1414] hover:bg-primary hover:text-white whitespace-nowrap"
                      >
                        Customize & Select
                      </button>
                    ) : !isSelected ? (
                      <button
                        onClick={() => handleCustomize(service)}
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
                      className="relative w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden shadow-sm cursor-pointer mt-auto shrink-0"
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
            <img src={previewImage} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
            <button className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-black">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>
      )}

      {/* Customization Modal */}
      {customizingService && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-end md:items-center justify-center p-4 pt-20 md:pt-4" onClick={() => setCustomizingService(null)}>
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[85vh] md:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative animate-in slide-in-from-bottom-8 md:zoom-in-95 mt-safe" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#1A1414]">{customizingService.name}</h2>
                <p className="text-sm text-gray-500 mt-0.5">Customize your service</p>
              </div>
              <button onClick={() => setCustomizingService(null)} className="p-2 text-gray-400 hover:text-black bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-8 flex-1">
              {customizingService.hasLengths && customizingService.lengths?.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-[#1A1414] flex items-center justify-between">
                    Select Length <span className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-500">Required</span>
                  </h3>
                  <div className="space-y-2">
                    {customizingService.lengths.map((len: any) => (
                      <label key={len.name} onClick={() => setSelectedLength(len)} className={`flex items-center justify-between p-4 rounded-xl cursor-pointer border-2 transition-all ${selectedLength?.name === len.name ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedLength?.name === len.name ? 'border-primary' : 'border-gray-300'}`}>
                            {selectedLength?.name === len.name && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                          </div>
                          <span className="font-medium text-gray-800">{len.name}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-600">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(len.price)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {customizingService.hasDesignTiers && customizingService.designTiers?.length > 0 && (
                <div className="space-y-4 pt-2">
                  <h3 className="font-bold text-[#1A1414] flex items-center justify-between">
                    Design Tier <span className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-500">Required</span>
                  </h3>
                  <div className="space-y-2">
                    {customizingService.designTiers.map((tier: any) => (
                      <label key={tier.name} onClick={() => setSelectedDesign(tier)} className={`flex items-center justify-between p-4 rounded-xl cursor-pointer border-2 transition-all ${selectedDesign?.name === tier.name ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedDesign?.name === tier.name ? 'border-primary' : 'border-gray-300'}`}>
                            {selectedDesign?.name === tier.name && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                          </div>
                          <span className="font-medium text-gray-800">{tier.name}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-600">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(tier.price)}+</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {customizingService.hasExtras && customizingService.extras?.length > 0 && (
                <div className="space-y-4 pt-2">
                  <h3 className="font-bold text-[#1A1414] flex items-center justify-between">
                    Extras & Add-ons <span className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-500">Optional</span>
                  </h3>
                  <div className="space-y-2">
                    {customizingService.extras.map((ex: any) => {
                      const isChecked = selectedExtras.some(e => e.name === ex.name);
                      return (
                        <label key={ex.name} onClick={(e) => {
                          e.preventDefault();
                          if (isChecked) {
                            setSelectedExtras(selectedExtras.filter(e => e.name !== ex.name));
                          } else {
                            setSelectedExtras([...selectedExtras, ex]);
                          }
                        }} className={`flex items-center justify-between p-4 rounded-xl cursor-pointer border-2 transition-all ${isChecked ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${isChecked ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                              {isChecked && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                            </div>
                            <span className="font-medium text-gray-800">{ex.name}</span>
                          </div>
                          <span className="text-sm font-bold text-gray-600">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(ex.price)}+</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)] relative z-10">
              <button 
                onClick={handleAddToCart}
                className="w-full py-4 bg-[#1A1414] text-white rounded-xl font-bold text-lg hover:bg-black transition-colors shadow-lg"
              >
                Add to Booking
              </button>
            </div>
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
