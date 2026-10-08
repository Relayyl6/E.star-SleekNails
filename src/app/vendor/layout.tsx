import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAdminAuth } from '@/lib/firebase/admin';
import VendorSidebar from './VendorSidebar';

const DEFAULT_ADMINS = ['oseghaleleonard39@gmail.com', 'peteratambaesther@gmail.com'];
const getAdminEmails = () => {
  if (process.env.ADMIN_EMAILS) {
    return process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase());
  }
  return DEFAULT_ADMINS;
};

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  if (!sessionCookie) {
    redirect('/login');
  }

  let isAuthorized = false;
  try {
    const auth = getAdminAuth();
    const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
    
    if (decodedToken.email && getAdminEmails().includes(decodedToken.email.toLowerCase())) {
      isAuthorized = true;
    }
  } catch (error) {
    // Invalid cookie
    redirect('/login');
  }

  if (!isAuthorized) {
    redirect('/dashboard');
  }

  return (
    <div className="flex h-screen bg-gray-50 text-black flex-col md:flex-row">
      <VendorSidebar />
      <main className="flex-1 min-h-0 overflow-y-auto bg-gray-50 w-full">
        {children}
      </main>
    </div>
  );
}
