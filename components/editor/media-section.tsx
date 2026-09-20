import React, { useRef, useEffect, useState } from "react";
import { MediaData, EvidenceSource } from "@/types/dataset";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, X, Info, Eye, Type, Clock, Cloud, FolderOpen } from "lucide-react";
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
                    <div className="space-y-2">
                        <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={onFileUpload} className="hidden"/>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-input bg-muted/20 hover:bg-muted/50 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                            >
                                <Upload className="size-4 text-primary shrink-0"/>
                                <span>Tải tệp mới từ máy</span>
                            </button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsBlobModalOpen(true)}
                                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-input bg-card hover:bg-muted/50 text-xs font-medium h-auto cursor-pointer transition-colors"
                            >
                                <Cloud className="size-4 text-sky-500 shrink-0"/>
                                <span>Chọn từ Vercel Blob</span>
                            </Button>
                        </div>

                        {media && (
                            <div className="flex items-center justify-between px-3 py-1.5 rounded-md bg-muted/40 border border-border/60 text-xs">
                                <div className="flex items-center gap-2 truncate">
                                    <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-primary/10 text-primary">
                                        {media.isExistingBlob ? "Từ Vercel Blob" : "Đã tải lên"}
                                    </span>
                                    <span className="truncate font-medium text-foreground">{media.name}</span>
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
                    <div className="relative rounded-lg overflow-hidden border border-border bg-black/95 max-h-[400px] flex items-center justify-center">
                        {media.type === "image" ? (
                            <div className="relative inline-flex items-center justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img id="editor-media-img" src={media.url} alt="Preview" className="max-h-[350px] w-auto object-contain select-none pointer-events-none" draggable={false}/>
                                {boxEditingIndex !== null && (
                                    <BBoundingBoxCanvas mediaElementId="editor-media-img" evidenceIndex={boxEditingIndex} evidenceSources={evidenceSources} onUpdateLocator={onUpdateLocator} onFinish={() => setBoxEditingIndex(null)}/>
                                )}
                            </div>
                        ) : (
                            <video src={media.url} controls className="max-h-[350px] w-full object-contain"/>
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