export default function PolicyPage() {
  const policies = [
    {
      id: 1,
      title: "Deposit & Payment",
      items: [
        "A non-refundable ₦10,000 deposit is required to secure your appointment.",
        "Payment must be completed within 30 mins or your slot will be forfeited."
      ],
      icon: <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>
    },
    {
      id: 2,
      title: "Reschedule & Cancellation",
      items: [
        "Appointments may be rescheduled with at least 12 hours notice.",
        "Late cancellations, no-shows or reschedules made within the 12 hour period will result in deposit forfeiture."
      ],
      icon: <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
    },
    {
      id: 3,
      title: "Arrival",
      items: [
        "Please arrive on time.",
        "A 15 min grace period applies after which a ₦5,000 lateness fee applies.",
        "Arrivals after 20 mins may be rescheduled or cancelled."
      ],
      icon: <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
    },
    {
      id: 4,
      title: "Prep & Add-ons",
      items: [
        "Nails must be bare & polish-free (unless soak-off or removal is booked).",
        "Additional services without prior booking may not be accommodated during your appointment."
      ],
      icon: <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>
    },
    {
      id: 5,
      title: "Health & Safety",
      items: [
        "Services cannot be done on nails with infections, wounds, or contagious skin conditions."
      ],
      icon: <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
    },
    {
      id: 6,
      title: "Guests",
      items: [
        "Be polite and respectful; disruptive behavior may result in service refusal.",
        "No children allowed.",
        "1 extra guest is permitted per appointment."
      ],
      icon: <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
    }
  ];

  return (
    <div className="min-h-screen bg-[#FBF9F7] pt-32 pb-24 relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#F8D9CE]/30 to-transparent z-0"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <p className="text-primary font-bold tracking-[0.2em] uppercase text-xs mb-4">Read Before Booking</p>
          <h1 className="font-serif text-4xl md:text-6xl text-[#1A1414] mb-4">Policy & Terms</h1>
          <p className="text-gray-500 text-lg">E.star SleekNails Booking Policies 💅✨</p>
        </div>

        {/* Policy Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20 max-w-6xl mx-auto">
          {policies.map((policy, idx) => (
            <div 
              key={policy.id} 
              className="bg-white rounded-xl p-6 shadow-sm border border-black/5 hover:shadow-xl hover:border-primary/20 transition-all duration-300 animate-in fade-in slide-in-from-bottom-8"
              style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#F8D9CE]/30 flex items-center justify-center text-xl shadow-inner">
                  {policy.icon}
                </div>
                <h2 className="font-serif text-xl text-[#1A1414]">
                  <span className="text-primary/50 text-sm font-sans font-bold mr-2">{policy.id}.</span>
                  {policy.title}
                </h2>
              </div>
              <ul className="space-y-3">
                {policy.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-600 text-[15px] leading-relaxed">
                    <span className="text-primary mt-1.5 opacity-60 flex-shrink-0">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8"></circle></svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Payment / Agreement Box */}
        <div className="text-center pt-10 border-t border-black/10 mt-12 animate-in fade-in slide-in-from-bottom-8 delay-700 fill-mode-both max-w-2xl mx-auto">
          <p className="font-medium text-lg mb-6 text-[#1A1414]">By making your deposit you agree to our policies.</p>
          <p className="text-sm text-gray-600 mb-3">Please make your deposit to:</p>
          
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-black/5 inline-block mx-auto w-full max-w-sm">
            <p className="font-serif text-2xl mb-1 text-[#1A1414]">E.star SleekNails</p>
            <p className="text-primary mb-4 text-sm font-medium">GTBank</p>
            <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-100 group cursor-pointer hover:bg-gray-100 transition-colors">
              <span className="font-mono text-2xl tracking-[0.2em] text-[#1A1414]">0123456789</span>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-[#1A1414]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            </div>
          </div>

          <p className="mt-8 text-sm text-gray-600">
            Send proof of payment to WhatsApp <br/>
            <a href="https://wa.me/2347049022919" target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium mt-1 inline-block">(+234) 704 902 2919</a>
          </p>
        </div>

      </div>
    </div>
  );
}
