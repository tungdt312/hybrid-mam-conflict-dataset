import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import DatasetItem from '@/models/dataset';
import mongoose from 'mongoose';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET: Lấy chi tiết một item theo _id
export async function GET(request: Request, { params }: RouteParams) {
    try {
        await dbConnect();
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, error: 'ID không hợp lệ' }, { status: 400 });
        }

        const item = await DatasetItem.findById(id);
        if (!item) {
            return NextResponse.json({ success: false, error: 'Không tìm thấy bản ghi' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: item }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PUT / PATCH: Cập nhật thông tin item theo _id
export async function PUT(request: Request, { params }: RouteParams) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, error: 'ID không hợp lệ' }, { status: 400 });
        }

        const updatedItem = await DatasetItem.findByIdAndUpdate(
            id,
            { $set: body },
            { returnDocument: 'after', runValidators: true }
        );

        if (!updatedItem) {
            return NextResponse.json({ success: false, error: 'Không tìm thấy bản ghi để cập nhật' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updatedItem }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE: Xóa bản ghi theo _id
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        await dbConnect();
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, error: 'ID không hợp lệ' }, { status: 400 });
        }

        const deletedItem = await DatasetItem.findByIdAndDelete(id);

        if (!deletedItem) {
            return NextResponse.json({ success: false, error: 'Không tìm thấy bản ghi để xóa' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Xóa thành công bản ghi' }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}