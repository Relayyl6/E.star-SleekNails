import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAdminAuth } from '@/lib/firebase/admin';
import VendorSidebar from './VendorSidebar';

const ADMIN_EMAILS = [
  'oseghaleleonard39@gmail.com', // Dev email
  'relayamin12@gmail.com',       // Admin email
  'owner@example.com'            // Brand owner's email
];

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  if (!sessionCookie) {
    redirect('/login');
  }

  try {
    const auth = getAdminAuth();
    const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
    
    // Security check: must be in the approved admin emails list
    if (!decodedToken.email || !ADMIN_EMAILS.includes(decodedToken.email.toLowerCase())) {
      redirect('/dashboard'); // Kick out normal users
    }
  } catch (error) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-gray-50 text-black flex-col md:flex-row">
      <VendorSidebar />
      {/* Main Content */}
      <main className="flex-1 min-h-0 overflow-y-auto bg-gray-50 w-full">
        {children}
      </main>
    </div>
  );
}
