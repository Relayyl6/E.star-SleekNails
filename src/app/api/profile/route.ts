import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");
    
    if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });
    
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
    const { uid, phone, emailNotifs, smsNotifs } = await req.json();
    if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });
    
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
