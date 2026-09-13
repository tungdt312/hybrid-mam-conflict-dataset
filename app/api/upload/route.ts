import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const filename = searchParams.get('filename') || 'file';

        // Đẩy tệp trực tiếp lên Vercel Blob storage
        const blob = await put(filename, request.body as any, {
            access: 'public',
        });

        return NextResponse.json({ success: true, data: blob }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}