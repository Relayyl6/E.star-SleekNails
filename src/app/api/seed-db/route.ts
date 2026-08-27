import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

export async function GET() {
  try {
    const db = getAdminDb();
    const servicesRef = db.collection('services');

    const servicesList = [
      {
        id: "signature-full-set",
        name: "Signature Full Set",
        category: "Full Sets",
        duration: "2h",
        price: "₦20,000",
        description: "Acrylics, BIAB & hard gel extensions with either French tips, simple accents, swirls, simple ombré. The perfect balance of elegance and detail.",
        images: ["https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=400&q=80"]
      },
      {
        id: "elevated-full-set",
        name: "Elevated Full Set",
        category: "Full Sets",
        duration: "2h",
        price: "₦25,000",
        description: "Acrylics, BIAB & hard gel extensions with up to two design elements or 3d art. For those who want their nails to stand out just a bit more.",
        images: ["https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=400&q=80"]
      },
      {
        id: "statement-full-set",
        name: "Statement Full Set",
        category: "Full Sets",
        duration: "2h 30min",
        price: "₦35,000",
        description: "Acrylic, BIAB or hard gel extensions with intricate nail art, detailed hand painted designs and multiple layered nail design elements.",
        images: ["https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=400&q=80"]
      },
      {
        id: "gel-manicure",
        name: "Gel Polish Manicure",
        category: "Full Sets",
        duration: "1h 15min",
        price: "₦12,000",
        description: "Detailed cuticle work and shaping, finished with your choice of solid gel color.",
        images: ["https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=400&q=80"]
      },
      {
        id: "in-fill",
        name: "In-Fill / Maintenance",
        category: "In-Fill",
        duration: "1h 30min",
        price: "₦15,000",
        description: "Rebalancing and filling growth on existing enhancements. Includes one gel color.",
        images: ["https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80"]
      },
      {
        id: "nail-art-addons",
        name: "Nail Art / Add-ons",
        category: "Nail Art",
        duration: "15min+",
        price: "₦2,000",
        description: "Extra length, intricate character art, chrome powders, or rhinestones added to any service.",
        images: ["https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=400&q=80"]
      },
      {
        id: "biab-overlay",
        name: "BIAB Natural Overlay",
        category: "Full Sets",
        duration: "1h 30min",
        price: "₦18,000",
        description: "Builder in a bottle applied over natural nails to add strength and promote growth.",
        images: ["https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=400&q=80"]
      },
      {
        id: "classic-pedicure",
        name: "Classic Pedicure",
        category: "Pedicure",
        duration: "1h",
        price: "₦15,000",
        description: "Relaxing foot soak, cuticle care, callus removal, scrub, massage and polish.",
        images: ["https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=400&q=80"]
      },
      {
        id: "jelly-pedicure",
        name: "Luxury Jelly Pedicure",
        category: "Pedicure",
        duration: "1h 30min",
        price: "₦25,000",
        description: "Premium pedicure featuring a warm jelly soak, deep exfoliation, and hot towel wrap.",
        images: ["https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=400&q=80"]
      },
      {
        id: "acrylic-toes",
        name: "Acrylic Toes",
        category: "Pedicure",
        duration: "1h",
        price: "₦12,000",
        description: "Acrylic overlay applied to all toes for a perfect, long-lasting square shape.",
        images: ["https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80"]
      },
      {
        id: "sculpted-extensions",
        name: "Sculpted Extensions",
        category: "Full Sets",
        duration: "2h 30min",
        price: "₦30,000",
        description: "Extensions created using forms rather than tips for a more natural curve and structure.",
        images: ["https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=400&q=80"]
      },
      {
        id: "soak-off",
        name: "Professional Soak Off",
        category: "Removal",
        duration: "45min",
        price: "₦5,000",
        description: "Safe and healthy removal of previous enhancements to preserve natural nail integrity.",
        images: ["https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=400&q=80"]
      },
      {
        id: "french-tips",
        name: "Classic French Tips",
        category: "Nail Art",
        duration: "1h 45min",
        price: "₦22,000",
        description: "Timeless pink and white acrylic or gel application for a clean, classic look.",
        images: ["https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=400&q=80"]
      },
      {
        id: "repair",
        name: "Nail Repair",
        category: "Add-ons",
        duration: "15min",
        price: "₦2,500",
        description: "Fixing a broken, chipped, or cracked nail enhancement.",
        images: ["https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=400&q=80"]
      }
    ];

    for (const service of servicesList) {
      await servicesRef.doc(service.id).set(service);
    }

    return NextResponse.json({ success: true, message: 'Seeded 14 services successfully!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
