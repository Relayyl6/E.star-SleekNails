import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  const categories = [
    { name: "Full Sets", image: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?auto=format&fit=crop&w=600&q=80" },
    { name: "In-Fill", image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80" },
    { name: "Pedicure", image: "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=600&q=80" },
    { name: "Nail Art", image: "https://images.unsplash.com/photo-1595868840212-32b53443a290?auto=format&fit=crop&w=600&q=80" },
    { name: "Removal", image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=600&q=80" },
    { name: "Add-ons", image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=600&q=80" },
  ];

  const socialImages = [
    "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1595868840212-32b53443a290?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=400&q=80",
  ];

  return (
    <div className="relative">
      {/* 2. Hero Section */}
      <section className="relative h-screen min-h-[600px] flex flex-col items-center justify-center pt-24 pb-12">
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0 bg-surface">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            poster="https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1920&q=80"
            className="absolute inset-0 w-full h-full object-cover opacity-90"
          >
            <source src="https://assets.mixkit.co/videos/13084/13084-720.mp4" type="video/mp4" />
          </video>
        {/* Bottom-to-top gradient scrim for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1414] via-[#1A1414]/50 to-transparent"></div>
          {/* Radial vignette to darken edges but keep center video visible */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#1A1414]/20 to-[#1A1414]/80"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center px-6 mt-20 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
          {/* Location Badge */}
          <div className="inline-flex items-center gap-3 mb-8 px-5 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white/90 text-xs font-semibold tracking-[0.3em] uppercase shadow-xl">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            Lagos · Nail Studio
          </div>
          
          {/* Main Heading */}
          <h1 className="font-serif text-6xl md:text-8xl lg:text-[7.5rem] mb-6 tracking-tight drop-shadow-[0_4px_32px_rgba(0,0,0,0.5)] text-white leading-[1.1]">
            E.star <span className="italic text-[#F8D9CE]">Sleek</span>Nails
          </h1>
          
          {/* Tagline */}
          <p className="text-xl md:text-2xl font-light mb-12 max-w-2xl text-white drop-shadow-md leading-relaxed">
            Acrylic, BIAB & hard gel sets, <br className="hidden md:block"/> done <span className="font-medium italic">clean</span> and on time.
          </p>
          
          {/* CTA Group */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Link 
              href="/book" 
              className="group relative flex items-center gap-4 bg-primary text-white px-10 py-5 rounded-full text-lg font-medium shadow-[0_0_40px_rgba(232,87,42,0.4)] hover:shadow-[0_0_60px_rgba(232,87,42,0.6)] hover:bg-[#ff6a3d] hover:-translate-y-1 transition-all duration-300"
            >
              <span className="relative z-10">Book an Appointment</span>
              <svg className="w-5 h-5 relative z-10 transform group-hover:translate-x-1.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            
            <Link href="/services" className="text-white hover:text-primary transition-colors tracking-widest text-sm font-semibold uppercase border-b border-transparent hover:border-primary pb-1">
              Explore Services
            </Link>
          </div>
        </div>
      </section>

      <div className="bg-surface relative z-20">
        {/* Tagline / Typographic Collage */}
      <section className="py-8 md:py-10 px-6 border-t border-black/5 relative flex items-center justify-center">
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes hinge-wobble {
            0%, 100% { transform: rotate(0deg); }
            20% { transform: rotate(12deg); }
            40% { transform: rotate(-6deg); }
            60% { transform: rotate(4deg); }
            80% { transform: rotate(-2deg); }
          }
          .animate-hinge {
            animation: hinge-wobble 4s ease-in-out infinite;
            transform-origin: top left;
            display: inline-block;
          }
        `}} />
        
        <div className="relative max-w-2xl mx-auto flex flex-col items-center justify-center space-y-4">
          <p className="text-sm md:text-base text-gray-500 font-light tracking-[0.2em] uppercase mb-1">
            The E.star Signature
          </p>
          
          <div className="relative flex items-center justify-center flex-wrap gap-x-6 gap-y-2 text-center leading-none">
            <span className="text-3xl md:text-5xl font-serif text-black/80 italic">Clean.</span>
            <span className="text-2xl md:text-4xl font-sans font-bold text-primary tracking-tighter uppercase animate-hinge hover:animate-none cursor-default">Hardgel</span>
            <span className="text-3xl md:text-4xl font-serif text-black/60 font-light">Acrylic</span>
            <div className="w-full h-0"></div>
            <span className="text-xl md:text-2xl font-mono text-gray-400 tracking-tight">detailed</span>
            <span className="text-2xl md:text-4xl font-sans tracking-[0.1em] text-black/90 uppercase -rotate-2 origin-center">BIAB</span>
            <span className="text-xl md:text-3xl font-serif italic text-primary/80">Tailored</span>
            <span className="text-sm md:text-base font-sans tracking-widest text-black/40 uppercase rotate-2 mt-2">Long-lasting</span>
          </div>
          
          <p className="mt-4 text-gray-600 font-light text-center max-w-md text-sm leading-relaxed">
            We specialize in creating flawless, enduring nail sets tailored specifically to your aesthetic.
          </p>
        </div>
      </section>

        {/* 3. Featured Services Grid */}
        <section className="pb-20 pt-4 md:pt-8 px-6 md:px-12 max-w-[1600px] mx-auto bg-surface">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl mb-12 text-foreground">Featured Services</h2>
            
            {/* 3 columns, 2 rows grid as requested */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[
                { name: "Signature Full Set", duration: "2h", price: "₦20,000", desc: "Acrylics, BIAB & hard gel extensions with either French tips, simple accents, swirls, simple ombré.", image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=200&q=80" },
                { name: "Elevated Full Set", duration: "2h", price: "₦25,000", desc: "Acrylics, BIAB & hard gel extensions with up to two design elements or 3d art.", image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=200&q=80" },
                { name: "Statement Full Set", duration: "2h 30min", price: "₦35,000", desc: "Acrylic, BIAB or hard gel extensions with intricate nail art, detailed hand painted designs and multiple layered nail design elements.", image: "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=200&q=80" },
                { name: "Gel Polish Manicure", duration: "1h 15min", price: "₦12,000", desc: "Detailed cuticle work and shaping, finished with your choice of solid gel color.", image: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=200&q=80" },
                { name: "In-Fill / Maintenance", duration: "1h 30min", price: "₦15,000", desc: "Rebalancing and filling growth on existing enhancements. Includes one gel color.", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=200&q=80" },
                { name: "Nail Art / Add-ons", duration: "15min+", price: "From ₦2,000", desc: "Extra length, intricate character art, chrome powders, or rhinestones added to any service.", image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=200&q=80" },
              ].map((service) => (
                <div 
                  key={service.name}
                  className="bg-white rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary flex flex-row justify-between gap-4 md:gap-6 group"
                >
                  <div className="flex-1 flex flex-col min-w-0">
                    <h3 className="font-serif text-xl md:text-2xl text-[#1A1414] mb-1 truncate">{service.name}</h3>
                    <p className="text-sm font-medium text-gray-500 mb-2">{service.duration} · {service.price}</p>
                    <p className="text-[13px] text-gray-700 leading-relaxed line-clamp-3 mb-2 flex-1">
                      {service.desc}
                    </p>
                    <Link 
                      href={`/services/${service.name.toLowerCase().replace(/ /g, '-')}`}
                      className="mt-auto text-xs font-semibold text-primary hover:underline underline-offset-2 w-fit"
                    >
                      Show more...
                    </Link>
                  </div>
                  
                  <div className="flex flex-col items-end justify-between shrink-0 gap-3">
                    <Link 
                      href={`/services`}
                      className="px-4 py-1.5 rounded-xl text-[13px] font-bold transition-colors bg-[#F8D9CE] text-[#1A1414] hover:bg-primary hover:text-white whitespace-nowrap"
                    >
                      Select
                    </Link>
                    <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden shadow-sm group-hover:ring-2 group-hover:ring-primary ring-offset-2 transition-all mt-auto">
                      <Image 
                        src={service.image} 
                        alt={service.name} 
                        fill 
                        className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link href="/services" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
                View full service menu
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
              </Link>
            </div>
          </div>
        </section>

        {/* 4. Trust / Social Proof (Instagram) */}
        <section className="py-16 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-serif text-2xl md:text-3xl text-foreground">From the studio</h2>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              Follow us
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=400&q=80",
              "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=400&q=80",
              "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=400&q=80",
              "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=400&q=80",
            ].map((img, i) => (
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" key={i} className="relative aspect-square rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all group block">
                <Image src={img} alt="Instagram post from studio" fill className="object-cover transform group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md transform scale-50 group-hover:scale-100 duration-300" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* 5. Category Grid (Moved before Footer) */}
        <section className="py-16 px-6 md:px-12 max-w-7xl mx-auto border-t border-black/5 mt-8">
          <h2 className="font-serif text-3xl md:text-4xl mb-10 text-foreground text-center">Explore by Category</h2>
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
                href={`/book?category=${category.name.toLowerCase().replace(' ', '-')}`}
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

        {/* 6. Hours / Location Teaser */}
        <section className="py-10 border-t border-black/5 bg-white">
          <div className="max-w-6xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="font-medium text-foreground">Open now · 7:00–18:00</span>
            </div>
            <a href="#" className="text-primary font-medium hover:underline inline-flex items-center gap-1 group">
              Get directions 
              <span className="transform group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>
        </section>

        {/* Floating Policy Button */}
        <div className="fixed bottom-6 right-6 z-40">
          <Link href="/policy" className="bg-white/80 backdrop-blur-md border border-black/10 text-xs font-semibold px-4 py-2 rounded-full shadow-lg hover:shadow-xl hover:bg-white text-gray-700 hover:text-primary transition-all flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Policy & Terms
          </Link>
        </div>
      </div>
    </div>
  );
}
