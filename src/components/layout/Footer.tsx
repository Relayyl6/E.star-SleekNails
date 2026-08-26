import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#1A1414] text-white py-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-serif text-xl mb-4 text-surface">E.star SleekNails</h3>
          <p className="text-white/70 text-sm max-w-xs leading-relaxed">
            Specializing in acrylic, hardgel, and BIAB services, creating clean, detailed, and long-lasting nail sets.
          </p>
        </div>
        
        <div>
          <h4 className="font-medium mb-4 text-surface">Links</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link href="/policy" className="hover:text-primary transition-colors">Policy & Terms</Link></li>
            <li><Link href="/services" className="hover:text-primary transition-colors">Services</Link></li>
            <li><Link href="/book" className="hover:text-primary transition-colors">Book Appointment</Link></li>
            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium mb-4 text-surface">Hours</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li className="flex justify-between"><span className="w-24">Mon - Fri:</span> <span>7:00 AM - 6:00 PM</span></li>
            <li className="flex justify-between"><span className="w-24">Saturday:</span> <span>9:00 AM - 5:00 PM</span></li>
            <li className="flex justify-between"><span className="w-24">Sunday:</span> <span>Closed</span></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/10 text-center text-xs text-white/50 flex flex-col md:flex-row justify-between items-center gap-4">
        <p>© {new Date().getFullYear()} E.star SleekNails. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-white transition-colors">Instagram</a>
          <a href="#" className="hover:text-white transition-colors">TikTok</a>
        </div>
      </div>
    </footer>
  );
}
