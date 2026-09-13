import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import DatasetItem from '@/models/dataset';

// GET: Lấy danh sách dataset (Hỗ trợ tìm kiếm q và filter nhãn)
export async function GET(request: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const q = searchParams.get('q') || '';
        const filter = searchParams.get('filter') || 'ALL';

        let query: Record<string, any> = {};

        // Xử lý tìm kiếm theo từ khóa (text hoặc mediaDescription)
        if (q) {
            query.$or = [
                { text: { $regex: q, $options: 'i' } },
                { mediaDescription: { $regex: q, $options: 'i' } }
            ];
        }

        // Xử lý lọc nâng cao theo trạng thái / nhãn (eval1 hoặc eval2)
        if (filter !== 'ALL') {
            if (filter === 'SAFE' || filter === 'OFFENSIVE' || filter === 'HATE') {
                query.$or = [
                    { 'eval.label': filter },
                    { 'eval2.label': filter }
                ];
            } else if (filter === 'PENDING') {
                query.$and = [
                    { 'eval1.label': null },
                    { 'eval2.label': null }
                ];
            } else if (filter === 'CONFLICT') {
                // Ví dụ: eval1 và eval2 có nhãn khác nhau và đều đã được gán nhãn
                query.$expr = {
                    $and: [
                        { $ne: ['$eval1.label', null] },
                        { $ne: ['$eval2.label', null] },
                        { $ne: ['$eval1.label', '$eval2.label'] }
                    ]
                };
            } else if (filter === 'CONSENSUS') {
                // Eval1 và eval2 giống nhau và không null
                query.$expr = {
                    $and: [
                        { $ne: ['$eval1.label', null] },
                        { $eq: ['$eval1.label', '$eval2.label'] }
                    ]
                };
            }
        }

        const items = await DatasetItem.find(query).sort({ createdAt: -1 }).lean();

        // Đảm bảo serialize đúng format nhờ schema transform
        return NextResponse.json({ success: true, data: items }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST: Tạo mới một Dataset Item
export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        if (!body.text && !body.media) {
            return NextResponse.json(
                { success: false, error: 'Dữ liệu phải có ít nhất nội dung text hoặc media' },
                { status: 400 }
            );
        }

        const newItem = await DatasetItem.create(body);

        return NextResponse.json({ success: true, data: newItem }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}