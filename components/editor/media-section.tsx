import React, { useRef, useEffect, useState } from "react";
import { MediaData, EvidenceSource } from "@/types/dataset";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Upload, X, Info, Eye, Type, Clock, Cloud, FolderOpen,
    Link2, ExternalLink, Image as ImageIcon, Film, Loader2, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { BlobMediaModal } from "./blob-media-modal";

interface MediaSectionProps {
    media: MediaData | null;
    mediaDescription: string;
    setMediaDescription: (desc: string) => void;
    ocrText: string;
    setOcrText: (val: string) => void;
    imageCaption: string;
    setImageCaption: (val: string) => void;
    videoDuration: number;
    setVideoDuration: (val: number) => void;
    videoCaption: string;
    setVideoCaption: (val: string) => void;
    isEditMode: boolean;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectExistingMedia?: (media: MediaData) => void;
    onRemoveMedia: () => void;
    evidenceSources: EvidenceSource[];
    boxEditingIndex: number | null;
    setBoxEditingIndex: (index: number | null) => void;
    onUpdateLocator: (index: number, locatorField: string, val: any) => void;
}

// Sub-component vẽ BBox trực tiếp trên Canvas
function BBoundingBoxCanvas({ mediaElementId, evidenceIndex, evidenceSources, onUpdateLocator, onFinish }: {
    mediaElementId: string;
    evidenceIndex: number;
    evidenceSources: EvidenceSource[];
    onUpdateLocator: (index: number, locatorField: string, val: any) => void;
    onFinish: () => void;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [drawing, setDrawing] = useState({ isDrawing: false, startX: 0, startY: 0, currentX: 0, currentY: 0 });
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const imgElement = document.getElementById(mediaElementId) as HTMLImageElement;
        if (!imgElement) return;
        const updateSize = () => setDimensions({ width: imgElement.clientWidth, height: imgElement.clientHeight });
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, [mediaElementId]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const currentBox = evidenceSources[evidenceIndex]?.locator?.box_2d;

        if (currentBox && Array.isArray(currentBox) && currentBox.length === 4) {
            const [ymin, xmin, ymax, xmax] = currentBox;
            const px = xmin * (dimensions.width / 10000);
            const py = ymin * (dimensions.height / 10000);
            const pWidth = (xmax - xmin) * (dimensions.width / 10000);
            const pHeight = (ymax - ymin) * (dimensions.height / 10000);

            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 2;
            ctx.strokeRect(px, py, pWidth, pHeight);
            ctx.fillStyle = 'rgba(34, 197, 94, 0.15)';
            ctx.fillRect(px, py, pWidth, pHeight);
        }

        if (drawing.isDrawing) {
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 2;
            const startX = Math.min(drawing.startX, drawing.currentX);
            const startY = Math.min(drawing.startY, drawing.currentY);
            ctx.strokeRect(startX, startY, Math.abs(drawing.currentX - drawing.startX), Math.abs(drawing.currentY - drawing.startY));
        }
    }, [dimensions, evidenceSources, evidenceIndex, drawing]);

    const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        return rect ? { x: e.clientX - rect.left, y: e.clientY - rect.top } : { x: 0, y: 0 };
    };

    return (
        <canvas
            ref={canvasRef}
            width={dimensions.width}
            height={dimensions.height}
            className="absolute top-0 left-0 z-10 cursor-crosshair"
            onMouseDown={(e) => { const p = getPos(e); setDrawing({ isDrawing: true, startX: p.x, startY: p.y, currentX: p.x, currentY: p.y }); }}
            onMouseMove={(e) => { if (drawing.isDrawing) { const p = getPos(e); setDrawing(prev => ({ ...prev, currentX: p.x, currentY: p.y })); } }}
            onMouseUp={(e) => {
                if (!drawing.isDrawing) return;
                const p = getPos(e);
                const xmin = Math.min(drawing.startX, p.x), xmax = Math.max(drawing.startX, p.x);
                const ymin = Math.min(drawing.startY, p.y), ymax = Math.max(drawing.startY, p.y);
                if (xmax - xmin >= 5 && ymax - ymin >= 5) {
                    onUpdateLocator(evidenceIndex, 'box_2d', [
                        Math.round(ymin * (10000 / dimensions.height)),
                        Math.round(xmin * (10000 / dimensions.width)),
                        Math.round(ymax * (10000 / dimensions.height)),
                        Math.round(xmax * (10000 / dimensions.width))
                    ]);
                }
                setDrawing({ isDrawing: false, startX: 0, startY: 0, currentX: 0, currentY: 0 });
                onFinish();
            }}
        />
    );
}

