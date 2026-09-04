'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ServiceDetailsClient({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { items, addItem, updateQuantity, removeItem } = useCart();

  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');
  const [selectedLength, setSelectedLength] = useState<any | null>(null);
  const [selectedDesign, setSelectedDesign] = useState<any | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then((data: any[]) => {
        const found = data.find((s: any) => s.id === resolvedParams.id);
        if (found) {
          setService(found);
          const imgs: string[] = Array.isArray(found.images) && found.images.length > 0
            ? found.images
            : found.image ? [found.image] : [];
          setActiveImage(imgs[0] || '');
          setSelectedLength(found.hasLengths && found.lengths?.length > 0 ? found.lengths[0] : null);
          setSelectedDesign(found.hasDesignTiers && found.designTiers?.length > 0 ? found.designTiers[0] : null);
          setSelectedExtras([]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [resolvedParams.id]);

  const cartItem = service ? items.find((i: any) => i.id === service.id) : null;
  const isSelected = !!cartItem;
  const quantity = cartItem?.quantity || 0;

  const toggleSelect = () => {
    if (!service) return;
    if (isSelected) {
      removeItem(service.id);
      return;
    }

    if (service.hasLengths && service.lengths?.length > 0 && !selectedLength) {
      toast.error('Please select a length');
      return;
    }
    
    if (service.hasDesignTiers && service.designTiers?.length > 0 && !selectedDesign) {
      toast.error('Please select a design tier');
      return;
    }

    let total = service.basePrice || 0;
    if (selectedLength) total += selectedLength.price;
    if (selectedDesign) total += selectedDesign.price;
    selectedExtras.forEach((e: any) => total += e.price);
    
    const formattedPrice = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(total);

    addItem({
      id: service.id + '-' + Date.now(),
      serviceId: service.id,
      name: service.name,
      price: formattedPrice,
      basePrice: service.basePrice,
      duration: service.duration,
      image: service.image || service.images?.[0] || '',
      quantity: 1,
      selectedLength,
      selectedDesign,
      selectedExtras
    }, true);
  };

  const allImages: string[] = service
    ? Array.isArray(service.images) && service.images.length > 0
      ? service.images
      : service.image ? [service.image] : []
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF9F7] pt-28 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-[#FBF9F7] pt-28 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 text-lg">Service not found.</p>
        <Link href="/services" className="text-primary font-semibold hover:underline">← Back to services</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F7] pt-28 pb-32 flex flex-col">
      <div className="max-w-6xl mx-auto px-6 md:px-12 w-full flex-1 flex flex-col">
        <Link href="/services" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-6 font-medium text-sm w-fit">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to services
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 flex-1">
          <div className="space-y-4 flex flex-col">
            <div className="relative w-full flex-1 min-h-[360px] lg:min-h-[480px] rounded-2xl overflow-hidden shadow-xl bg-gray-100 border border-black/5">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={service.name}
                  className="w-full h-full object-cover absolute inset-0"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-gray-300 font-serif text-7xl">{service.name?.charAt(0)}</span>
                </div>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImage === img ? 'border-primary shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`${service.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="inline-block px-4 py-1.5 bg-black/5 text-[#1A1414] rounded-full text-xs font-bold uppercase tracking-wider mb-6 w-fit">
              {service.category || 'Nails'}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#1A1414] mb-6 leading-tight">
              {service.name}
            </h1>

            <div className="flex items-center gap-6 mb-10 pb-10 border-b border-black/10 shrink-0">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 uppercase tracking-widest mb-1">Total Price</span>
                <span className="text-2xl font-sans font-medium text-[#1A1414]">
                  {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(
                    (service.basePrice || 0) + 
                    (selectedLength?.price || 0) + 
                    (selectedDesign?.price || 0) + 
                    selectedExtras.reduce((sum, e) => sum + e.price, 0)
                  )}
                </span>
              </div>
              <div className="w-px h-10 bg-black/10" />
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 uppercase tracking-widest mb-1">Duration</span>
                <span className="text-2xl font-sans font-medium text-[#1A1414]">{service.duration}</span>
              </div>
            </div>

            {service.description && (
              <div className="text-gray-600 mb-12 font-light leading-relaxed shrink-0 text-base">
                <p>{service.description}</p>
              </div>
            )}

            {service.hasLengths && service.lengths?.length > 0 && (
              <div className="space-y-4 mb-8 shrink-0">
                <h3 className="font-bold text-[#1A1414] flex items-center justify-between text-lg">
                  Select Length <span className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-500">Required</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {service.lengths.map((len: any) => (
                    <label key={len.name} onClick={() => setSelectedLength(len)} className={`flex items-center justify-between p-4 rounded-xl cursor-pointer border-2 transition-all ${selectedLength?.name === len.name ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center ${selectedLength?.name === len.name ? 'border-primary' : 'border-gray-300'}`}>
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

            {service.hasDesignTiers && service.designTiers?.length > 0 && (
              <div className="space-y-4 mb-8 shrink-0">
                <h3 className="font-bold text-[#1A1414] flex items-center justify-between text-lg">
                  Design Tier <span className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-500">Required</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {service.designTiers.map((tier: any) => (
                    <label key={tier.name} onClick={() => setSelectedDesign(tier)} className={`flex items-center justify-between p-4 rounded-xl cursor-pointer border-2 transition-all ${selectedDesign?.name === tier.name ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center ${selectedDesign?.name === tier.name ? 'border-primary' : 'border-gray-300'}`}>
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

            {service.hasExtras && service.extras?.length > 0 && (
              <div className="space-y-4 mb-8 shrink-0">
                <h3 className="font-bold text-[#1A1414] flex items-center justify-between text-lg">
                  Extras & Add-ons <span className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-500">Optional</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {service.extras.map((ex: any) => {
                    const isChecked = selectedExtras.some(e => e.name === ex.name);
                    return (
                      <label key={ex.name} onClick={(e) => {
                        e.preventDefault();
                        if (isChecked) {
                          setSelectedExtras(prev => prev.filter(p => p.name !== ex.name));
                        } else {
                          setSelectedExtras(prev => [...prev, ex]);
                        }
                      }} className={`flex items-center justify-between p-4 rounded-xl cursor-pointer border-2 transition-all ${isChecked ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 shrink-0 rounded border flex items-center justify-center ${isChecked ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                            {isChecked && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
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
                      <button onClick={() => updateQuantity(service.id, -1)} className="w-10 h-10 flex items-center justify-center rounded-full text-primary font-bold text-xl hover:bg-gray-50 transition-colors">-</button>
                      <span className="w-8 text-center font-bold text-lg text-[#1A1414]">{quantity}</span>
                      <button onClick={() => updateQuantity(service.id, 1)} className="w-10 h-10 flex items-center justify-center rounded-full text-primary font-bold text-xl hover:bg-gray-50 transition-colors">+</button>
                    </div>
                  </div>
                  <Link href="/book/date-time" className="w-full bg-primary text-white py-5 rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 text-center">
                    Continue to Booking →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
