'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiShare2, FiInfo } from 'react-icons/fi';
import { toast } from 'sonner';

type GalleryImage = {
  id: string;
  url: string;
  isFavorite: boolean;
  uploadedAt: number;
  title?: string;
};

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const [tappedImageId, setTappedImageId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/gallery')
      .then(res => res.json())
      .then(data => {
        setImages(data.images || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleShare = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const url = `${window.location.origin}/gallery/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  };

  const handleImageClick = (image: GalleryImage) => {
    // Check if device is likely mobile (touch screen)
    if (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches) {
      if (tappedImageId !== image.id) {
        setTappedImageId(image.id);
      } else {
        setSelectedImage(image);
      }
    } else {
      // Desktop - open lightbox immediately
      setSelectedImage(image);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1414] text-white pt-32 pb-20 px-4 md:px-8" onClick={() => setTappedImageId(null)}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4 drop-shadow-md">Our Gallery</h1>
          <div className="h-px w-20 bg-primary mx-auto my-6 drop-shadow-md"></div>
          <p className="text-white/80 font-light max-w-2xl mx-auto text-lg">
            A showcase of our finest work. Every set is uniquely crafted to perfection.
          </p>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20 text-white/50">
            No images to display at the moment.
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {images.map(image => (
              <div 
                key={image.id} 
                onClick={(e) => {
                  e.stopPropagation();
                  handleImageClick(image);
                }}
                className="relative group rounded-xl overflow-hidden cursor-zoom-in break-inside-avoid shadow-lg"
              >
                <img 
                  src={image.url} 
                  alt={image.title || "Gallery Nail Art"} 
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  loading="lazy"
                />
                <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 flex flex-col justify-end p-4 ${tappedImageId === image.id ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'}`}>
                  {image.title && (
                    <p className={`font-serif font-bold text-white mb-2 transition-transform ${tappedImageId === image.id ? 'translate-y-0' : 'translate-y-2 md:group-hover:translate-y-0'}`}>{image.title}</p>
                  )}
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => handleShare(e, image.id)}
                      className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors"
                      title="Share link"
                    >
                      <FiShare2 size={16} />
                    </button>
                    <Link 
                      href={`/gallery/${image.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 bg-primary/80 hover:bg-primary backdrop-blur-md rounded-full text-white transition-colors ml-auto"
                      title="View Details"
                    >
                      <FiInfo size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox / Click-to-Enlarge Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 cursor-zoom-out backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative w-full max-w-5xl aspect-[3/4] md:aspect-[4/3] lg:aspect-[16/9] animate-in zoom-in-95 duration-300">
            <Image
              src={selectedImage.url}
              alt={selectedImage.title || "Enlarged Nail Art"}
              fill
              className="object-contain"
              priority
            />
          </div>
          
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 cursor-auto" onClick={e => e.stopPropagation()}>
            <Link 
              href={`/gallery/${selectedImage.id}`}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-full font-bold shadow-lg transition-colors flex items-center gap-2"
            >
              <FiInfo /> View Details & Book
            </Link>
            <button 
              onClick={(e) => handleShare(e, selectedImage.id)}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2.5 rounded-full font-semibold shadow-lg transition-colors flex items-center gap-2"
            >
              <FiShare2 /> Share
            </button>
          </div>

          <button 
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-2"
            onClick={() => setSelectedImage(null)}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
