import { del, list, put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limitParam = searchParams.get('limit');
        const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 100, 1), 1000) : 100;
        const cursor = searchParams.get('cursor') || undefined;
        const prefix = searchParams.get('prefix') || undefined;

        const blobResult = await list({
            limit,
            cursor,
            prefix,
        });

        return NextResponse.json({ success: true, data: blobResult }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const contentType = request.headers.get('content-type') || '';

        // Tùy chọn 1: Tải lên từ link URL bên ngoài lên Vercel Blob
        if (contentType.includes('application/json')) {
            const body = await request.json();
            const { url, filename: customFilename } = body;

            if (!url || typeof url !== 'string') {
                return NextResponse.json({ success: false, error: 'Thiếu liên kết URL' }, { status: 400 });
            }

            // Tải tệp từ URL nguồn
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                },
            });

            if (!response.ok) {
                return NextResponse.json({
                    success: false,
                    error: `Không thể tải tệp từ liên kết (Mã HTTP: ${response.status} ${response.statusText})`
                }, { status: 400 });
            }

            const arrayBuffer = await response.arrayBuffer();
            let derivedName = 'media-file';
            try {
                const parsedUrl = new URL(url);
                const rawName = parsedUrl.pathname.split('/').filter(Boolean).pop();
                if (rawName) derivedName = decodeURIComponent(rawName);
            } catch {}

            const finalFilename = customFilename?.trim() || derivedName;

            const blob = await put(finalFilename, Buffer.from(arrayBuffer), {
                access: 'public',
                contentType: response.headers.get('content-type') || undefined,
            });

            return NextResponse.json({ success: true, data: blob }, { status: 200 });
        }

        // Tùy chọn 2: Đẩy tệp trực tiếp từ client lên Vercel Blob storage
        const { searchParams } = new URL(request.url);
        const filename = searchParams.get('filename') || 'file';

        const blob = await put(filename, request.body as any, {
            access: 'public',
        });

        return NextResponse.json({ success: true, data: blob }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const url = searchParams.get('url');

        if (!url) {
            return NextResponse.json({ success: false, error: 'Thiếu tham số URL của file' }, { status: 400 });
        }

        // Nếu không phải URL từ Vercel Blob (ví dụ liên kết ngoài), an toàn bỏ qua
        if (!url.includes('blob.vercel-storage.com')) {
            return NextResponse.json({ success: true, message: 'Bỏ qua do không phải URL của Vercel Blob' }, { status: 200 });
        }

        // Gọi hàm del của @vercel/blob để xóa file trên đám mây
        await del(url);

        return NextResponse.json({ success: true, message: 'Xóa file thành công' }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}