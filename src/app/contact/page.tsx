import Image from 'next/image';

export default function ContactPage() {
  const hours = [
    { day: "Sunday", time: "14:00 - 18:00" },
    { day: "Monday", time: "7:00 - 18:00" },
    { day: "Tuesday", time: "7:00 - 18:00" },
    { day: "Wednesday", time: "7:00 - 18:00" },
    { day: "Thursday", time: "7:00 - 18:00" },
    { day: "Friday", time: "7:00 - 18:00" },
    { day: "Saturday", time: "7:00 - 18:00" },
  ];

  return (
    <div className="relative min-h-screen bg-[#1A1414] flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1920&q=80" 
          alt="Studio Background" 
          fill 
          className="object-cover opacity-30 blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1414]/80 via-[#1A1414]/50 to-[#1A1414]"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center">
        
        {/* Left Side: Contact Info */}
        <div className="text-white animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-3 mb-6 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 text-white/90 text-xs font-semibold tracking-[0.2em] uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Lagos Studio
          </div>
          
          <h1 className="font-serif text-5xl md:text-7xl mb-6 leading-tight">
            Get in <span className="italic text-[#F8D9CE]">Touch</span>
          </h1>
          
          <p className="text-white/60 text-lg max-w-md mb-12">
            Have a question about our services or need help booking? Reach out to us on WhatsApp or Instagram.
          </p>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="group flex items-center justify-center gap-3 bg-[#F8D9CE] text-[#1A1414] px-8 py-4 rounded-full font-semibold hover:bg-white transition-colors">
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                Follow on Instagram
              </a>
              <a href="https://wa.me/2347049022919" target="_blank" rel="noreferrer" className="border border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-full font-semibold transition-colors flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.599-.187-.968-.306-1.554-.5-2.738-1.579-3.214-2.22-.058-.078-.771-1.02-.771-1.942 0-.923.479-1.378.648-1.555.151-.159.39-.236.621-.236.075 0 .145.002.207.005.184.008.277.021.401.32.155.372.531 1.297.578 1.393.047.096.078.209.02.327-.058.118-.088.191-.175.293-.087.103-.186.223-.263.31-.083.095-.172.199-.074.368.098.169.435.718.932 1.163.642.575 1.182.753 1.352.836.17.083.27.073.37-.04.101-.114.436-.508.552-.682.115-.174.229-.145.385-.088.156.058.986.465 1.155.55.17.085.283.128.324.198.041.07.041.404-.103.809z" /></svg>
                Message
              </a>
            </div>
            
            <details className="group cursor-pointer mt-2">
              <summary className="text-white/50 text-sm font-medium hover:text-white transition-colors flex items-center gap-2 list-none select-none">
                See other details
                <svg className="w-4 h-4 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </summary>
              <div className="mt-4 p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-3 text-sm">
                <a href="mailto:hello@estarsleeknails.com" className="flex items-center gap-3 text-white/80 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  hello@estarsleeknails.com
                </a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-white/80 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                  @estarsleeknails
                </a>
                <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-white/80 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v6.86c-.01 2.37-.66 4.74-2.06 6.56-1.49 1.95-3.8 3.12-6.26 3.12-2.73 0-5.32-1.35-6.85-3.51-1.4-1.99-1.92-4.52-1.39-6.9.48-2.12 1.68-4.05 3.48-5.36 2.06-1.5 4.75-2.01 7.21-1.36v4.06c-1.28-.48-2.75-.46-4.02.13-1.12.52-1.97 1.52-2.24 2.74-.25 1.13.04 2.35.8 3.22.75.84 1.9 1.34 3.07 1.34 1.83 0 3.43-1.35 3.73-3.15.11-.64.12-1.29.12-1.93V.02z"/></svg>
                  @estarsleeknails
                </a>
              </div>
            </details>
          </div>
        </div>

        {/* Right Side: Glassmorphism Hours Card */}
        <div className="animate-in fade-in slide-in-from-right-8 duration-1000 delay-300">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
            {/* Soft decorative glow inside card */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full mix-blend-screen filter blur-[60px]"></div>
            
            <h2 className="font-serif text-3xl text-white mb-8 relative z-10 flex items-center gap-3">
              <svg className="w-6 h-6 text-[#F8D9CE]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              Opening Hours
            </h2>
            
            <div className="space-y-4 relative z-10">
              {hours.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-white/10 last:border-0 group">
                  <span className="text-white/80 font-medium group-hover:text-white transition-colors">{item.day}</span>
                  <span className="text-white font-mono tracking-wider bg-black/20 px-3 py-1 rounded-lg">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
