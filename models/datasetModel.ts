import mongoose from 'mongoose';

const EvaluationSchema = new mongoose.Schema({
    label: {
        type: Number, // Đổi thành Number
        enum: [0, 1, 2, null], // Các giá trị số tương ứng
        default: null
    },
    note: {
        type: String,
        default: ""
    }
}, { _id: false });
// 1. Sub-schemas cho Agent Extracted Context
const VisionContextSchema = new mongoose.Schema({
    ocr_text: {
        type: String,
        required: true
    },
    image_caption: {
        type: String,
        required: true
    },
    detected_objects: [{
        type: String
    }]
}, { _id: false });

const AudioContextSchema = new mongoose.Schema({
    duration_seconds: {
        type: Number,
        required: true
    },
    transcript: {
        type: String,
        required: true
    }
}, { _id: false });

const VideoContextSchema = new mongoose.Schema({
    duration_seconds: {
        type: Number,
        required: true
    },
    video_caption: {
        type: String,
        required: true
    }
}, { _id: false });

// 2. Sub-schemas cho Gold Annotation
// Sub-schema cho phần locator tùy theo modality
const LocatorSchema = new mongoose.Schema({
    char_start: {
        type: String,
        default: null
    },
    char_end: {
        type: String,
        default: null
    },
    box_2d: {
        type: [Number], // Mảng chứa các số nguyên/thực đại diện cho tọa độ [ymin, xmin, ymax, xmax] hoặc tương đương
        default: null
    },
    start_second: {
        type: Number,
        default: null
    },
    end_second: {
        type: Number,
        default: null
    }
}, { _id: false });

// Schema chính cho EvidenceSource
const EvidenceSourceSchema = new mongoose.Schema({
    modality: {
        type: String,
        required: true,
        // Có thể thêm enum nếu cần kiểm soát chặt chẽ: ['TEXT', 'IMAGE', 'AUDIO', 'VIDEO', 'OCR', 'MIX']
    },
    locator_type: {
        type: String,
        required: true
    },
    locator: {
        type: LocatorSchema,
        required: true
    },
    supports_label: {
        type: Number,
        required: true,
        // Có thể thêm enum kiểm duyệt: ['SAFE', 'OFFENSIVE', 'HATE']
    }
}, { _id: false });

const ReasoningLogItemSchema = new mongoose.Schema({
    time_stamp: {
        type: String,
        required: true
    },
    node: {
        type: String,
        required: true
    },
    input: {
        type: String,
        required: true
    },
    output: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true
    }
}, { _id: false });

const GoldAnnotationSchema = new mongoose.Schema({
    decision: {
        type: String,
        enum: ['PASS', 'REVIEW', 'BLOCK'],
        required: true
    },
    label: {
        type: Number,
        enum: [0, 1, 2, null],
        default: null
    },
    evidence_sources: [EvidenceSourceSchema],
    reasoning_log: [ReasoningLogItemSchema],
    explanation_vi: {
        type: String,
        required: true
    }
}, { _id: false });

// 3. Main Schema cho SampleData
const SampleDataSchema = new mongoose.Schema({
    modality_type: {
        type: String,
        enum: ['TEXT', 'IMAGE', 'AUDIO', 'VIDEO', 'MIX'],
        required: true
    },
    metadata: {
        language: {
            type: String,
            enum: ['vi', 'en'],
            required: true
        }
    },
    raw_inputs: {
        text: { type: String, default: null },
        image_path: { type: String, default: null },
        audio_path: { type: String, default: null },
        video_path: { type: String, default: null }
    },
    agent_extracted_context: {
        vision_context: {
            type: VisionContextSchema,
            default: null
        },
        audio_context: {
            type: AudioContextSchema,
            default: null
        },
        video_context: {
            type: VideoContextSchema,
            default: null
        }
    },
    gold_annotation: {
        type: GoldAnnotationSchema,
        required: true
    },
    eval1: {
        type: EvaluationSchema,
        default: () => ({ label: null, note: "" })
    },
    eval2: {
        type: EvaluationSchema,
        default: () => ({ label: null, note: "" })
    }
}, {
    timestamps: true,
    versionKey: false
});

// Map trực tiếp _id thành id khi serialize sang JSON / Object (giống mẫu dataset_2.ts)[cite: 2]
SampleDataSchema.set('toJSON', {
    virtuals: true,
    transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id?.toString();
        delete ret.__v;
        return ret;
    }
});

SampleDataSchema.set('toObject', {
    virtuals: true,
    transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id?.toString();
        delete ret.__v;
        return ret;
    }
});

export default mongoose.models.SampleData || mongoose.model('SampleData', SampleDataSchema);