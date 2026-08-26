import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex bg-surface">
      {/* Left Pane - Visuals (Hidden on small screens) */}
      <div className="hidden lg:flex w-1/2 relative bg-[#1A1414] items-center justify-center overflow-hidden">
        {/* Looping background video - Using a beautiful abstract or nail art placeholder */}
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
          {/* Fallback image if video doesn't load immediately */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-[#1A1414] mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-primary/20 mix-blend-overlay"></div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 px-16 w-full max-w-2xl">
          <Link href="/" className="inline-block mb-16 hover:opacity-80 transition-opacity">
            <Image src="/logo.png" alt="E.star" width={120} height={40} className="object-contain brightness-0 invert opacity-90" />
          </Link>
          
          <h1 className="text-6xl font-serif text-white leading-[1.1] tracking-tight mb-8 drop-shadow-lg">
            Get <br />
            Everything <br />
            <span className="italic text-primary/90">You Want</span>
          </h1>
          
          <p className="text-white/70 text-lg max-w-sm font-light">
            You can get everything you want if you work hard, trust the process, and stick to the plan.
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

          <div className="text-center lg:text-left mb-10">
            <h2 className="text-4xl font-serif text-[#1A1414] mb-3">Welcome Back</h2>
            <p className="text-gray-500">Enter your email and password to access your account</p>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="email">Email</label>
              <input 
                id="email"
                type="email" 
                placeholder="Enter your email" 
                className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="password">Password</label>
              <div className="relative">
                <input 
                  id="password"
                  type="password" 
                  placeholder="Enter your password" 
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all pr-12"
                />
                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/50 accent-primary" />
                <span className="text-gray-600 group-hover:text-gray-900 transition-colors">Remember me</span>
              </label>
              <a href="#" className="font-medium text-primary hover:underline">Forgot Password</a>
            </div>

            <div className="pt-2">
              <button className="w-full bg-[#1A1414] text-white py-4 rounded-xl font-bold hover:bg-black transition-colors shadow-lg shadow-black/10">
                Sign In
              </button>
            </div>
            
            <div className="relative flex items-center justify-center py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <span className="relative bg-white px-4 text-xs text-gray-400 uppercase tracking-wider">or continue with</span>
            </div>

            <button className="w-full bg-white border border-gray-200 text-gray-700 py-3.5 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Sign in with Google
            </button>
          </form>

          <p className="text-center text-gray-500 mt-10">
            Don't have an account? <Link href="/register" className="text-[#1A1414] font-semibold hover:underline">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
