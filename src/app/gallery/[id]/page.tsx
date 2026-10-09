import { getAdminDb } from '@/lib/firebase/admin';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FiArrowLeft, FiCalendar } from 'react-icons/fi';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const db = getAdminDb();
  const snap = await db.collection('gallery_images').doc(id).get();
  
  if (!snap.exists) return { title: 'Not Found' };
  
  const data = snap.data();
  return {
    title: data?.title ? `${data.title} | SleekNails Gallery` : 'Gallery Image | SleekNails',
    description: data?.description || 'Check out this beautiful nail set from SleekNails.',
    openGraph: {
      images: [data?.url || '']
    }
  };
}

export default async function GalleryImagePage({ params }: Props) {
  const { id } = await params;
  const db = getAdminDb();
  
  const snap = await db.collection('gallery_images').doc(id).get();
  if (!snap.exists) {
    notFound();
  }
  
  const image = { id: snap.id, ...snap.data() } as any;

  // determine booking link
  const bookLink = (image.serviceId ? `/services/${image.serviceId}` : '/book') + `?inspiration=${encodeURIComponent(image.url)}`;

  return (
    <div className="min-h-screen bg-[#1A1414] text-white pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <Link 
          href="/gallery"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
        >
          <FiArrowLeft /> Back to Gallery
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-start">
          
          {/* Left: Image */}
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl bg-white/5">
            <Image
              src={image.url}
              alt={image.title || 'Nail Art'}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Right: Details */}
          <div className="flex flex-col justify-center h-full py-8">
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
                {image.title || 'Signature Look'}
              </h1>
              <div className="h-px w-16 bg-primary mb-6"></div>
              
              {image.description ? (
                <p className="text-white/80 font-light text-lg leading-relaxed whitespace-pre-wrap">
                  {image.description}
                </p>
              ) : (
                <p className="text-white/50 font-light italic">
                  A beautiful set crafted with precision and care.
                </p>
              )}
            </div>

            <div className="mt-auto pt-8 border-t border-white/10">
              <Link 
                href={bookLink}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl font-bold transition-colors shadow-lg shadow-primary/20 text-lg"
              >
                <FiCalendar className="text-xl" />
                Book This Look
              </Link>
              <p className="text-white/40 text-sm mt-4 text-center md:text-left">
                {image.serviceId 
                  ? "This will take you to the specific service booking page." 
                  : "This will take you to our booking page."}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
