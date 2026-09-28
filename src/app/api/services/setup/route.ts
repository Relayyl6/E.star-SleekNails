import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getAdminDb();
    const customService = {
      id: 'freestyle-custom-set',
      name: 'Freestyle / Custom Set',
      category: 'Others',
      price: 'Custom Quote',
      basePrice: 0,
      duration: 'TBD',
      description: "Not sure what you want? Upload your inspiration pictures and describe your dream set. We will review and provide a custom quotation!",
      image: 'https://placehold.co/600x600/F8D9CE/1A1414?text=Custom+Set',
      images: ['https://placehold.co/600x600/F8D9CE/1A1414?text=Custom+Set'],
      hasLengths: false,
      hasDesignTiers: false,
      hasExtras: true,
      extras: [
        { name: 'French Tip', price: 2000 },
        { name: 'Chrome', price: 3000 },
        { name: 'Marble Art', price: 3000 },
        { name: '3D Art', price: 3000 },
        { name: 'Hand-Drawn Art', price: 3000 },
        { name: 'Nail Charms', price: 3000 },
        { name: 'Cat Eye', price: 5000 },
        { name: 'Aura Design', price: 5000 },
        { name: 'Soak-Off', price: 2500 }
      ],
      isFreestyle: true
    };

    await db.collection('services').doc(customService.id).set(customService);
    return NextResponse.json({ success: true, message: 'Freestyle service added' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
