'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Suspense } from 'react';

function BookRedirector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, setBookingDetails } = useCart();

  useEffect(() => {
    const inspiration = searchParams.get('inspiration');
    if (inspiration) {
      setBookingDetails(prev => ({ ...prev, photoUrl: inspiration }));
    }

    const timeout = setTimeout(() => {
      if (items.length > 0) {
        router.push('/book/date-time');
      } else {
        router.push('/services');
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, [items, router, searchParams, setBookingDetails]);

  return (
    <div className="p-20 flex flex-col items-center justify-center text-gray-400">
      <svg className="animate-spin h-8 w-8 text-primary mb-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      <p className="font-medium animate-pulse">Redirecting...</p>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-gray-400">Loading...</div>}>
      <BookRedirector />
    </Suspense>
  );
}
