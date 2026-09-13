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
}, { _id: false });

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

// 3. Main Schema cho DatasetItem (Chỉ sử dụng _id mặc định của MongoDB)
const DatasetItemSchema = new mongoose.Schema({
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
    timestamps: true,
    versionKey: false
});

// Map trực tiếp _id thành id khi serialize sang JSON / Object
DatasetItemSchema.set('toJSON', {
    virtuals: true,
    transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id?.toString();
        delete ret.__v;
        return ret;
    }
});

DatasetItemSchema.set('toObject', {
    virtuals: true,
    transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id?.toString();
        delete ret.__v;
        return ret;
    }
});

export default mongoose.models.DatasetItem || mongoose.model('DatasetItem', DatasetItemSchema);