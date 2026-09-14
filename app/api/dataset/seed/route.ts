import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SampleData from '@/models/datasetModel';

const INITIAL_SEED_DATA = [
    {
        modality_type: "TEXT",
        metadata: { language: "vi" },
        raw_inputs: {
            text: "Hôm nay thời tiết đẹp quá, mọi người cùng đi dạo nhé!",
            image_path: null,
            audio_path: null,
            video_path: null
        },
        agent_extracted_context: {
            vision_context: null,
            audio_context: null,
            video_context: null
        },
        gold_annotation: {
            decision: "PASS",
            label: 0,
            evidence_sources: [{ type: "text_content", value: "Thời tiết đẹp" }],
            reasoning_log: [
                { time_stamp: "2026-06-06T10:00:00Z", node: "classifier", input: "Hôm nay thời tiết đẹp...", output: "PASS", action: "evaluate" }
            ],
            explanation_vi: "Nội dung hoàn toàn bình thường, thân thiện."
        }
    },
    {
        modality_type: "TEXT",
        metadata: { language: "vi" },
        raw_inputs: {
            text: "Đồ lũ ngu ngốc, biến khỏi đây ngay lập tức!",
            image_path: null,
            audio_path: null,
            video_path: null
        },
        agent_extracted_context: {
            vision_context: null,
            audio_context: null,
            video_context: null
        },
        gold_annotation: {
            decision: "BLOCK",
            label: 2,
            evidence_sources: [{ type: "text_content", value: "Đồ lũ ngu ngốc" }],
            reasoning_log: [
                { time_stamp: "2026-06-06T10:05:00Z", node: "classifier", input: "Đồ lũ ngu ngốc...", output: "BLOCK", action: "evaluate" }
            ],
            explanation_vi: "Chứa từ ngữ xúc phạm trực tiếp."
        }
    }
];

export async function POST() {
    try {
        await dbConnect();

        // Xóa cũ (nếu muốn reset mỗi khi seed) hoặc dùng insertMany trực tiếp
        await SampleData.deleteMany({});
        const insertedItems = await SampleData.insertMany(INITIAL_SEED_DATA);

        return NextResponse.json({
            success: true,
            message: `Đã nạp thành công ${insertedItems.length} bản ghi mẫu sử dụng _id mặc định!`,
            data: insertedItems
        }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}