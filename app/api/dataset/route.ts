import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SampleData from '@/models/datasetModel';

export async function GET(request: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const q = searchParams.get('q') || '';
        const filter = searchParams.get('filter') || 'ALL';

        let query: Record<string, any> = {};

        // Tìm kiếm theo text hoặc ghi chú
        if (q) {
            query.$or = [
                { 'raw_inputs.text': { $regex: q, $options: 'i' } },
                { 'gold_annotation.explanation_vi': { $regex: q, $options: 'i' } },
                { 'eval1.note': { $regex: q, $options: 'i' } },
                { 'eval2.note': { $regex: q, $options: 'i' } }
            ];
        }

        // Bộ lọc theo trạng thái đánh giá (dựa trên label số: 0, 1, 2)
        if (filter !== 'ALL') {
            if (filter === '0' || filter === '1' || filter === '2') {
                const labelNum = parseInt(filter, 10);
                query.$or = [
                    { 'eval1.label': labelNum },
                    { 'eval2.label': labelNum }
                ];
            } else if (filter === 'PENDING') {
                query.$and = [
                    { 'eval1.label': null },
                    { 'eval2.label': null }
                ];
            } else if (filter === 'CONFLICT') {
                query.$expr = {
                    $and: [
                        { $ne: ['$eval1.label', null] },
                        { $ne: ['$eval2.label', null] },
                        { $ne: ['$eval1.label', '$eval2.label'] }
                    ]
                };
            } else if (filter === 'CONSENSUS') {
                query.$expr = {
                    $and: [
                        { $ne: ['$eval1.label', null] },
                        { $eq: ['$eval1.label', '$eval2.label'] }
                    ]
                };
            }
        }

        const items = await SampleData.find(query).sort({ createdAt: -1 }).lean();
        return NextResponse.json({ success: true, data: items }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        if (!body.modality_type || !body.gold_annotation) {
            return NextResponse.json(
                { success: false, error: 'Thiếu các trường bắt buộc: modality_type hoặc gold_annotation' },
                { status: 400 }
            );
        }

        const newItem = await SampleData.create(body);
        return NextResponse.json({ success: true, data: newItem }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}