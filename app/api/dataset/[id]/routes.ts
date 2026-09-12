import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import DatasetItem from '@/models/dataset';
import mongoose from 'mongoose';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// Hàm hỗ trợ tìm kiếm item theo _id (nếu hợp lệ ObjectId) hoặc customId
async function findItemById(id: string) {
    let query: any = { customId: id };
    if (mongoose.Types.ObjectId.isValid(id)) {
        query = { $or: [{ _id: id }, { customId: id }] };
    }
    return await DatasetItem.findOne(query);
}

// GET: Lấy chi tiết một item
export async function GET(request: Request, { params }: RouteParams) {
    try {
        await dbConnect();
        const { id } = await params;

        const item = await findItemById(id);
        if (!item) {
            return NextResponse.json({ success: false, error: 'Không tìm thấy bản ghi' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: item }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PUT / PATCH: Cập nhật thông tin item (Text, Media hoặc kết quả đánh giá eval1, eval2)
export async function PUT(request: Request, { params }: RouteParams) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();

        let query: any = { customId: id };
        if (mongoose.Types.ObjectId.isValid(id)) {
            query = { $or: [{ _id: id }, { customId: id }] };
        }

        const updatedItem = await DatasetItem.findOneAndUpdate(
            query,
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!updatedItem) {
            return NextResponse.json({ success: false, error: 'Không tìm thấy bản ghi để cập nhật' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updatedItem }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE: Xóa bản ghi
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        await dbConnect();
        const { id } = await params;

        let query: any = { customId: id };
        if (mongoose.Types.ObjectId.isValid(id)) {
            query = { $or: [{ _id: id }, { customId: id }] };
        }

        const deletedItem = await DatasetItem.findOneAndDelete(query);

        if (!deletedItem) {
            return NextResponse.json({ success: false, error: 'Không tìm thấy bản ghi để xóa' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Xóa thành công bản ghi' }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}