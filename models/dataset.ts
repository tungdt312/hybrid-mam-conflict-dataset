import mongoose from 'mongoose';

// 1. Sub-schema cho Evaluation (eval1, eval2)
const EvaluationSchema = new mongoose.Schema({
    label: {
        type: String,
        enum: ["SAFE", "OFFENSIVE", "HATE", null],
        default: null
    },
    note: {
        type: String,
        default: ""
    }
}, { _id: false }); // _id: false để không tự sinh _id cho các sub-document này

// 2. Sub-schema cho MediaData
const MediaDataSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["image", "video"],
        required: true
    },
    url: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    size: {
        type: Number
    },
    description: {
        type: String
    }
}, { _id: false });

// 3. Main Schema cho DatasetItem
const DatasetItemSchema = new mongoose.Schema({
    // Trường id riêng nếu muốn tự quản lý mã tùy chỉnh (như item_mam_101)
    customId: {
        type: String,
        index: true,
        sparse: true,
    },
    text: {
        type: String,
        required: [true, 'Vui lòng nhập nội dung text'],
    },
    mediaDescription: {
        type: String
    },
    media: {
        type: MediaDataSchema,
        default: null
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
    timestamps: true, // Tự động tạo createdAt và updatedAt
    versionKey: false // Tắt trường __v mặc định của Mongoose
});

// Tự động map _id hoặc customId thành id khi serialize sang JSON / Object
DatasetItemSchema.set('toJSON', {
    virtuals: true,
    transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret.customId || ret._id?.toString();
        delete ret.__v;
        return ret;
    }
});

DatasetItemSchema.set('toObject', {
    virtuals: true,
    transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret.customId || ret._id?.toString();
        delete ret.__v;
        return ret;
    }
});

// Tránh lỗi ghi đè Model khi Next.js reload ở chế độ dev
export default mongoose.models.DatasetItem || mongoose.model('DatasetItem', DatasetItemSchema);