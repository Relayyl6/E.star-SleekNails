"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function SignatureGallery() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkOpen = () => {
      const now = new Date();
      const hour = now.getHours();
      setIsOpen(hour >= 9 && hour < 17);
    };
    checkOpen();
    const timer = setInterval(checkOpen, 60000);
    return () => clearInterval(timer);
  }, []);

  const images = [
    "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1595868615330-84c6c518b2c2?auto=format&fit=crop&w=800&q=80",
  ];

  const testimonials = [
    { text: "The cleanest cuticle work I've ever had. My BIAB set lasted 5 weeks with zero lifting. Absolutely obsessed.", author: "Sarah M." },
    { text: "She is a true artist! I showed her an inspiration picture and she executed it perfectly. I'm in love.", author: "Jessica T." },
    { text: "Such a relaxing studio environment. I felt so pampered, and my natural nails have never been stronger.", author: "Elena R." }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[120vh] pt-12 pb-6 overflow-hidden flex flex-col justify-center">
      
      {/* Animated Surreal Fog Transition from Blush Pink */}
      <div className="absolute top-0 left-0 right-0 h-48 md:h-80 z-10 pointer-events-none">
        {/* Base seamless gradient from the blush pink surface */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#F8D9CE] via-[#F8D9CE]/60 to-transparent"></div>
        {/* Soft glowing clouds - Left */}
        <div className="absolute -top-20 -left-20 w-3/4 h-full bg-[#F8D9CE] blur-3xl opacity-90 animate-pulse duration-[4000ms]"></div>
        {/* Soft glowing clouds - Right */}
        <div className="absolute -top-20 -right-20 w-3/4 h-full bg-[#F8D9CE] blur-3xl opacity-90 animate-pulse duration-[5000ms] delay-700"></div>
      </div>

      {/* Dynamic Blurred Background Morphing */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image 
          src="https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=1200&q=80" 
          alt="Nail Background" 
          fill 
          className="object-cover opacity-60 blur-3xl scale-150 animate-pulse duration-[12000ms]"
        />
        <div className="absolute inset-0 bg-[#1A1414]/70 mix-blend-multiply"></div>
        {/* Seamless Fade into Footer */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#1A1414] to-transparent"></div>
      </div>

      {/* The Gallery Grid */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 mt-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[140px] md:auto-rows-[200px] grid-flow-dense">
          
          {/* Tile 1 - Large Square (2x2) */}
          <div onClick={() => setSelectedImage(images[0])} className="group relative rounded-2xl overflow-hidden cursor-zoom-in shadow-2xl col-span-2 row-span-2">
            <Image src={images[0]} alt="Nail Art 1" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-110 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Tile 2 - Small (1x1) */}
          <div onClick={() => setSelectedImage(images[1])} className="group relative rounded-2xl overflow-hidden cursor-zoom-in shadow-xl col-span-1 row-span-1">
            <Image src={images[1]} alt="Nail Art 2" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover group-hover:scale-110 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Tile 3 - Tall (1x2) */}
          <div onClick={() => setSelectedImage(images[2])} className="group relative rounded-2xl overflow-hidden cursor-zoom-in shadow-xl col-span-1 row-span-2">
            <Image src={images[2]} alt="Nail Art 3" fill sizes="25vw" className="object-cover group-hover:scale-110 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Tile 4 - Small (1x1) */}
          <div onClick={() => setSelectedImage(images[3])} className="group relative rounded-2xl overflow-hidden cursor-zoom-in shadow-xl col-span-1 row-span-1">
            <Image src={images[3]} alt="Nail Art 4" fill sizes="25vw" className="object-cover group-hover:scale-110 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* CENTER TEXT BOX - The Header (2x1) */}
          <div className="col-span-2 row-span-1 flex flex-col items-center justify-center p-4 text-center z-20">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
              Signature Sets
            </h2>
            <div className="h-px w-16 bg-primary mx-auto my-3 md:my-4 drop-shadow-md"></div>
            <p className="text-white/90 font-light tracking-widest uppercase text-xs md:text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              A glimpse into our artistry
            </p>
          </div>

          {/* Tile 5 - Wide (2x1) */}
          <div onClick={() => setSelectedImage(images[4])} className="group relative rounded-2xl overflow-hidden cursor-zoom-in shadow-xl col-span-2 row-span-1">
            <Image src={images[4]} alt="Nail Art 5" fill sizes="50vw" className="object-cover group-hover:scale-110 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Tile 6 - Small (1x1) */}
          <div onClick={() => setSelectedImage(images[5])} className="group relative rounded-2xl overflow-hidden cursor-zoom-in shadow-xl col-span-1 row-span-1">
            <Image src={images[5]} alt="Nail Art 6" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover group-hover:scale-110 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Tile 7 - Small (1x1) */}
          <div onClick={() => setSelectedImage(images[6])} className="group relative rounded-2xl overflow-hidden cursor-zoom-in shadow-xl col-span-1 row-span-1">
            <Image src={images[6]} alt="Nail Art 7" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover group-hover:scale-110 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Testimonial Box (2x1) */}
          <div className="col-span-2 row-span-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col justify-center shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/80"></div>
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              ))}
            </div>
            <div className="relative h-20 md:h-24">
              {testimonials.map((testimonial, idx) => (
                <div 
                  key={idx} 
                  className={`absolute inset-0 transition-opacity duration-1000 ${currentTestimonial === idx ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                >
                  <p className="text-white/90 font-serif italic text-base md:text-lg leading-relaxed mb-3 line-clamp-3">
                    "{testimonial.text}"
                  </p>
                  <p className="text-white/50 text-xs tracking-wider uppercase font-semibold">— {testimonial.author}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Glassmorphic Hours / Location Teaser */}
      <div className="relative z-10 w-full bg-white/5 backdrop-blur-xl border-t border-white/10 mt-20 py-8">
        <div className="max-w-6xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              {isOpen && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isOpen ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </span>
            <span className="font-medium text-white/90 tracking-wide text-sm md:text-base">
              {isOpen ? 'Open now' : 'Closed'} · 9:00–5:00
            </span>
          </div>
          <a href="https://maps.google.com/?q=Estar+Sleek+Nails" target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:text-white transition-colors inline-flex items-center gap-1 group text-sm md:text-base">
            Get directions 
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
        </div>
      </div>

      {/* Click-to-Enlarge Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 cursor-zoom-out backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative w-full max-w-5xl aspect-[3/4] md:aspect-[4/3] lg:aspect-[16/9] animate-in zoom-in-95 duration-300">
            <Image
              src={selectedImage}
              alt="Enlarged Nail Art"
              fill
              className="object-contain"
              priority
            />
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
    </section>
  );
}
