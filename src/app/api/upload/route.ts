import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/uploads directory
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const savedName = `${uniqueSuffix}-${filename}`;
    
    const path = join(process.cwd(), 'public', 'uploads', savedName);
    
    await writeFile(path, buffer);

    // Return the local URL
    return NextResponse.json({ url: `/uploads/${savedName}` });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload' }, { status: 500 });
  }
}

