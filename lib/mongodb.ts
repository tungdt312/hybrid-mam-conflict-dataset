// src/lib/mongodb.js
import mongoose from 'mongoose';

declare global {
    // eslint-disable-next-line no-var
    var mongoose: { conn: any; promise: any } | undefined;
}

const MONGODB_URI = process.env.NEXT_MONGODB_URI || process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
    throw new Error('Vui lòng định nghĩa biến môi trường NEXT_MONGODB_URI hoặc MONGODB_URI trong file .env.local');
}

/**
 * Global là một đối tượng toàn cục trong Node.js để giữ kết nối không bị khởi tạo lại
 * mỗi khi Next.js chạy hot-reload trong môi trường Development.
 */
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (!cached) return
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default dbConnect;