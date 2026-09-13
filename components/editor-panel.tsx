import React, { useRef } from "react";
import { LabelType, MediaData } from "@/types/dataset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LabelBadge } from "@/components/label-badge";
import {
  PlusCircle,
  Save,
  X,
  Trash2,
  Lock,
  Upload,
  FileText,
  Info,
  Eye,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  HelpCircle,
  RotateCcw,
} from "lucide-react";

interface EditorPanelProps {
  isEditMode: boolean;
  activeItemId: string | null;
  text: string;
  setText: (text: string) => void;
  media: MediaData | null;
  mediaDescription: string;
  setMediaDescription: (desc: string) => void;
  eval1Label: LabelType | null;
  setEval1Label: (label: LabelType | null) => void;
  eval1Note: string;
  setEval1Note: (note: string) => void;
  eval2Label: LabelType | null;
  setEval2Label: (label: LabelType | null) => void;
  eval2Note: string;
  setEval2Note: (note: string) => void;
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
  text,
  setText,
  media,
  mediaDescription,
  setMediaDescription,
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
            ? "Ràng buộc nghiêm ngặt: Văn bản gốc và tệp phương tiện bị khóa. Chỉ có thể chỉnh sửa 2 phần đánh giá độc lập bên dưới."
            : "Nhập nội dung bài viết, đính kèm hình ảnh/video, điền mô tả ngữ cảnh và gán nhãn đánh giá độc lập (mặc định: Chưa đánh giá)."}
        </CardDescription>

        {/* Edit Mode Lock Alert Banner */}
        {isEditMode && (
          <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs sm:text-sm text-amber-800 dark:text-amber-300">
            <Lock className="size-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              <strong>Nội dung gốc được khóa:</strong> Nhằm bảo đảm tính nguyên vẹn của tập dữ liệu, nội dung bài viết, tệp phương tiện và mô tả media không thể sửa ở Chế độ Chỉnh sửa. Vui lòng chỉnh sửa 2 đánh giá bên dưới và nhấn Lưu Thay Đổi.
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-5 space-y-5">
        {/* ======================================================== */}
        {/* Form Field 1: Text Input / Textarea                      */}
        {/* ======================================================== */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="post-text" className="text-sm font-semibold flex items-center gap-2">
              <FileText className="size-4 text-muted-foreground" />
              Nội dung Bài viết / Văn bản
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
            placeholder="Nhập nội dung bài viết mạng xã hội, đoạn đối thoại hoặc phát ngôn..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isEditMode}
            readOnly={isEditMode}
            rows={3}
            className={`min-h-[95px] text-sm sm:text-base leading-relaxed ${
              isEditMode
                ? "bg-muted/40 text-muted-foreground/90 border-dashed cursor-not-allowed opacity-85 select-text"
                : ""
            }`}
          />
        </div>

        {/* ======================================================== */}
        {/* Form Field 2 & 3: Media Upload & Media Description       */}
        {/* ======================================================== */}
        <div className="space-y-4 pt-2 border-t border-border/60">
          {/* File Upload Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="media-upload" className="text-sm font-semibold flex items-center gap-2">
                <Upload className="size-4 text-muted-foreground" />
                Tệp Phương tiện Đính kèm (Hình ảnh hoặc Video)
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
                  <X className="size-3.5 mr-1" />
                  Gỡ tệp
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
                  className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-lg border border-dashed border-input bg-muted/20 hover:bg-muted/50 hover:border-primary/50 text-sm text-muted-foreground transition-all cursor-pointer"
                >
                  <Upload className="size-4 text-primary" />
                  <span>
                    {media ? `Thay đổi tệp: ${media.name}` : "Nhấp hoặc kéo thả để tải lên hình ảnh hoặc video"}
                  </span>
                </button>
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50 text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                <Lock className="size-4 text-muted-foreground" />
                <span>Tệp phương tiện đính kèm đã bị khóa đối với các mục dữ liệu hiện có.</span>
              </div>
            )}
          </div>

          {/* Media Description Input */}
          <div className="space-y-2">
            <Label htmlFor="media-desc" className="text-sm font-semibold flex items-center gap-2">
              <Info className="size-4 text-muted-foreground" />
              Mô tả / Ngữ cảnh Phương tiện
              {isEditMode && (
                <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground flex items-center gap-1 font-medium">
                  <Lock className="size-3" /> Đã khóa
                </span>
              )}
            </Label>
            <Input
              id="media-desc"
              placeholder="Mô tả khung cảnh, phiên âm, văn bản OCR hoặc ngữ cảnh của phương tiện..."
              value={mediaDescription}
              onChange={(e) => setMediaDescription(e.target.value)}
              disabled={isEditMode}
              readOnly={isEditMode}
              className={`h-9 sm:h-10 text-sm sm:text-base ${
                isEditMode
                  ? "bg-muted/40 text-muted-foreground/90 border-dashed cursor-not-allowed opacity-85"
                  : ""
              }`}
            />
          </div>

          {/* Media Preview Container */}
          {media && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium">
                  <Eye className="size-3.5" />
                  Xem trước: {media.name} ({media.type === "image" ? "Hình ảnh" : "Video"})
                </span>
                {isEditMode && (
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                    Bản xem trước bị khóa
                  </span>
                )}
              </div>
              <div className="relative rounded-lg overflow-hidden border border-border bg-black/90 max-h-64 flex items-center justify-center">
                {media.type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={media.url}
                    alt={media.description || "Bản xem trước hình ảnh"}
                    className="max-h-64 w-full object-contain"
                  />
                ) : (
                  <video
                    src={media.url}
                    controls
                    className="max-h-64 w-full object-contain"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* ANNOTATION SECTION: 2 Independent Evaluation Columns      */}
        {/* ======================================================== */}
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

            {/* Live Conflict vs Consensus Indicator */}
            {hasNull ? (
              <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <HelpCircle className="size-4" /> Chờ hoàn tất đánh giá (có nhãn chưa chọn)
              </span>
            ) : isConsensus ? (
              <span className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="size-4" /> Đồng thuận ({eval1Label})
              </span>
            ) : isConflict ? (
              <span className="text-xs sm:text-sm font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <AlertCircle className="size-4" /> Phát hiện Xung đột
              </span>
            ) : null}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 divide-x-2 divide-dashed divide-gray-300 gap-4 p-4 rounded-xl border border-border/80 bg-muted/20">
            {/* Column 1: Evaluation 1 */}
            <div className="space-y-3 p-2">
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <LabelBadge label={eval1Label} size="sm" />
                  {eval1Label !== null && (
                      <button
                          type="button"
                          onClick={() => setEval1Label(null)}
                          title="Đặt lại về null (Chưa đánh giá)"
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
                <Label htmlFor="eval1-label" className="text-xs sm:text-sm text-muted-foreground font-medium">
                  Nhãn phân loại (Mặc định: Chưa chọn)
                </Label>
                <Select
                  value={eval1Label || "NONE"}
                  onValueChange={(val) => {
                    if (val === "NONE" || !val) {
                      setEval1Label(null);
                    } else {
                      setEval1Label(val as LabelType);
                    }
                  }}
                >
                  <SelectTrigger id="eval1-label" className="w-full h-9 sm:h-10 text-sm bg-background">
                    <SelectValue placeholder="Chưa đánh giá (null)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">-- Chưa đánh giá (Mặc định: null) --</SelectItem>
                    <SelectItem value="SAFE">SAFE (An toàn / Phù hợp)</SelectItem>
                    <SelectItem value="OFFENSIVE">OFFENSIVE (Xúc phạm / Phản cảm)</SelectItem>
                    <SelectItem value="HATE">HATE (Thù ghét / Thù địch)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="eval1-note" className="text-xs sm:text-sm text-muted-foreground font-medium">
                  Ghi chú & Căn cứ đánh giá
                </Label>
                <Input
                  id="eval1-note"
                  placeholder="Căn cứ ngữ cảnh, tín hiệu ngầm hiểu..."
                  value={eval1Note}
                  onChange={(e) => setEval1Note(e.target.value)}
                  className="h-9 sm:h-10 text-xs sm:text-base bg-background"
                />
              </div>
            </div>

            {/* Column 2: Evaluation 2 */}
            <div className="space-y-3 p-2">
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <LabelBadge label={eval2Label} size="sm" />
                  {eval2Label !== null && (
                      <button
                          type="button"
                          onClick={() => setEval2Label(null)}
                          title="Đặt lại về null (Chưa đánh giá)"
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
                <Label htmlFor="eval2-label" className="text-xs sm:text-sm text-muted-foreground font-medium">
                  Nhãn phân loại (Mặc định: Chưa chọn)
                </Label>
                <Select
                  value={eval2Label || "NONE"}
                  onValueChange={(val) => {
                    if (val === "NONE" || !val) {
                      setEval2Label(null);
                    } else {
                      setEval2Label(val as LabelType);
                    }
                  }}
                >
                  <SelectTrigger id="eval2-label" className="w-full h-9 sm:h-10 text-sm bg-background">
                    <SelectValue placeholder="Chưa đánh giá (null)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">-- Chưa đánh giá (Mặc định: null) --</SelectItem>
                    <SelectItem value="SAFE">SAFE (An toàn / Phù hợp)</SelectItem>
                    <SelectItem value="OFFENSIVE">OFFENSIVE (Xúc phạm / Phản cảm)</SelectItem>
                    <SelectItem value="HATE">HATE (Thù ghét / Thù địch)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="eval2-note" className="text-xs sm:text-sm text-muted-foreground font-medium">
                  Ghi chú & Căn cứ đánh giá
                </Label>
                <Input
                  id="eval2-note"
                  placeholder="Căn cứ đánh giá độc lập..."
                  value={eval2Note}
                  onChange={(e) => setEval2Note(e.target.value)}
                  className="h-9 sm:h-10 text-xs sm:text-base bg-background"
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Action Buttons (Conditional based on Mode) */}
      <CardFooter className="border-t border-border/80 bg-muted/30 p-4 flex items-center gap-3">
        {!isEditMode ? (
          /* Create Mode Action Button */
          <Button
            type="button"
            onClick={onCreateData}
            className="w-full h-10 sm:h-11 text-sm sm:text-base font-bold shadow-xs cursor-pointer"
          >
            <PlusCircle className="size-4 mr-2" />
            Tạo Dữ Liệu
          </Button>
        ) : (
          /* Edit Mode Action Buttons */
          <div className="w-full flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Button
                type="button"
                onClick={onSaveChanges}
                className="flex-1 sm:flex-none h-10 text-sm sm:text-base font-bold shadow-xs cursor-pointer"
              >
                <Save className="size-4 mr-2" />
                Lưu Thay Đổi
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancelEdit}
                className="flex-1 sm:flex-none h-10 text-sm sm:text-base cursor-pointer"
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
