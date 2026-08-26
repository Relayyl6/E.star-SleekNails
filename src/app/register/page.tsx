import Link from 'next/link';
import Image from 'next/image';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex bg-surface">
      {/* Left Pane - Visuals (Hidden on small screens) */}
      <div className="hidden lg:flex w-1/2 relative bg-[#1A1414] items-center justify-center overflow-hidden">
        {/* Looping background video */}
        <div className="absolute inset-0 opacity-60 mix-blend-screen">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="https://player.vimeo.com/external/498835824.sd.mp4?s=d00bb34eb2c8421b16cfa2b98818818c1b9f6764&profile_id=164&oauth2_token_id=57447761" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-[#1A1414] mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-primary/20 mix-blend-overlay"></div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 px-16 w-full max-w-2xl">
          <Link href="/" className="inline-block mb-16 hover:opacity-80 transition-opacity">
            <Image src="/logo.png" alt="E.star" width={120} height={40} className="object-contain brightness-0 invert opacity-90" />
          </Link>
          
          <h1 className="text-6xl font-serif text-white leading-[1.1] tracking-tight mb-8 drop-shadow-lg">
            Create <br />
            Something <br />
            <span className="italic text-primary/90">Beautiful</span>
          </h1>
          
          <p className="text-white/70 text-lg max-w-sm font-light">
            Join E.star SleekNails to easily manage your bookings, save your favorite styles, and more.
          </p>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-24 bg-white relative z-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-12 flex justify-center">
            <Link href="/">
              <Image src="/logo.png" alt="E.star" width={140} height={40} className="object-contain" />
            </Link>
          </div>

          <div className="flex items-center gap-4 mb-10 bg-gray-50 p-1.5 rounded-full w-fit">
            <Link href="/register" className="px-6 py-2 rounded-full bg-white text-[#1A1414] font-medium shadow-sm text-sm">Sign up</Link>
            <Link href="/login" className="px-6 py-2 rounded-full text-gray-500 font-medium hover:text-gray-900 transition-colors text-sm">Sign in</Link>
          </div>

          <div className="text-left mb-8">
            <h2 className="text-3xl font-serif text-[#1A1414]">Create an account</h2>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <input 
                  type="text" 
                  placeholder="First name" 
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <input 
                  type="text" 
                  placeholder="Last name" 
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
            </div>
            
            <div className="space-y-1.5 relative flex items-center">
              <div className="absolute left-4 flex items-center gap-2 border-r border-gray-300 pr-3">
                <span className="text-lg leading-none">🇳🇬</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
              </div>
              <input 
                type="tel" 
                placeholder="(234) 000-0000" 
                className="w-full pl-24 pr-4 py-3.5 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
            </div>

            <div className="pt-4">
              <button className="w-full bg-[#1A1414] text-white py-4 rounded-xl font-bold hover:bg-black transition-colors shadow-lg shadow-black/10">
                Create an account
              </button>
            </div>
            
            <div className="relative flex items-center justify-center py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <span className="relative bg-white px-4 text-xs text-gray-400 uppercase tracking-wider">or sign up with</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="w-full bg-white border border-gray-200 py-3.5 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              </button>
              <button className="w-full bg-white border border-gray-200 py-3.5 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center text-gray-800">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z"/></svg>
              </button>
            </div>

            <p className="text-center text-gray-400 text-xs mt-8">
              By creating an account, you agree to our Terms & Service
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
