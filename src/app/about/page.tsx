import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FBF9F7] pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* Image Side */}
          <div className="w-full lg:w-1/2 relative animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="relative aspect-[4/5] w-full rounded-[2.5rem] overflow-hidden shadow-2xl">
              <Image 
                src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=800&q=80" 
                alt="Nail Artistry" 
                fill 
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              
              <div className="absolute bottom-8 left-8 right-8 bg-white/20 backdrop-blur-md border border-white/30 p-6 rounded-2xl text-white">
                <p className="font-serif italic text-2xl mb-1">"Flawless & Enduring"</p>
                <p className="text-sm font-light tracking-wider uppercase opacity-90">Our Promise</p>
              </div>
            </div>
            {/* Decorative Blob */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#F8D9CE] rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
          </div>

          {/* Content Side */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center animate-in fade-in slide-in-from-right-8 duration-1000 delay-300 fill-mode-both">
            <div className="inline-flex items-center gap-3 mb-6 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold tracking-widest uppercase w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Our Story
            </div>
            
            <h1 className="font-serif text-5xl lg:text-7xl text-[#1A1414] mb-8 leading-tight">
              Crafting <br/><span className="italic text-primary/80">Elegance</span>
            </h1>
            
            <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
              <p>
                We specialize in acrylic, hardgel, and BIAB services, creating clean, detailed, and long-lasting nail sets tailored to each client's unique aesthetic.
              </p>
              <p>
                Our studio is designed to be a sanctuary of calm where precision meets art. Please ensure you book the correct service and add-ons to avoid delays during your appointment.
              </p>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row items-center gap-6">
              <Link href="/services" className="w-full sm:w-auto bg-[#1A1414] text-white px-8 py-4 rounded-full font-semibold shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:bg-black transition-all text-center">
                Explore Services
              </Link>
              <span className="font-serif italic text-xl text-[#1A1414]/60">
                Can't wait to see you. XX💕
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
