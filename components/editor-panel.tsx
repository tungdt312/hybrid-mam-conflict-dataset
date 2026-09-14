import React, {useRef} from "react";
import {LabelType, MediaData} from "@/types/dataset";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import {Badge} from "@/components/ui/badge";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {LabelBadge} from "@/components/label-badge";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  FileText,
  HelpCircle,
  Info,
  Lock,
  PlusCircle,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  Upload,
  X,
  Clock,
  Type,
} from "lucide-react";

export interface EvidenceSource {
  type: string;
  value: string;
}

interface EditorPanelProps {
  isEditMode: boolean;
  activeItemId: string | null;
  // Metadata & Modality
  modalityType: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "MIX";
  setModalityType: (val: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "MIX") => void;
  language: "vi" | "en";
  setLanguage: (val: "vi" | "en") => void;
  // Gold Annotation
  goldDecision: "PASS" | "REVIEW" | "BLOCK";
  setGoldDecision: (val: "PASS" | "REVIEW" | "BLOCK") => void;
  goldLabel: LabelType | null;
  setGoldLabel: (val: LabelType | null) => void;
  goldExplanation: string;
  setGoldExplanation: (val: string) => void;
  evidenceSources: EvidenceSource[];
  onAddEvidence: () => void;
  onUpdateEvidence: (index: number, field: "type" | "value", val: string) => void;
  onRemoveEvidence: (index: number) => void;
  // Raw Inputs & Media
  text: string;
  setText: (text: string) => void;
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
  // Dual Evaluations
  eval1Label: LabelType | null;
  setEval1Label: (label: LabelType | null) => void;
  eval1Note: string;
  setEval1Note: (note: string) => void;
  eval2Label: LabelType | null;
  setEval2Label: (label: LabelType | null) => void;
  eval2Note: string;
  setEval2Note: (note: string) => void;
  // Handlers
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveMedia: () => void;
  onCreateData: (e: React.FormEvent) => void;
  onSaveChanges: () => void;
  onCancelEdit: () => void;
  onDeleteData: () => void;
}

