import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Lock } from "lucide-react";

interface TextInputSectionProps {
    text: string;
    setText: (text: string) => void;
    isEditMode: boolean;
}

export function TextInputSection({ text, setText, isEditMode }: TextInputSectionProps) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label htmlFor="post-text" className="text-sm font-semibold flex items-center gap-2">
                    <FileText className="size-4 text-muted-foreground"/>
                    Nội dung Bài viết / Văn bản (text)
                    {isEditMode && (
                        <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground flex items-center gap-1 font-medium">
                            <Lock className="size-3"/> Đã khóa
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
    );
}