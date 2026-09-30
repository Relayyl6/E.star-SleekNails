'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { FiTrash2, FiStar, FiUploadCloud, FiImage, FiEdit2, FiX } from 'react-icons/fi';
import { upload } from '@vercel/blob/client';
import Image from 'next/image';

type GalleryImage = {
  id: string;
  url: string;
  isFavorite: boolean;
  uploadedAt: number;
  title?: string;
  description?: string;
  serviceId?: string;
};

type Service = {
  id: string;
  name: string;
};

export default function VendorGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [tappedImageId, setTappedImageId] = useState<string | null>(null);
  
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);

  const [testimonials, setTestimonials] = useState<{ text: string, author: string, stars: number }[]>([
    { text: '', author: '', stars: 5 },
    { text: '', author: '', stars: 5 },
    { text: '', author: '', stars: 5 }
  ]);
  const [savingTestimonial, setSavingTestimonial] = useState(false);

  useEffect(() => {
    fetchGallery();
    fetchServices();
  }, []);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.group')) {
        setTappedImageId(null);
      }
    };
    if (tappedImageId) {
      document.addEventListener('touchstart', handleGlobalClick);
      document.addEventListener('click', handleGlobalClick);
    }
    return () => {
      document.removeEventListener('touchstart', handleGlobalClick);
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [tappedImageId]);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services');
      if (res.ok) {
        const data = await res.json();
        setServices(data.map((s: any) => ({ id: s.id, name: s.name })));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/gallery');
      if (res.ok) {
        const data = await res.json();
        setImages(data.images || []);
        if (data.testimonials && Array.isArray(data.testimonials)) {
          // ensure we have exactly 3
          const loaded = [...data.testimonials];
          while (loaded.length < 3) loaded.push({ text: '', author: '', stars: 5 });
          setTestimonials(loaded.slice(0, 3));
        } else if (data.testimonial) {
          // fallback if it was saved as a single object previously
          setTestimonials([
            data.testimonial,
            { text: '', author: '', stars: 5 },
            { text: '', author: '', stars: 5 }
          ]);
        }
      } else {
        toast.error('Failed to load gallery');
      }
    } catch (e) {
      toast.error('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uniqueFilename = `gallery_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        
        const newBlob = await upload(uniqueFilename, file, {
          access: 'public',
          handleUploadUrl: '/api/upload',
        });
        
        // Save to DB
        await fetch('/api/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'add_image', url: newBlob.url })
        });
      }
      
      toast.success(`Successfully uploaded ${files.length} image${files.length > 1 ? 's' : ''}!`);
      fetchGallery();
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload image. Please try again.");
    }
    setUploading(false);
    
    // reset file input
    e.target.value = '';
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    try {
      const res = await fetch(`/api/gallery?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Image deleted');
      fetchGallery();
    } catch (error) {
      toast.error('Failed to delete image');
    }
  };

  const toggleFavorite = async (image: GalleryImage) => {
    try {
      if (!image.isFavorite) {
        const currentFavorites = images.filter(img => img.isFavorite).length;
        if (currentFavorites >= 7) {
          toast.error('You can only have up to 7 favorites for the Signature Sets.');
          return;
        }
      }

      const res = await fetch('/api/gallery', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: image.id, isFavorite: !image.isFavorite })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update favorite status');
      }
      
      fetchGallery();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingImage) return;

    try {
      const res = await fetch('/api/gallery', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_details',
          id: editingImage.id,
          title: editingImage.title,
          description: editingImage.description,
          serviceId: editingImage.serviceId
        })
      });
      if (!res.ok) throw new Error('Failed to save details');
      
      toast.success('Image details updated!');
      setEditingImage(null);
      fetchGallery();
    } catch (error) {
      toast.error('Failed to update details');
    }
  };

  const handleSaveTestimonials = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTestimonial(true);
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_testimonials', testimonials })
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success('Testimonials updated successfully!');
    } catch (error) {
      toast.error('Failed to update testimonials');
    } finally {
      setSavingTestimonial(false);
    }
  };

  const updateTestimonial = (index: number, field: string, value: any) => {
    const newT = [...testimonials];
    newT[index] = { ...newT[index], [field]: value };
    setTestimonials(newT);
  };

  const favoriteCount = images.filter(img => img.isFavorite).length;

  return (
    <div className="min-h-full p-6 md:p-12 relative bg-gray-50/50">
      <div className="mb-10">
        <h1 className="text-3xl font-serif text-[#1A1414] font-bold">Gallery Management</h1>
        <p className="text-gray-500 mt-2">Upload images for the gallery and choose up to 7 favorites to display in the Signature Sets.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Upload & Gallery */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Upload Box */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold mb-4 font-serif">Upload New Images</h2>
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
                <FiUploadCloud size={32} className="mb-3 text-primary" />
                <span className="font-semibold text-gray-700">{uploading ? 'Uploading...' : 'Click to Upload or Drag and Drop'}</span>
                <span className="text-xs text-gray-400 mt-1">Supports JPG, PNG, WEBP</span>
              </div>
            </div>
          </div>

          {/* Gallery Grid */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold font-serif">All Images</h2>
              <span className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
                {favoriteCount} / 7 Favorites Selected
              </span>
            </div>
            
            {loading ? (
              <div className="text-center py-10 text-gray-500 animate-pulse">Loading gallery...</div>
            ) : images.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                <FiImage className="mx-auto text-gray-300 mb-3" size={40} />
                <p className="text-gray-500">No images uploaded yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map(image => (
                  <div 
                    key={image.id} 
                    className={`relative group aspect-square rounded-xl overflow-hidden border-2 ${image.isFavorite ? 'border-primary shadow-md' : 'border-transparent shadow-sm'}`}
                    onClick={(e) => {
                      if (window.matchMedia('(hover: none)').matches) {
                        if (tappedImageId !== image.id) {
                          e.preventDefault();
                          setTappedImageId(image.id);
                        }
                      }
                    }}
                  >
                    <Image src={image.url} alt="Gallery" fill className="object-cover" />
                    
                    {/* Overlay */}
                    <div className={`absolute inset-0 bg-black/40 flex flex-col justify-between p-2 z-10 transition-opacity duration-300 ${tappedImageId === image.id ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'}`}>
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setEditingImage(image)}
                          className="p-2 rounded-full bg-white/20 text-white hover:bg-white/40 backdrop-blur-md transition-colors"
                          title="Edit Details"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button 
                          onClick={() => toggleFavorite(image)}
                          className={`p-2 rounded-full backdrop-blur-md transition-colors ${image.isFavorite ? 'bg-primary text-white' : 'bg-white/20 text-white hover:bg-white/40'}`}
                          title={image.isFavorite ? "Remove from Signature Sets" : "Add to Signature Sets"}
                        >
                          <FiStar className={image.isFavorite ? 'fill-current' : ''} size={16} />
                        </button>
                      </div>
                      <div className="flex justify-end">
                        <button 
                          onClick={() => handleDelete(image.id)}
                          className="p-2 rounded-full bg-red-500/80 text-white hover:bg-red-600 backdrop-blur-md transition-colors"
                          title="Delete Image"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    {image.isFavorite && (
                      <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded shadow uppercase tracking-wide">
                        Favorite
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Testimonial Edit */}
        <div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm sticky top-6">
            <h2 className="text-lg font-bold mb-1 font-serif">Signature Testimonials</h2>
            <p className="text-sm text-gray-500 mb-6">These 3 testimonials rotate on the homepage.</p>
            
            <form onSubmit={handleSaveTestimonials} className="space-y-6 h-[600px] overflow-y-auto pr-2 pb-10">
              {testimonials.map((t, idx) => (
                <div key={idx} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 space-y-3">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-primary">Testimonial {idx + 1}</h3>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Customer Name</label>
                    <input 
                      type="text" 
                      value={t.author} 
                      onChange={e => updateTestimonial(idx, 'author', e.target.value)} 
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1A1414]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Message</label>
                    <textarea 
                      rows={3} 
                      value={t.text} 
                      onChange={e => updateTestimonial(idx, 'text', e.target.value)} 
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1A1414] resize-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Stars (1-5)</label>
                    <input 
                      type="number" 
                      min="1" max="5" 
                      value={t.stars} 
                      onChange={e => updateTestimonial(idx, 'stars', Number(e.target.value))} 
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1A1414]"
                      required
                    />
                  </div>
                </div>
              ))}

              <button 
                type="submit" 
                disabled={savingTestimonial}
                className="w-full py-3 bg-[#1A1414] text-white rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50 mt-4 shadow-md sticky bottom-0"
              >
                {savingTestimonial ? 'Saving...' : 'Save All Testimonials'}
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* Edit Image Details Modal */}
      {editingImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setEditingImage(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <FiX size={24} />
            </button>
            <h2 className="text-xl font-bold font-serif mb-6">Edit Image Details</h2>
            
            <form onSubmit={handleSaveDetails} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                <input 
                  type="text" 
                  value={editingImage.title || ''} 
                  onChange={e => setEditingImage({...editingImage, title: e.target.value})} 
                  placeholder="e.g. Tortoise Shell Fall Nails"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#1A1414]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea 
                  rows={3} 
                  value={editingImage.description || ''} 
                  onChange={e => setEditingImage({...editingImage, description: e.target.value})} 
                  placeholder="Share some details about this look..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#1A1414] resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Link to Service</label>
                <select
                  value={editingImage.serviceId || ''}
                  onChange={e => setEditingImage({...editingImage, serviceId: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#1A1414] bg-white"
                >
                  <option value="">None (General booking)</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">If a customer clicks "Book This Look", they will be taken to this service.</p>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setEditingImage(null)}
                  className="px-6 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-[#1A1414] text-white rounded-xl font-bold hover:bg-black transition-colors"
                >
                  Save Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
