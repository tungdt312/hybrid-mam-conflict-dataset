import {del, put} from '@vercel/blob';
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
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const url = searchParams.get('url');

        if (!url) {
            return NextResponse.json({ success: false, error: 'Thiếu tham số URL của file' }, { status: 400 });
        }

        // Gọi hàm del của @vercel/blob để xóa file trên đám mây
        await del(url);

        return NextResponse.json({ success: true, message: 'Xóa file thành công' }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}