export function MediaSection({
                                 media, mediaDescription, setMediaDescription, ocrText, setOcrText,
                                 imageCaption, setImageCaption, videoDuration, setVideoDuration, videoCaption, setVideoCaption,
                                 isEditMode, onFileUpload, onSelectExistingMedia, onRemoveMedia, evidenceSources, boxEditingIndex, setBoxEditingIndex, onUpdateLocator
                             }: MediaSectionProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isBlobModalOpen, setIsBlobModalOpen] = useState(false);

    // Trạng thái tùy chọn nhập liên kết media (URL)
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [inputUrl, setInputUrl] = useState("");
    const [mediaType, setMediaType] = useState<"image" | "video">("image");
    const [customName, setCustomName] = useState("");
    const [isUploadingFromUrl, setIsUploadingFromUrl] = useState(false);
    const [previewError, setPreviewError] = useState(false);

    useEffect(() => {
        setPreviewError(false);
    }, [media?.url]);

    const handleUrlChange = (val: string) => {
        setInputUrl(val);
        const cleanUrl = val.split("?")[0].toLowerCase();
        if (
            cleanUrl.endsWith(".mp4") ||
            cleanUrl.endsWith(".webm") ||
            cleanUrl.endsWith(".mov") ||
            cleanUrl.endsWith(".ogg") ||
            cleanUrl.endsWith(".mkv") ||
            cleanUrl.endsWith(".avi")
        ) {
            setMediaType("video");
        } else if (
            cleanUrl.endsWith(".jpg") ||
            cleanUrl.endsWith(".jpeg") ||
            cleanUrl.endsWith(".png") ||
            cleanUrl.endsWith(".gif") ||
            cleanUrl.endsWith(".webp") ||
            cleanUrl.endsWith(".svg")
        ) {
            setMediaType("image");
        }

        if (!customName) {
            try {
                const parsed = new URL(val);
                const rawName = parsed.pathname.split("/").filter(Boolean).pop();
                if (rawName) {
                    setCustomName(decodeURIComponent(rawName));
                }
            } catch {}
        }
    };

    const handleApplyDirectUrl = () => {
        const trimmedUrl = inputUrl.trim();
        if (!trimmedUrl) {
            toast.error("Vui lòng nhập đường dẫn URL của phương tiện");
            return;
        }
        if (!/^https?:\/\//i.test(trimmedUrl)) {
            toast.error("Đường dẫn URL phải bắt đầu bằng http:// hoặc https://");
            return;
        }

        let finalName = customName.trim();
        if (!finalName) {
            try {
                const parsed = new URL(trimmedUrl);
                finalName = decodeURIComponent(parsed.pathname.split("/").filter(Boolean).pop() || "") || (mediaType === "image" ? "image-link" : "video-link");
            } catch {
                finalName = mediaType === "image" ? "image-link" : "video-link";
            }
        }

        onSelectExistingMedia?.({
            type: mediaType,
            url: trimmedUrl,
            name: finalName,
            isExternal: true,
        });

        toast.success("Đã áp dụng liên kết media thành công!");
        setShowUrlInput(false);
        setInputUrl("");
        setCustomName("");
    };

    const handleUploadFromUrl = async () => {
        const trimmedUrl = inputUrl.trim();
        if (!trimmedUrl) {
            toast.error("Vui lòng nhập đường dẫn URL của phương tiện");
            return;
        }
        if (!/^https?:\/\//i.test(trimmedUrl)) {
            toast.error("Đường dẫn URL phải bắt đầu bằng http:// hoặc https://");
            return;
        }

        setIsUploadingFromUrl(true);
        const toastId = toast.loading("Đang tải phương tiện từ URL lên Vercel Blob...");

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    url: trimmedUrl,
                    filename: customName.trim() || undefined,
                }),
            });

            const result = await res.json();
            if (result.success && result.data?.url) {
                toast.dismiss(toastId);
                toast.success("Đã lưu phương tiện từ URL lên Vercel Blob thành công!");
                onSelectExistingMedia?.({
                    type: mediaType,
                    url: result.data.url,
                    name: result.data.pathname || customName.trim() || "uploaded-from-link",
                    size: result.data.size,
                    isExistingBlob: false,
                    isExternal: false,
                });
                setShowUrlInput(false);
                setInputUrl("");
                setCustomName("");
            } else {
                toast.dismiss(toastId);
                toast.error(`Không thể tải lên: ${result.error || "Lỗi không xác định"}`);
            }
        } catch (error: any) {
            console.error(error);
            toast.dismiss(toastId);
            toast.error(`Lỗi kết nối: ${error.message || "Không thể kết nối máy chủ"}`);
        } finally {
            setIsUploadingFromUrl(false);
        }
    };

    return (
        <div className="space-y-4 pt-2 border-t border-border/60">
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                        <Upload className="size-4 text-muted-foreground"/> Tệp Phương tiện Đính kèm
                    </Label>
                    {media && !isEditMode && (
                        <Button type="button" variant="ghost" size="sm" onClick={onRemoveMedia} className="text-xs text-destructive h-7 px-2 cursor-pointer">
                            <X className="size-3.5 mr-1"/> Gỡ tệp
                        </Button>
                    )}
                </div>
                {!isEditMode ? (
                    <div className="space-y-2.5">
                        <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={onFileUpload} className="hidden"/>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowUrlInput(false);
                                    fileInputRef.current?.click();
                                }}
                                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-input bg-muted/20 hover:bg-muted/50 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                            >
                                <Upload className="size-4 text-primary shrink-0"/>
                                <span className="truncate">Tải tệp từ máy</span>
                            </button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowUrlInput(false);
                                    setIsBlobModalOpen(true);
                                }}
                                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-input bg-card hover:bg-muted/50 text-xs font-medium h-auto cursor-pointer transition-colors"
                            >
                                <Cloud className="size-4 text-sky-500 shrink-0"/>
                                <span className="truncate">Vercel Blob</span>
                            </Button>

                            <Button
                                type="button"
                                variant={showUrlInput ? "secondary" : "outline"}
                                onClick={() => setShowUrlInput(!showUrlInput)}
                                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-input text-xs font-medium h-auto cursor-pointer transition-colors ${
                                    showUrlInput ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-card hover:bg-muted/50"
                                }`}
                            >
                                <Link2 className="size-4 text-emerald-500 shrink-0"/>
                                <span className="truncate">Nhập link URL</span>
                            </Button>
                        </div>

                        {/* Hộp thoại / Khung nhập liên kết media */}
                        {showUrlInput && (
                            <div className="p-3.5 rounded-xl border border-border/80 bg-muted/30 space-y-3">
                                <div className="flex items-center justify-between pb-1.5 border-b border-border/50">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                        <Link2 className="size-3.5 text-emerald-500"/>
                                        <span>Chèn phương tiện từ liên kết (URL)</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowUrlInput(false)}
                                        className="text-muted-foreground hover:text-foreground p-0.5 rounded-md hover:bg-muted cursor-pointer"
                                    >
                                        <X className="size-3.5"/>
                                    </button>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Đường dẫn liên kết (Image hoặc Video URL)</Label>
                                    <Input
                                        type="url"
                                        placeholder="https://example.com/image.jpg hoặc video.mp4..."
                                        value={inputUrl}
                                        onChange={(e) => handleUrlChange(e.target.value)}
                                        className="h-8 text-xs bg-background"
                                        autoFocus
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-end">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-muted-foreground">Định dạng phương tiện</Label>
                                        <div className="flex items-center gap-1 bg-muted/50 p-0.5 rounded-lg border border-border/60">
                                            <button
                                                type="button"
                                                onClick={() => setMediaType("image")}
                                                className={`flex-1 flex items-center justify-center gap-1.5 py-1 text-xs rounded-md font-medium cursor-pointer transition-colors ${
                                                    mediaType === "image"
                                                        ? "bg-background text-foreground shadow-xs border border-border/40"
                                                        : "text-muted-foreground hover:text-foreground"
                                                }`}
                                            >
                                                <ImageIcon className="size-3.5 text-emerald-500"/>
                                                <span>Hình ảnh</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setMediaType("video")}
                                                className={`flex-1 flex items-center justify-center gap-1.5 py-1 text-xs rounded-md font-medium cursor-pointer transition-colors ${
                                                    mediaType === "video"
                                                        ? "bg-background text-foreground shadow-xs border border-border/40"
                                                        : "text-muted-foreground hover:text-foreground"
                                                }`}
                                            >
                                                <Film className="size-3.5 text-sky-500"/>
                                                <span>Video</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-muted-foreground">Tên hiển thị (Tùy chọn)</Label>
                                        <Input
                                            type="text"
                                            placeholder="Tên tệp (tự động nhận diện nếu để trống)..."
                                            value={customName}
                                            onChange={(e) => setCustomName(e.target.value)}
                                            className="h-8 text-xs bg-background"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-1">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowUrlInput(false)}
                                        className="h-8 text-xs cursor-pointer"
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={!inputUrl.trim() || isUploadingFromUrl}
                                        onClick={handleApplyDirectUrl}
                                        className="h-8 text-xs cursor-pointer gap-1.5"
                                        title="Dùng trực tiếp URL, không tải lên Vercel Blob"
                                    >
                                        <ExternalLink className="size-3 text-muted-foreground"/>
                                        <span>Dùng link trực tiếp</span>
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        disabled={!inputUrl.trim() || isUploadingFromUrl}
                                        onClick={handleUploadFromUrl}
                                        className="h-8 text-xs cursor-pointer gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                                        title="Tải tệp từ URL về và lưu trữ vĩnh viễn trên Vercel Blob"
                                    >
                                        {isUploadingFromUrl ? (
                                            <Loader2 className="size-3 animate-spin"/>
                                        ) : (
                                            <Cloud className="size-3"/>
                                        )}
                                        <span>{isUploadingFromUrl ? "Đang lưu..." : "Lưu vào Vercel Blob"}</span>
                                    </Button>
                                </div>
                            </div>
                        )}

                        {media && (
                            <div className="flex items-center justify-between px-3 py-1.5 rounded-md bg-muted/40 border border-border/60 text-xs">
                                <div className="flex items-center gap-2 truncate">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${
                                        media.isExternal
                                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                                            : media.isExistingBlob
                                            ? "bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-500/30"
                                            : "bg-primary/10 text-primary border border-primary/20"
                                    }`}>
                                        {media.isExternal ? "Link URL ngoài" : media.isExistingBlob ? "Từ Vercel Blob" : "Đã tải lên"}
                                    </span>
                                    <span className="truncate font-medium text-foreground">{media.name}</span>
                                    <a
                                        href={media.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-muted-foreground hover:text-foreground shrink-0"
                                        title="Mở liên kết trong tab mới"
                                    >
                                        <ExternalLink className="size-3"/>
                                    </a>
                                </div>
                                {media.size ? (
                                    <span className="text-muted-foreground text-[11px] shrink-0">
                                        {(media.size / 1024).toFixed(0)} KB
                                    </span>
                                ) : null}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50 text-xs text-muted-foreground">Tệp đã bị khóa ở chế độ chỉnh sửa.</div>
                )}
            </div>

            {/* Modal chọn tệp từ Vercel Blob */}
            <BlobMediaModal
                isOpen={isBlobModalOpen}
                onClose={() => setIsBlobModalOpen(false)}
                onSelect={(selected) => {
                    onSelectExistingMedia?.(selected);
                }}
                currentMediaUrl={media?.url}
            />

            <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2"><Info className="size-4 text-muted-foreground"/> Mô tả Chung</Label>
                <Input placeholder="Mô tả tóm tắt..." value={mediaDescription} onChange={(e) => setMediaDescription(e.target.value)} disabled={isEditMode} className="h-9 text-sm"/>
            </div>

            {media && (
                <div className="space-y-4 p-4 rounded-xl border border-border/80 bg-muted/20">
                    <div className="relative rounded-lg overflow-hidden border border-border bg-black/95 max-h-[400px] flex items-center justify-center min-h-[140px]">
                        {previewError ? (
                            <div className="p-5 text-center space-y-2 text-xs text-muted-foreground">
                                <AlertCircle className="size-7 text-amber-500 mx-auto"/>
                                <p className="font-semibold text-foreground">Không thể hiển thị xem trước phương tiện</p>
                                <p className="max-w-md mx-auto text-[11px] text-muted-foreground">
                                    Trang web nguồn có thể chặn nhúng do chính sách CORS hoặc đường link không phải file ảnh/video trực tiếp. Đường dẫn này vẫn được lưu vào bản ghi.
                                </p>
                                {media.isExternal && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setInputUrl(media.url);
                                            setMediaType(media.type);
                                            setCustomName(media.name);
                                            setShowUrlInput(true);
                                        }}
                                        className="mt-2 text-xs h-7 gap-1"
                                    >
                                        <Cloud className="size-3 text-sky-500"/>
                                        <span>Lưu sang Vercel Blob để khắc phục</span>
                                    </Button>
                                )}
                            </div>
                        ) : media.type === "image" ? (
                            <div className="relative inline-flex items-center justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    id="editor-media-img"
                                    src={media.url}
                                    alt="Preview"
                                    onError={() => setPreviewError(true)}
                                    className="max-h-[350px] w-auto object-contain select-none pointer-events-none"
                                    draggable={false}
                                />
                                {boxEditingIndex !== null && (
                                    <BBoundingBoxCanvas mediaElementId="editor-media-img" evidenceIndex={boxEditingIndex} evidenceSources={evidenceSources} onUpdateLocator={onUpdateLocator} onFinish={() => setBoxEditingIndex(null)}/>
                                )}
                            </div>
                        ) : (
                            <video
                                src={media.url}
                                controls
                                onError={() => setPreviewError(true)}
                                className="max-h-[350px] w-full object-contain"
                            />
                        )}
                    </div>

                    {media.type === "image" && (
                        <div className="space-y-3 pt-2">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold flex items-center gap-1.5"><Type className="size-3.5"/> Văn bản OCR</Label>
                                <Input placeholder="Nhập OCR..." value={ocrText} onChange={(e) => setOcrText(e.target.value)} disabled={isEditMode} className="h-9 text-xs bg-background"/>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold flex items-center gap-1.5"><Info className="size-3.5"/> Chú thích ảnh</Label>
                                <Input placeholder="Nhập chú thích..." value={imageCaption} onChange={(e) => setImageCaption(e.target.value)} disabled={isEditMode} className="h-9 text-xs bg-background"/>
                            </div>
                        </div>
                    )}

                    {media.type === "video" && (
                        <div className="space-y-3 pt-2">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold flex items-center gap-1.5"><Clock className="size-3.5"/> Thời lượng (giây)</Label>
                                <Input type="number" placeholder="Số giây..." value={videoDuration} onChange={(e) => setVideoDuration(parseFloat(e.target.value) || 0)} disabled={isEditMode} className="h-9 text-xs bg-background"/>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold flex items-center gap-1.5"><Info className="size-3.5"/> Chú thích video</Label>
                                <Input placeholder="Chú thích video..." value={videoCaption} onChange={(e) => setVideoCaption(e.target.value)} disabled={isEditMode} className="h-9 text-xs bg-background"/>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}