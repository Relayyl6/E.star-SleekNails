import { NextResponse } from 'next/server';
import { getAdminStorage } from '@/lib/firebase/admin';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Forward the file to a free anonymous image host (catbox.moe) 
    // since Firebase Storage requires a paid plan
    const catboxData = new FormData();
    catboxData.append('reqtype', 'fileupload');
    catboxData.append('fileToUpload', file);

    const catboxRes = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: catboxData
    });

    if (!catboxRes.ok) {
      throw new Error(`Image host error: ${catboxRes.statusText}`);
    }

    const url = await catboxRes.text();

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload' }, { status: 500 });
  }
}