export function EditorPanel({
                              isEditMode,
                              activeItemId,
                              modalityType,
                              setModalityType,
                              language,
                              setLanguage,
                              goldDecision,
                              setGoldDecision,
                              goldLabel,
                              setGoldLabel,
                              goldExplanation,
                              setGoldExplanation,
                              evidenceSources,
                              onAddEvidence,
                              onUpdateEvidence,
                              onRemoveEvidence,
                              text,
                              setText,
                              media,
                              mediaDescription,
                              setMediaDescription,
                              ocrText,
                              setOcrText,
                              imageCaption,
                              setImageCaption,
                              videoDuration,
                              setVideoDuration,
                              videoCaption,
                              setVideoCaption,
                              eval1Label,
                              setEval1Label,
                              eval1Note,
                              setEval1Note,
                              eval2Label,
                              setEval2Label,
                              eval2Note,
                              setEval2Note,
                              onFileUpload,
                              onRemoveMedia,
                              onCreateData,
                              onSaveChanges,
                              onCancelEdit,
                              onDeleteData,
                            }: EditorPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasNull = eval1Label === null || eval2Label === null;
  const isConsensus = !hasNull && eval1Label === eval2Label;
  const isConflict = !hasNull && eval1Label !== eval2Label;

  return (
      <Card className="shadow-sm border-border/80 bg-card overflow-hidden transition-all">
        {/* Mode Header */}
        <CardHeader className="border-b border-border/60 pb-4 bg-muted/20">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              {isEditMode ? (
                  <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1.5 py-1.5 px-3.5 text-xs sm:text-sm font-semibold">
                    <Lock className="size-4" />
                    Chế độ Chỉnh sửa (Mục đang chọn: #{activeItemId})
                  </Badge>
              ) : (
                  <Badge className="bg-primary/10 text-primary border-primary/20 gap-1.5 py-1.5 px-3.5 text-xs sm:text-sm font-semibold">
                    <Sparkles className="size-4" />
                    Chế độ Tạo mới (Mục mới)
                  </Badge>
              )}
            </div>

            {isEditMode && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onCancelEdit}
                    className="text-xs sm:text-sm text-muted-foreground hover:text-foreground h-8 gap-1.5 cursor-pointer"
                >
                  <X className="size-3.5" />
                  Thoát chế độ sửa
                </Button>
            )}
          </div>

          <CardTitle className="text-lg sm:text-xl font-bold pt-2 text-foreground">
            {isEditMode ? "Cập nhật Đánh giá Dữ liệu" : "Tạo Mục Dữ liệu Mới"}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {isEditMode
                ? "Ràng buộc nghiêm ngặt: Nội dung gốc và cấu trúc schema bị khóa. Chỉ có thể chỉnh sửa phần đánh giá độc lập."
                : "Cấu hình đầy đủ Modality, Ngôn ngữ, Nhãn Vàng, Nguồn bằng chứng và Đánh giá độc lập."}
          </CardDescription>

          {isEditMode && (
              <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs sm:text-sm text-amber-800 dark:text-amber-300">
                <Lock className="size-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
              <strong>Nội dung gốc được khóa:</strong> Nhằm bảo đảm tính nguyên vẹn của tập dữ liệu trên cơ sở dữ liệu.
            </span>
              </div>
          )}
        </CardHeader>

        <CardContent className="pt-5 space-y-5">
          {/* 1. Modality & Metadata Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-border/80 bg-muted/20">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Loại Modality (modality_type)</Label>
              <Select value={modalityType} onValueChange={(val: any) => setModalityType(val)} disabled={isEditMode}>
                <SelectTrigger className="h-9 text-xs bg-background">
                  <SelectValue placeholder="Chọn modality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEXT">TEXT (Văn bản)</SelectItem>
                  <SelectItem value="IMAGE">IMAGE (Hình ảnh)</SelectItem>
                  <SelectItem value="AUDIO">AUDIO (Âm thanh)</SelectItem>
                  <SelectItem value="VIDEO">VIDEO (Video)</SelectItem>
                  <SelectItem value="MIX">MIX (Hỗn hợp)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Ngôn ngữ (metadata.language)</Label>
              <Select value={language} onValueChange={(val: any) => setLanguage(val)}>
                <SelectTrigger className="h-9 text-xs bg-background">
                  <SelectValue placeholder="Chọn ngôn ngữ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vi">Tiếng Việt (vi)</SelectItem>
                  <SelectItem value="en">Tiếng Anh (en)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>



          {/* 3. Text Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="post-text" className="text-sm font-semibold flex items-center gap-2">
                <FileText className="size-4 text-muted-foreground" />
                Nội dung Bài viết / Văn bản (text)
                {isEditMode && (
                    <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground flex items-center gap-1 font-medium">
                  <Lock className="size-3" /> Đã khóa
                </span>
                )}
              </Label>
              <span className="text-xs text-muted-foreground font-mono">{text.length} ký tự</span>
            </div>
            <Textarea
                id="post-text"
                placeholder="Nhập nội dung bài viết..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isEditMode}
                readOnly={isEditMode}
                rows={3}
                className={`min-h-[95px] text-sm leading-relaxed ${
                    isEditMode ? "bg-muted/40 text-muted-foreground/90 border-dashed cursor-not-allowed opacity-85" : ""
                }`}
            />
          </div>

          {/* 4. Media Section & Agent Extracted Context */}
          <div className="space-y-4 pt-2 border-t border-border/60">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="media-upload" className="text-sm font-semibold flex items-center gap-2">
                  <Upload className="size-4 text-muted-foreground" />
                  Tệp Phương tiện Đính kèm
                  {isEditMode && (
                      <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground flex items-center gap-1 font-medium">
                    <Lock className="size-3" /> Đã khóa
                  </span>
                  )}
                </Label>
                {media && !isEditMode && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onRemoveMedia}
                        className="text-xs text-destructive hover:bg-destructive/10 h-7 px-2 cursor-pointer"
                    >
                      <X className="size-3.5 mr-1" /> Gỡ tệp
                    </Button>
                )}
              </div>

              {!isEditMode ? (
                  <div className="relative">
                    <input
                        ref={fileInputRef}
                        id="media-upload"
                        type="file"
                        accept="image/*,video/*"
                        onChange={onFileUpload}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-lg border border-dashed border-input bg-muted/20 hover:bg-muted/50 text-sm text-muted-foreground transition-all cursor-pointer"
                    >
                      <Upload className="size-4 text-primary" />
                      <span>{media ? `Thay đổi tệp: ${media.name}` : "Nhấp hoặc kéo thả để tải lên hình ảnh hoặc video"}</span>
                    </button>
                  </div>
              ) : (
                  <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50 text-xs text-muted-foreground flex items-center gap-2">
                    <Lock className="size-4 text-muted-foreground" />
                    <span>Tệp phương tiện đính kèm đã bị khóa.</span>
                  </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="media-desc" className="text-sm font-semibold flex items-center gap-2">
                <Info className="size-4 text-muted-foreground" />
                Mô tả Chung
              </Label>
              <Input
                  id="media-desc"
                  placeholder="Mô tả tóm tắt..."
                  value={mediaDescription}
                  onChange={(e) => setMediaDescription(e.target.value)}
                  disabled={isEditMode}
                  readOnly={isEditMode}
                  className={`h-9 text-sm ${isEditMode ? "bg-muted/40 text-muted-foreground/90 border-dashed cursor-not-allowed" : ""}`}
              />
            </div>

            {media && (
                <div className="space-y-4 p-4 rounded-xl border border-border/80 bg-muted/20">
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/60 pb-2">
                    <span className="flex items-center gap-1.5 font-semibold text-foreground">
                      <Eye className="size-3.5 text-primary" /> Xem trước & Trích xuất ({media.type.toUpperCase()})
                    </span>
                    <span>{media.name}</span>
                  </div>

                  <div className="relative rounded-lg overflow-hidden border border-border bg-black/90 max-h-48 flex items-center justify-center">
                    {media.type === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            key={media.url}
                            src={media.url}
                            alt="Preview"
                            className="max-h-48 w-full object-contain"
                            onError={(e) => console.error("Lỗi hiển thị ảnh preview:", e)}
                        />
                    ) : (
                        <video key={media.url} src={media.url} controls className="max-h-48 w-full object-contain" />
                    )}
                  </div>

                  {media.type === "image" && (
                      <div className="space-y-3 pt-2">
                        <div className="space-y-1.5">
                          <Label htmlFor="ocr-text" className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                            <Type className="size-3.5 text-muted-foreground" /> Văn bản OCR (ocr_text)
                          </Label>
                          <Input
                              id="ocr-text"
                              placeholder="Nhập văn bản OCR..."
                              value={ocrText}
                              onChange={(e) => setOcrText(e.target.value)}
                              disabled={isEditMode}
                              className="h-9 text-xs bg-background"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="image-caption" className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                            <Info className="size-3.5 text-muted-foreground" /> Chú thích ảnh (image_caption)
                          </Label>
                          <Input
                              id="image-caption"
                              placeholder="Nhập chú thích ảnh..."
                              value={imageCaption}
                              onChange={(e) => setImageCaption(e.target.value)}
                              disabled={isEditMode}
                              className="h-9 text-xs bg-background"
                          />
                        </div>
                      </div>
                  )}

                  {media.type === "video" && (
                      <div className="space-y-3 pt-2">
                        <div className="space-y-1.5">
                          <Label htmlFor="video-duration" className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                            <Clock className="size-3.5 text-muted-foreground" /> Thời lượng (duration_seconds)
                          </Label>
                          <Input
                              id="video-duration"
                              type="number"
                              min={0}
                              placeholder="Số giây..."
                              value={videoDuration}
                              onChange={(e) => setVideoDuration(parseFloat(e.target.value) || 0)}
                              disabled={isEditMode}
                              className="h-9 text-xs bg-background"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="video-caption" className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                            <Info className="size-3.5 text-muted-foreground" /> Chú thích video (video_caption)
                          </Label>
                          <Input
                              id="video-caption"
                              placeholder="Nhập chú thích video..."
                              value={videoCaption}
                              onChange={(e) => setVideoCaption(e.target.value)}
                              disabled={isEditMode}
                              className="h-9 text-xs bg-background"
                          />
                        </div>
                      </div>
                  )}
                </div>
            )}
          </div>

          {/* 5. Dual Annotations Section (eval1 & eval2) */}
          <div className="pt-3 border-t border-border space-y-3.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Đánh giá Độc lập Song song (Dual Annotations)
                </Label>
                <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold">
                Có thể sửa
              </span>
              </div>

              {hasNull ? (
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <HelpCircle className="size-4" /> Chờ hoàn tất đánh giá (null)
              </span>
              ) : isConsensus ? (
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="size-4" /> Đồng thuận
              </span>
              ) : isConflict ? (
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <AlertCircle className="size-4" /> Phát hiện Xung đột
              </span>
              ) : null}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x-2 md:divide-dashed md:divide-gray-300 gap-4 p-4 rounded-xl border border-border/80 bg-muted/20">
              {/* Evaluation 1 */}
              <div className="space-y-3 p-2">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <LabelBadge label={eval1Label} size="sm" />
                    {eval1Label !== null && (
                        <button
                            type="button"
                            onClick={() => setEval1Label(null)}
                            title="Đặt lại về null"
                            className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted cursor-pointer"
                        >
                          <RotateCcw className="size-3" />
                        </button>
                    )}
                  </div>
                  <span className="text-sm font-bold text-foreground flex items-center gap-2 w-full">
                  <span className="size-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  Đánh giá 1
                </span>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="eval1-label" className="text-xs text-muted-foreground font-medium">Nhãn phân loại</Label>
                  <Select
                      value={eval1Label !== null ? eval1Label.toString() : "NONE"}
                      onValueChange={(val) => {
                        if (val === "NONE") setEval1Label(null);
                        else if (typeof val === "string") {
                          setEval1Label(parseInt(val, 10) as LabelType);
                        }
                      }}
                  >
                    <SelectTrigger id="eval1-label" className="w-full h-9 text-xs bg-background">
                      <SelectValue placeholder="Chưa đánh giá (null)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">-- Chưa đánh giá (null) --</SelectItem>
                      <SelectItem value="0">0 - SAFE (An toàn)</SelectItem>
                      <SelectItem value="1">1 - OFFENSIVE (Xúc phạm)</SelectItem>
                      <SelectItem value="2">2 - HATE (Thù ghét)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="eval1-note" className="text-xs text-muted-foreground font-medium">Ghi chú</Label>
                  <Input
                      id="eval1-note"
                      placeholder="Căn cứ..."
                      value={eval1Note}
                      onChange={(e) => setEval1Note(e.target.value)}
                      className="h-9 text-xs bg-background"
                  />
                </div>
              </div>

              {/* Evaluation 2 */}
              <div className="space-y-3 p-2">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <LabelBadge label={eval2Label} size="sm" />
                    {eval2Label !== null && (
                        <button
                            type="button"
                            onClick={() => setEval2Label(null)}
                            title="Đặt lại về null"
                            className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted cursor-pointer"
                        >
                          <RotateCcw className="size-3" />
                        </button>
                    )}
                  </div>
                  <span className="text-sm font-bold text-foreground flex items-center gap-2 w-full">
                  <span className="size-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  Đánh giá 2
                </span>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="eval2-label" className="text-xs text-muted-foreground font-medium">Nhãn phân loại</Label>
                  <Select
                      value={eval2Label !== null ? eval2Label.toString() : "NONE"}
                      onValueChange={(val) => {
                        if (val === "NONE") setEval2Label(null);
                        else if (typeof val === "string") {
                          setEval2Label(parseInt(val, 10) as LabelType);
                        }
                      }}
                  >
                    <SelectTrigger id="eval2-label" className="w-full h-9 text-xs bg-background">
                      <SelectValue placeholder="Chưa đánh giá (null)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">-- Chưa đánh giá (null) --</SelectItem>
                      <SelectItem value="0">0 - SAFE (An toàn)</SelectItem>
                      <SelectItem value="1">1 - OFFENSIVE (Xúc phạm)</SelectItem>
                      <SelectItem value="2">2 - HATE (Thù ghét)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="eval2-note" className="text-xs text-muted-foreground font-medium">Ghi chú</Label>
                  <Input
                      id="eval2-note"
                      placeholder="Căn cứ..."
                      value={eval2Note}
                      onChange={(e) => setEval2Note(e.target.value)}
                      className="h-9 text-xs bg-background"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* 2. Gold Annotation & Evidence Sources Configuration */}
          <div className="space-y-4 p-4 rounded-xl border border-border/80 bg-muted/20">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                Nhãn Vàng & Quyết định (Gold Annotation)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="gold-decision" className="text-xs font-semibold text-muted-foreground">
                  Quyết định (decision)
                </Label>
                <Select value={goldDecision} onValueChange={(val: any) => setGoldDecision(val)}>
                  <SelectTrigger id="gold-decision" className="h-9 text-xs bg-background">
                    <SelectValue placeholder="Chọn quyết định" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PASS">PASS (An toàn)</SelectItem>
                    <SelectItem value="REVIEW">REVIEW (Xem xét)</SelectItem>
                    <SelectItem value="BLOCK">BLOCK (Chặn)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gold-label" className="text-xs font-semibold text-muted-foreground">
                  Nhãn Vàng (label)
                </Label>
                <Select
                    value={goldLabel !== null ? goldLabel.toString() : "NONE"}
                    onValueChange={(val) => {
                      if (val === "NONE") setGoldLabel(null);
                      else if (typeof val === "string") {
                        setGoldLabel(parseInt(val, 10) as LabelType);
                      }
                    }}
                >
                  <SelectTrigger id="gold-label" className="h-9 text-xs bg-background">
                    <SelectValue placeholder="Chưa có nhãn vàng (null)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">-- Chưa có (null) --</SelectItem>
                    <SelectItem value="0">0 - SAFE (An toàn)</SelectItem>
                    <SelectItem value="1">1 - OFFENSIVE (Xúc phạm)</SelectItem>
                    <SelectItem value="2">2 - HATE (Thù ghét)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gold-explanation" className="text-xs font-semibold text-muted-foreground">
                Giải thích tiếng Việt (explanation_vi)
              </Label>
              <Textarea
                  id="gold-explanation"
                  placeholder="Nhập giải thích chi tiết..."
                  value={goldExplanation}
                  onChange={(e) => setGoldExplanation(e.target.value)}
                  rows={2}
                  className="text-xs bg-background"
              />
            </div>

            {/* Evidence Sources Management */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground">
                  Nguồn bằng chứng (evidence_sources)
                </Label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onAddEvidence}
                    className="h-7 text-xs px-2 cursor-pointer"
                >
                  + Thêm nguồn
                </Button>
              </div>

              {evidenceSources.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">Chưa có nguồn bằng chứng nào.</p>
              ) : (
                  <div className="space-y-2">
                    {evidenceSources.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                              placeholder="Loại (VD: text, image_ocr)..."
                              value={item.type}
                              onChange={(e) => onUpdateEvidence(index, "type", e.target.value)}
                              className="h-8 text-xs bg-background flex-1"
                          />
                          <Input
                              placeholder="Giá trị / Đường dẫn..."
                              value={item.value}
                              onChange={(e) => onUpdateEvidence(index, "value", e.target.value)}
                              className="h-8 text-xs bg-background flex-[2]"
                          />
                          <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => onRemoveEvidence(index)}
                              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                    ))}
                  </div>
              )}
            </div>
          </div>
        </CardContent>

        {/* Action Buttons */}
        <CardFooter className="border-t border-border/80 bg-muted/30 p-4 flex items-center gap-3">
          {!isEditMode ? (
              <Button
                  type="button"
                  onClick={onCreateData}
                  className="w-full h-10 sm:h-11 text-sm font-bold shadow-xs cursor-pointer"
              >
                <PlusCircle className="size-4 mr-2" />
                Tạo Dữ Liệu
              </Button>
          ) : (
              <div className="w-full flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <Button
                      type="button"
                      onClick={onSaveChanges}
                      className="flex-1 sm:flex-none h-10 text-sm font-bold shadow-xs cursor-pointer"
                  >
                    <Save className="size-4 mr-2" />
                    Lưu Thay Đổi
                  </Button>
                  <Button
                      type="button"
                      variant="outline"
                      onClick={onCancelEdit}
                      className="flex-1 sm:flex-none h-10 text-sm cursor-pointer"
                  >
                    <X className="size-4 mr-1.5" />
                    Hủy Bỏ
                  </Button>
                </div>
                <Button
                    type="button"
                    variant="destructive"
                    onClick={onDeleteData}
                    className="w-full sm:w-auto h-10 text-sm cursor-pointer"
                >
                  <Trash2 className="size-4 mr-1.5" />
                  Xóa Dữ Liệu
                </Button>
              </div>
          )}
        </CardFooter>
      </Card>
  );
}