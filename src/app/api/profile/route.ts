import { NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    let decodedClaims;
    try {
      decodedClaims = await getAdminAuth().verifySessionCookie(sessionCookie, true);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");
    
    if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });
    
    // Only allow users to fetch their own profile, unless they are admin
    if (uid !== decodedClaims.uid && !decodedClaims.admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    const db = getAdminDb();
    const docSnap = await db.collection("users").doc(uid).get();
    
    if (docSnap.exists) {
      return NextResponse.json(docSnap.data());
    } else {
      return NextResponse.json({});
    }
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    let decodedClaims;
    try {
      decodedClaims = await getAdminAuth().verifySessionCookie(sessionCookie, true);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const { uid, phone, emailNotifs, smsNotifs } = await req.json();
    if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });
    
    if (uid !== decodedClaims.uid && !decodedClaims.admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    const db = getAdminDb();
    await db.collection("users").doc(uid).set({
      phone,
      emailNotifs,
      smsNotifs,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
