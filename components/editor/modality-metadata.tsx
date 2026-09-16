import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ModalityMetadataProps {
    modalityType: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "MIX";
    setModalityType: (val: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "MIX") => void;
    language: "vi" | "en";
    setLanguage: (val: "vi" | "en") => void;
    isEditMode: boolean;
}

export function ModalityMetadata({ modalityType, setModalityType, language, setLanguage, isEditMode }: ModalityMetadataProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-border/80 bg-muted/20">
            <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Loại Modality (modality_type)</Label>
                <Select value={modalityType} onValueChange={(val: any) => setModalityType(val)} disabled={isEditMode}>
                    <SelectTrigger className="h-9 text-xs bg-background">
                        <SelectValue placeholder="Chọn modality"/>
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
                        <SelectValue placeholder="Chọn ngôn ngữ"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="vi">Tiếng Việt (vi)</SelectItem>
                        <SelectItem value="en">Tiếng Anh (en)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}