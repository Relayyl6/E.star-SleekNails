'use client';

import { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase/config';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'sonner';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUploadCloud } from 'react-icons/fi';

export default function VendorServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [desc, setDesc] = useState('');
  const [images, setImages] = useState(''); // Comma separated

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    // 1. Load from cache
    const cached = localStorage.getItem('sleeknails_services');
    if (cached) {
      try {
        setServices(JSON.parse(cached));
        setLoading(false);
      } catch (e) {}
    } else {
      setLoading(true);
    }
    
    // 2. Fetch fresh
    try {
      const res = await fetch('/api/services');
      if (!res.ok) {
        if (!cached) toast.error('Failed to fetch services');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setServices(data);
      localStorage.setItem('sleeknails_services', JSON.stringify(data));
    } catch (e) {
      console.error(e);
      if (!cached) toast.error('Failed to load services');
    }
    setLoading(false);
  };

  const openDrawer = (service?: any) => {
    if (service) {
      setEditingId(service.id);
      setName(service.name || '');
      setCategory(service.category || 'Full Sets');
      setPrice(service.price || '');
      setDuration(service.duration || '');
      setDesc(service.description || service.desc || '');
      setImages((service.images || [service.image || '']).join(', '));
    } else {
      setEditingId(null);
      setName('');
      setCategory('Full Sets');
      setPrice('');
      setDuration('');
      setDesc('');
      setImages('');
    }
    setIsDrawerOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Use standard FormData to upload via Next.js API route
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        if (!res.ok) {
          toast.error("Failed to upload image. Please try again.");
          setUploading(false);
          return;
        }

        const data = await res.json();
        newUrls.push(data.url);
      }
      
      const combinedUrls = newUrls.join(', ');
      setImages(prev => prev ? `${prev}, ${combinedUrls}` : combinedUrls);
      toast.success(`Successfully uploaded ${files.length} image${files.length > 1 ? 's' : ''}!`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload images");
    }
    setUploading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const id = editingId || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const imagesArray = images.split(',').map(url => url.trim()).filter(url => url !== '');
      
      // Smart price parsing
      let finalPrice = price;
      if (price) {
        const cleanPrice = price.toLowerCase().replace(/\s/g, '');
        let num = NaN;
        if (cleanPrice.endsWith('k')) {
          num = parseFloat(cleanPrice) * 1000;
        } else {
          num = parseFloat(cleanPrice.replace(/[^0-9.]/g, ''));
        }
        
        if (!isNaN(num)) {
          finalPrice = new Intl.NumberFormat('en-NG', { 
            style: 'currency', 
            currency: 'NGN', 
            minimumFractionDigits: 0 
          }).format(num);
        }
      }

      // Smart duration parsing
      let finalDuration = duration;
      if (duration) {
        const durStr = duration.toLowerCase().replace(/\s/g, '');
        let num = NaN;
        
        // Extract the number (e.g. 1.5 from "1.5h" or "1.5")
        if (durStr.includes('m') && !durStr.includes('h')) {
          // If they typed "90m" or "90mins"
          const mins = parseFloat(durStr);
          if (!isNaN(mins)) num = mins / 60;
        } else {
          num = parseFloat(durStr);
        }

        if (!isNaN(num)) {
          const hours = Math.floor(num);
          const minutes = Math.round((num - hours) * 60);
          
          if (hours > 0 && minutes > 0) {
            finalDuration = `${hours}h ${minutes}min`;
          } else if (hours > 0) {
            finalDuration = `${hours} hr${hours > 1 ? 's' : ''}`;
          } else if (minutes > 0) {
            finalDuration = `${minutes} min`;
          }
        }
      }

      const payload = {
        id,
        name,
        category,
        price: finalPrice,
        duration: finalDuration,
        description: desc,
        images: imagesArray,
        image: imagesArray[0] || '' // Fallback
      };

      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        toast.error('Failed to save');
        return;
      }

      toast.success('Service saved successfully!');
      setIsDrawerOpen(false);
      fetchServices();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save service');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      const res = await fetch(`/api/services?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        toast.error('Failed to delete service');
        return;
      }
      toast.success('Service deleted');
      fetchServices();
    } catch (error) {
      toast.error('Failed to delete service');
    }
  };

  return (
    <>
      <div className="min-h-full p-6 md:p-12 relative bg-gray-50/50">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-serif text-[#1A1414] font-bold">Services</h1>
          <button onClick={() => openDrawer()} className="flex items-center gap-2 px-5 py-3 bg-[#1A1414] text-white rounded-xl text-sm font-bold hover:bg-black transition-colors shadow-lg shadow-black/10">
            <FiPlus size={18} /> Add Service
          </button>
        </div>

        {loading ? (
          <div className="text-gray-500 animate-pulse font-medium text-lg text-center py-20">Loading services...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {services.map(service => (
              <div key={service.id} className="group bg-white rounded-2xl border border-black/5 overflow-hidden hover:border-black/20 hover:shadow-xl transition-all duration-300 flex flex-col">
                <div className="aspect-[4/3] w-full bg-gray-50 relative overflow-hidden">
                   {(service.images?.[0] || service.image) ? (
                    <img src={service.images?.[0] || service.image} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-[#1A1414] shadow-sm uppercase tracking-wider">
                    {service.category || "Full Sets"}
                  </div>
                </div>
                
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-serif text-base md:text-lg font-bold text-[#1A1414] mb-1.5 leading-tight">{service.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1 leading-snug">
                    {service.description || service.desc || "No description provided."}
                  </p>
                  
                  <div className="flex items-end justify-between mt-auto pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Price</p>
                      <p className="font-bold text-sm md:text-base text-primary">{service.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Duration</p>
                      <p className="font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-xs">{service.duration || '1 hr'}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <button 
                      onClick={() => openDrawer(service)} 
                      className="flex items-center justify-center gap-1.5 py-1.5 md:py-2 bg-gray-50 hover:bg-black hover:text-white text-gray-700 rounded-lg text-xs font-bold transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(service.id)} 
                      className="flex items-center justify-center gap-1.5 py-1.5 md:py-2 bg-red-50 hover:bg-red-500 hover:text-white text-red-600 rounded-lg text-xs font-bold transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slide-over Drawer for Add/Edit */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold font-serif">{editingId ? 'Edit Service' : 'Add Service'}</h2>
              <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                <FiX size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Service Name</label>
                  <input required value={name} onChange={e => setName(e.target.value)} type="text" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1A1414]" placeholder="e.g. Signature Full Set" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                  <select required value={category} onChange={e => setCategory(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1A1414] bg-white appearance-none">
                    <option value="Full Sets">Full Sets</option>
                    <option value="Infill & Overlays">Infill & Overlays</option>
                    <option value="Pedicure">Pedicure</option>
                    <option value="Nail Art & Add-ons">Nail Art & Add-ons</option>
                    <option value="Take Off & Care">Take Off & Care</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Price</label>
                  <input required value={price} onChange={e => setPrice(e.target.value)} type="text" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1A1414]" placeholder="e.g. ₦20,000" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Duration</label>
                  <input required value={duration} onChange={e => setDuration(e.target.value)} type="text" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1A1414]" placeholder="e.g. 2h 30min" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea required value={desc} onChange={e => setDesc(e.target.value)} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1A1414] resize-none" placeholder="Describe the service..." />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Service Images</label>
                
                <div 
                  className="relative"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      const syntheticEvent = {
                        target: { files: e.dataTransfer.files }
                      } as unknown as React.ChangeEvent<HTMLInputElement>;
                      handleImageUpload(syntheticEvent);
                    }
                  }}
                >
                  <input 
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={uploading}
                  />
                  <div className={`w-full border-2 border-dashed border-gray-300 rounded-xl px-4 py-8 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors ${uploading ? 'opacity-50' : ''}`}>
                    <FiUploadCloud size={28} className="mb-3" />
                    <span className="text-sm font-medium text-center">{uploading ? 'Uploading Images...' : 'Click to Upload or Drag and Drop'}</span>
                  </div>
                </div>

                {images && (
                  <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {images.split(',').map(url => url.trim()).filter(url => url !== '').map((url, i) => (
                      <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                        <img src={url} className="w-full h-full object-cover" alt="Preview" />
                        <button
                          type="button"
                          onClick={() => {
                            const currentImages = images.split(',').map(u => u.trim()).filter(u => u !== '');
                            currentImages.splice(i, 1);
                            setImages(currentImages.join(', '));
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-red-50 text-red-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>

            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <button 
                onClick={handleSave}
                disabled={uploading}
                className="w-full py-4 bg-[#1A1414] text-white rounded-xl font-bold text-lg hover:bg-black transition-colors shadow-lg disabled:opacity-50"
              >
                Save Service
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
