import React, {useState} from "react";
import {EvidenceSource, LabelType, MediaData} from "@/types/dataset";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Lock, PlusCircle, Save, Sparkles, Trash2, X} from "lucide-react";

import {ModalityMetadata} from "./modality-metadata";
import {TextInputSection} from "./text-input-section";
import {MediaSection} from "./media-section";
import {DualAnnotations} from "./dual-annotations";
import {GoldAnnotation} from "./gold-annotation";

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
    onUpdateEvidence: (index: number, field: keyof EvidenceSource, val: any) => void;
    onUpdateLocator: (index: number, locatorField: string, val: any) => void;
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
    onSelectExistingMedia?: (media: MediaData) => void;
    onRemoveMedia: () => void;
    onCreateData: (e: React.FormEvent) => void;
    onSaveChanges: () => void;
    onCancelEdit: () => void;
    onDeleteData: () => void;
}

// (Giữ nguyên toàn bộ interface EditorPanelProps như cũ...)

export function EditorPanel(props: EditorPanelProps) {
    const [boxEditingIndex, setBoxEditingIndex] = useState<number | null>(null);

    return (
        <Card className="shadow-sm border-border/80 bg-card overflow-hidden transition-all">
            <CardHeader className="border-b border-border/60 pb-4 bg-muted/20">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <Badge className={props.isEditMode ? "bg-amber-500/15 text-amber-700" : "bg-primary/10 text-primary"}>
                        {props.isEditMode ? <Lock className="size-4 mr-1"/> : <Sparkles className="size-4 mr-1"/>}
                        {props.isEditMode ? `Chế độ Chỉnh sửa (#${props.activeItemId})` : "Chế độ Tạo mới"}
                    </Badge>
                    {props.isEditMode && (
                        <Button variant="outline" size="sm" onClick={props.onCancelEdit} className="text-xs h-8">
                            <X className="size-3.5 mr-1"/> Thoát chỉnh sửa
                        </Button>
                    )}
                </div>
                <CardTitle className="text-lg font-bold pt-2">
                    {props.isEditMode ? "Cập nhật Đánh giá Dữ liệu" : "Tạo Mục Dữ liệu Mới"}
                </CardTitle>
                <CardDescription className="text-xs">
                    {props.isEditMode ? "Nội dung gốc bị khóa. Chỉ có thể sửa đánh giá." : "Cấu hình đầy đủ thông tin schema dữ liệu."}
                </CardDescription>
            </CardHeader>

            <CardContent className="pt-5 space-y-5">
                {/* 1. Modality & Ngôn ngữ */}
                <ModalityMetadata
                    modalityType={props.modalityType}
                    setModalityType={props.setModalityType}
                    language={props.language}
                    setLanguage={props.setLanguage}
                    isEditMode={props.isEditMode}
                />

                {/* 2. Nội dung văn bản */}
                <TextInputSection
                    text={props.text}
                    setText={props.setText}
                    isEditMode={props.isEditMode}
                />

                {/* 3. Media & Trích xuất */}
                <MediaSection
                    {...props}
                    boxEditingIndex={boxEditingIndex}
                    setBoxEditingIndex={setBoxEditingIndex}
                />

                {/* 4. Đánh giá song song Eval 1 & 2 */}
                <DualAnnotations
                    eval1Label={props.eval1Label} setEval1Label={props.setEval1Label}
                    eval1Note={props.eval1Note} setEval1Note={props.setEval1Note}
                    eval2Label={props.eval2Label} setEval2Label={props.setEval2Label}
                    eval2Note={props.eval2Note} setEval2Note={props.setEval2Note}
                />

                {/* 5. Nhãn vàng & Nguồn bằng chứng */}
                <GoldAnnotation
                    {...props}
                    boxEditingIndex={boxEditingIndex}
                    setBoxEditingIndex={setBoxEditingIndex}
                />
            </CardContent>

            <CardFooter className="border-t border-border/80 bg-muted/30 p-4 flex items-center gap-3">
                {!props.isEditMode ? (
                    <Button type="button" onClick={props.onCreateData} className="w-full h-10 font-bold">
                        <PlusCircle className="size-4 mr-2"/> Tạo Dữ Liệu
                    </Button>
                ) : (
                    <div className="w-full flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2.5">
                            <Button type="button" onClick={props.onSaveChanges} className="h-10 font-bold">
                                <Save className="size-4 mr-2"/> Lưu Thay Đổi
                            </Button>
                            <Button type="button" variant="outline" onClick={props.onCancelEdit} className="h-10">
                                <X className="size-4 mr-1.5"/> Hủy
                            </Button>
                        </div>
                        <Button type="button" variant="destructive" onClick={props.onDeleteData} className="h-10">
                            <Trash2 className="size-4 mr-1.5"/> Xóa Dữ Liệu
                        </Button>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}