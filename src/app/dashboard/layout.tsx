import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAdminAuth } from '@/lib/firebase/admin';
import CustomerNavigation from './CustomerNavigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  if (!sessionCookie) {
    redirect('/login');
  }

  try {
    const auth = getAdminAuth();
    await auth.verifySessionCookie(sessionCookie, true);
    // If it succeeds, the user is authenticated. 
    // Admin check isn't strictly necessary here since normal users are allowed.
  } catch (error) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-[#FBF9F7] pt-24 pb-12 text-black">
      <div className="max-w-6xl mx-auto px-6 md:px-12 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm p-4 sticky top-32">
            <h2 className="text-xl font-bold text-[#1A1414] mb-4 px-4">My Account</h2>
            <CustomerNavigation />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
