'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const DEFAULT_POLICY = `1. Deposit & Payment
- A non-refundable deposit of ₦5,000 is required to secure an appointment. This amount goes directly towards your service.
- Appointments are only confirmed upon payment of the required deposit.
- By making payment into the provided account, you acknowledge and agree to the booking policies stated above.

2. Reschedule & Cancellation
- To reschedule or cancel your appointment without losing your deposit, kindly provide at least 24 hours’ notice. Deposits may only be transferred once.

3. Arrival
- A 20-minute grace period is allowed for lateness. Arrivals beyond this period will attract a ₦3,000 late fee.
- Clients arriving more than 30 minutes late may have their appointment cancelled and their deposit forfeited.

4. Prep & Add-ons
- Please arrive with clean, natural nails free of any product unless otherwise discussed.
- If you require a soak-off of an existing set, kindly inform us.
- Refills are only available for sets originally done by E.star Sleeknails.

5. Health & Safety
- Services cannot be performed on severely damaged or wounded nails.

6. Guests
- Due to limited seating, only one accompanying guest is permitted.
- Children and pets are not permitted within the workspace.`;

const getIconForTitle = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes('deposit') || t.includes('payment')) return (
    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>
  );
  if (t.includes('reschedule') || t.includes('cancellation') || t.includes('cancel')) return (
    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
  );
  if (t.includes('arrival') || t.includes('late') || t.includes('time')) return (
    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  );
  if (t.includes('prep') || t.includes('add-on') || t.includes('nail')) return (
    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" /></svg>
  );
  if (t.includes('health') || t.includes('safety')) return (
    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
  );
  if (t.includes('guest') || t.includes('children')) return (
    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
  );
  return (
    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
  );
};

const parsePolicies = (text: string) => {
  if (!text) return [];
  return text.split('\n\n').filter(b => b.trim()).map((block, idx) => {
    const lines = block.split('\n').map(l => l.trim()).filter(l => l);
    const title = (lines[0] || 'Policy').replace(/^\d+\.\s*/, '');
    const items = lines.slice(1).map(item => item.replace(/^- /, ''));
    return { id: idx + 1, title, items, icon: getIconForTitle(title) };
  });
};

export default function PolicySection() {
  const [policyText, setPolicyText] = useState(DEFAULT_POLICY);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => { if (data.policyText) setPolicyText(data.policyText); })
      .catch(() => {});
  }, []);

  const policies = parsePolicies(policyText);

  return (
    <section className="relative py-24 px-4 overflow-hidden bg-[#1A1414]">
      {/* Blurred nail background — same treatment as Contact page */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1920&q=80"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover opacity-25 blur-sm scale-105"
        />
        {/* Dark top fade from gallery */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1414] via-[#1A1414]/60 to-[#1A1414]/90" />
        {/* Extra depth at very bottom so it bleeds into footer seamlessly */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#1A1414] to-transparent" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-primary text-xs font-semibold uppercase tracking-[0.2em] mb-3">Studio Guidelines</p>
          <h2 className="font-serif text-3xl md:text-4xl text-white mb-3">Policies & Terms</h2>
          <p className="text-white/50 max-w-md mx-auto text-sm">
            Please review these guidelines before booking your appointment.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {policies.map(policy => (
            <div
              key={policy.id}
              className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
                  {policy.icon}
                </div>
                <h3 className="font-semibold text-white text-sm">{policy.title}</h3>
              </div>
              <ul className="space-y-1.5">
                {policy.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-white/55 leading-relaxed">
                    <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/policy" className="text-sm text-primary/80 font-medium hover:text-primary transition-colors">
            View full policy page →
          </Link>
        </div>
      </div>
    </section>
  );
}
