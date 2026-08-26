'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const videos = [
  "/videos/1.mp4",
  "/videos/2.mp4",
  "/videos/3.mp4"
];

const quotes = [
  {
    title: "Get Everything You Want",
    subtitle: "You can get everything you want if you work hard, trust the process, and stick to the plan."
  },
  {
    title: "Elevate Your Aesthetic",
    subtitle: "Discover the perfect balance of elegance and detail with our signature tailored services."
  },
  {
    title: "Flawless & Enduring",
    subtitle: "Experience nail artistry that lasts, crafted specifically for your unique style."
  }
];

export default function AuthScreen({ initialMode = 'login' }: { initialMode?: 'login' | 'register' }) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setActiveVideoIndex((prev) => (prev + 1) % videos.length);
        setIsFading(false);
      }, 500);
    }, 8000); // 8 seconds per quote
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white flex overflow-hidden">
      {/* Left Pane - Visuals (Floating Card Style) */}
      <div className="hidden lg:flex w-1/2 p-4 lg:p-6 h-screen">
        <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden bg-[#1A1414] shadow-2xl flex flex-col justify-between p-12">
          {/* Video Backgrounds (Stacked for robust seamless fading) */}
          {videos.map((src, index) => (
            <video 
              key={src}
              autoPlay 
              loop 
              muted 
              playsInline
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 pointer-events-none ${activeVideoIndex === index && !isFading ? 'opacity-60' : 'opacity-0'}`}
            >
              <source src={src} type="video/mp4" />
            </video>
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/80 pointer-events-none"></div>
          
          {/* Logo & Top Content */}
          <div className="relative z-10 flex items-center gap-6">
             <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:px-6 shadow-lg border border-white/20 w-fit">
               <Image 
                 src="/logo.png" 
                 alt="E.star SleekNails" 
                 width={110} 
                 height={45}
                 className="brightness-0 invert object-contain"
                 onError={(e) => {
                   (e.target as HTMLImageElement).style.display = 'none';
                 }}
               />
             </div>
             <div className="h-px bg-white/30 w-12 md:w-20"></div>
             <span className="text-white/80 text-xs font-bold tracking-[0.2em] uppercase">A Wise Quote</span>
          </div>

          {/* Bottom Quote (Changing) */}
          <div className={`relative z-10 transition-opacity duration-500 max-w-md ${isFading ? 'opacity-0' : 'opacity-100'}`}>
            <h2 className="text-5xl md:text-6xl font-serif text-white mb-6 leading-[1.1]">
              {quotes[activeVideoIndex].title.split(' ').map((word, i, arr) => (
                <span key={i} className={i === arr.length - 1 ? "italic text-[#E8572A]" : ""}>
                  {word}{" "}
                </span>
              ))}
            </h2>
            <p className="text-white/80 text-lg leading-relaxed font-light">
              {quotes[activeVideoIndex].subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="w-full lg:w-1/2 flex flex-col p-6 lg:p-12 h-screen overflow-hidden relative">
        {/* Top Bar: Home Button & Toggle */}
        <div className="flex items-center justify-between w-full mb-8">
          <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-[#1A1414] transition-colors text-sm font-medium">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Home
          </Link>

          <div className="bg-gray-50 border border-gray-100 p-1 flex rounded-full w-fit relative shadow-sm">
             <div 
               className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-sm transition-transform duration-300 ease-out ${
                 isLogin ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'
               }`}
             ></div>
             <button 
               onClick={() => setIsLogin(false)}
               className={`relative z-10 px-6 py-2 text-sm font-semibold transition-colors duration-300 ${!isLogin ? 'text-[#1A1414]' : 'text-gray-500 hover:text-gray-900'}`}
             >
               Sign up
             </button>
             <button 
               onClick={() => setIsLogin(true)}
               className={`relative z-10 px-6 py-2 text-sm font-semibold transition-colors duration-300 ${isLogin ? 'text-[#1A1414]' : 'text-gray-500 hover:text-gray-900'}`}
             >
               Sign in
             </button>
          </div>
        </div>

        <div className="max-w-md w-full mx-auto flex-1 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-serif text-[#1A1414] mb-2">
              {isLogin ? 'Welcome Back' : 'Create an Account'}
            </h1>
            <p className="text-gray-500 text-sm">
              {isLogin ? 'Enter your email and password to access your account' : 'Join us to book your premium nail appointments'}
            </p>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                  placeholder="Enter your full name"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                  placeholder="Enter your password"
                />
                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <Link href="#" className="text-sm text-gray-600 hover:text-primary font-medium">
                  Forgot Password?
                </Link>
              </div>
            )}

            <button 
              type="submit" 
              className="w-full bg-[#1A1414] text-white rounded-xl px-4 py-3.5 font-bold hover:bg-black transition-all mt-4 shadow-lg shadow-black/10"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
            
            <div className="relative flex items-center py-3">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase tracking-wider">Or</span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>
            
            <button 
              type="button" 
              className="w-full bg-white border border-gray-200 text-[#1A1414] rounded-xl px-4 py-3.5 font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-3 shadow-sm"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-[#1A1414] font-bold hover:underline">
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
