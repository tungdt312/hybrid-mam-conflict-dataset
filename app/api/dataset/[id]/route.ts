import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SampleData from '@/models/datasetModel';

interface RouteParams {
    params: {
        id: string;
    };
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        await dbConnect();
        const { id } = await params;

        const item = await SampleData.findById(id).lean();
        if (!item) {
            return NextResponse.json({ success: false, error: 'Không tìm thấy mục dữ liệu' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: item }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: RouteParams) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();

        const updatedItem = await SampleData.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        }).lean();

        if (!updatedItem) {
            return NextResponse.json({ success: false, error: 'Không tìm thấy mục dữ liệu để cập nhật' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updatedItem }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        await dbConnect();
        const { id } = await params;

        const deletedItem = await SampleData.findByIdAndDelete(id).lean();
        if (!deletedItem) {
            return NextResponse.json({ success: false, error: 'Không tìm thấy mục dữ liệu để xóa' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Đã xóa thành công' }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}