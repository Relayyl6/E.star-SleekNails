import { NextResponse } from "next/server"; export async function POST() { return NextResponse.json({ error: "test" }, { status: 500 }); }
