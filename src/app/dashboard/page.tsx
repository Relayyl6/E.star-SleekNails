'use client';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    // Also clear the server-side cookie
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Customer Dashboard</h1>
      <p className="mt-4 text-gray-600 mb-8">
        Welcome to your dashboard! This is the scaffolded page for route: <code>/dashboard</code>
      </p>
      <button 
        onClick={handleSignOut}
        className="bg-red-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-600 transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
}
