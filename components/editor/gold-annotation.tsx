import React from "react";
import { EvidenceSource, LabelType, MediaData } from "@/types/dataset";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Target } from "lucide-react";

interface GoldAnnotationProps {
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
    media: MediaData | null;
    boxEditingIndex: number | null;
    setBoxEditingIndex: (index: number | null) => void;
}

export function GoldAnnotation({
                                   goldDecision, setGoldDecision, goldLabel, setGoldLabel, goldExplanation, setGoldExplanation,
                                   evidenceSources, onAddEvidence, onUpdateEvidence, onUpdateLocator, onRemoveEvidence,
                                   media, boxEditingIndex, setBoxEditingIndex
                               }: GoldAnnotationProps) {
    return (
        <div className="space-y-4 p-4 rounded-xl border border-border/80 bg-muted/20">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">Nhãn Vàng & Quyết định (Gold Annotation)</span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">Quyết định (decision)</Label>
                    <Select value={goldDecision} onValueChange={(val: any) => setGoldDecision(val)}>
                        <SelectTrigger className="h-9 text-xs bg-background"><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="PASS">PASS</SelectItem>
                            <SelectItem value="REVIEW">REVIEW</SelectItem>
                            <SelectItem value="BLOCK">BLOCK</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">Nhãn Vàng (label)</Label>
                    <Select value={goldLabel !== null ? goldLabel.toString() : "NONE"} onValueChange={(val) => setGoldLabel(val === "NONE" ? null : parseInt(val as string, 10) as LabelType)}>
                        <SelectTrigger className="h-9 text-xs bg-background"><SelectValue placeholder="Chưa có"/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="NONE">-- Chưa có --</SelectItem>
                            <SelectItem value="0">0 - SAFE</SelectItem>
                            <SelectItem value="1">1 - OFFENSIVE</SelectItem>
                            <SelectItem value="2">2 - HATE</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Giải thích tiếng Việt (explanation_vi)</Label>
                <Textarea placeholder="Giải thích..." value={goldExplanation} onChange={(e) => setGoldExplanation(e.target.value)} rows={2} className="text-xs bg-background"/>
            </div>

            {/* Evidence Sources */}
            <div className="space-y-3 pt-3 border-t border-border/60">
                <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold uppercase tracking-wider text-foreground">Nguồn Bằng Chứng</Label>
                    <Button type="button" variant="outline" size="sm" onClick={onAddEvidence} className="h-7 text-xs px-2.5 cursor-pointer">+ Thêm nguồn</Button>
                </div>

                {evidenceSources.map((item, index) => (
                    <div key={index} className="p-3 rounded-lg border border-border/80 bg-background/50 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-primary">#{index + 1} Nguồn</span>
                            <Button type="button" variant="ghost" size="sm" onClick={() => onRemoveEvidence(index)} className="h-7 w-7 p-0 text-destructive"><Trash2 className="size-4"/></Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <Select value={item.modality} onValueChange={(val) => onUpdateEvidence(index, "modality", val)}>
                                <SelectTrigger className="h-8 text-xs bg-background"><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TEXT">TEXT</SelectItem><SelectItem value="IMAGE">IMAGE</SelectItem>
                                    <SelectItem value="AUDIO">AUDIO</SelectItem><SelectItem value="VIDEO">VIDEO</SelectItem><SelectItem value="OCR">OCR</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={item.locator_type} onValueChange={(val) => onUpdateEvidence(index, "locator_type", val)}>
                                <SelectTrigger className="h-8 text-xs bg-background"><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="char_range">Char Range</SelectItem>
                                    <SelectItem value="bbox_2d">BBox 2D</SelectItem>
                                    <SelectItem value="timestamp">Timestamp</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={item.supports_label !== null ? item.supports_label.toString() : "0"} onValueChange={(val) => onUpdateEvidence(index, "supports_label", parseInt(val as string, 10))}>
                                <SelectTrigger className="h-8 text-xs bg-background"><SelectValue/></SelectTrigger>
                                <SelectContent><SelectItem value="0">0 - SAFE</SelectItem><SelectItem value="1">1 - OFFENSIVE</SelectItem><SelectItem value="2">2 - HATE</SelectItem></SelectContent>
                            </Select>
                        </div>

                        {/* Locator inputs */}
                        <div className="p-2.5 rounded bg-muted/30 border border-border/50 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold text-muted-foreground">Locator Details</span>
                                {media && media.type === "image" && item.locator_type === "bbox_2d" && (
                                    <Button type="button" variant={boxEditingIndex === index ? "secondary" : "outline"} size="sm" className="h-6 text-[10px] px-2 gap-1" onClick={() => setBoxEditingIndex(boxEditingIndex === index ? null : index)}>
                                        <Target className="size-3 text-primary"/> {boxEditingIndex === index ? "Đang vẽ..." : "Kéo chọn vùng"}
                                    </Button>
                                )}
                            </div>
                            {item.locator_type === "char_range" && (
                                <div className="grid grid-cols-2 gap-2">
                                    <Input placeholder="char_start" value={item.locator.char_start || ""} onChange={(e) => onUpdateLocator(index, "char_start", e.target.value)} className="h-7 text-xs bg-background"/>
                                    <Input placeholder="char_end" value={item.locator.char_end || ""} onChange={(e) => onUpdateLocator(index, "char_end", e.target.value)} className="h-7 text-xs bg-background"/>
                                </div>
                            )}
                            {item.locator_type === "bbox_2d" && (
                                <Input placeholder="box_2d (ymin, xmin, ymax, xmax)" value={item.locator.box_2d ? item.locator.box_2d.join(", ") : ""} onChange={(e) => onUpdateLocator(index, "box_2d", e.target.value ? e.target.value.split(",").map(n => parseFloat(n.trim())).filter(n => !isNaN(n)) : null)} className="h-7 text-xs bg-background"/>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}