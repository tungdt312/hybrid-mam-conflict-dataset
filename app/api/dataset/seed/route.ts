import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import DatasetItem from '@/models/dataset';

const INITIAL_SEED_DATA = [
    {
        text: "Hôm nay thời tiết đẹp quá, mọi người cùng đi dạo nhé!",
        eval1: { label: "SAFE", note: "Nội dung thân thiện, bình thường" },
        eval2: { label: "SAFE", note: "Không có vấn đề gì" }
    },
    {
        text: "Dịch vụ của cửa hàng này làm ăn quá tệ, không bao giờ quay lại nữa!",
        eval1: { label: "OFFENSIVE", note: "Ngôn từ bức xúc, mang tính công kích dịch vụ" },
        eval2: { label: "SAFE", note: "Chỉ là phàn nàn cá nhân, chưa đến mức toxic" }
    },
    {
        text: "Đồ lũ ngu ngốc, biến khỏi đây ngay lập tức!",
        eval1: { label: "HATE", note: "Xúc phạm trực tiếp, ngôn từ thù ghét" },
        eval2: { label: "HATE", note: "Vi phạm nguyên tắc cộng đồng rõ ràng" }
    }
];

export async function POST() {
    try {
        await dbConnect();

        // Kiểm tra xem đã có dữ liệu chưa, nếu muốn ghi đè hoặc thêm mới
        for (const item of INITIAL_SEED_DATA) {
            await DatasetItem.create(item);
        }

        return NextResponse.json({
            success: true,
            message: 'Đã nạp dữ liệu mẫu thành công vào MongoDB!'
        }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}