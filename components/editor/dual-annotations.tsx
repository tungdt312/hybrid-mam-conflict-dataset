import React from "react";
import { LabelType } from "@/types/dataset";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LabelBadge } from "@/components/label-badge";
import { CheckCircle2, AlertCircle, HelpCircle, RotateCcw } from "lucide-react";

interface DualAnnotationsProps {
    eval1Label: LabelType | null;
    setEval1Label: (val: LabelType | null) => void;
    eval1Note: string;
    setEval1Note: (val: string) => void;
    eval2Label: LabelType | null;
    setEval2Label: (val: LabelType | null) => void;
    eval2Note: string;
    setEval2Note: (val: string) => void;
}

export function DualAnnotations({ eval1Label, setEval1Label, eval1Note, setEval1Note, eval2Label, setEval2Label, eval2Note, setEval2Note }: DualAnnotationsProps) {
    const hasNull = eval1Label === null || eval2Label === null;
    const isConsensus = !hasNull && eval1Label === eval2Label;
    const isConflict = !hasNull && eval1Label !== eval2Label;

    return (
        <div className="pt-3 border-t border-border space-y-3.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <Label className="text-sm font-bold uppercase tracking-wider text-foreground">
                    Đánh giá Độc lập Song song (Dual Annotations)
                </Label>
                {hasNull ? (
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5"><HelpCircle className="size-4"/> Chờ hoàn tất (null)</span>
                ) : isConsensus ? (
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5"><CheckCircle2 className="size-4"/> Đồng thuận</span>
                ) : (
                    <span className="text-xs font-semibold text-amber-600 flex items-center gap-1.5"><AlertCircle className="size-4"/> Xung đột</span>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl border border-border/80 bg-muted/20">
                {/* Eval 1 */}
                <div className="space-y-3 p-2">
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-1.5">
                            <LabelBadge label={eval1Label} size="sm"/>
                            {eval1Label !== null && (
                                <button type="button" onClick={() => setEval1Label(null)} className="text-muted-foreground hover:text-foreground p-1"><RotateCcw className="size-3"/></button>
                            )}
                        </div>
                        <span className="text-sm font-bold">Đánh giá 1</span>
                    </div>
                    <Select value={eval1Label !== null ? eval1Label.toString() : "NONE"} onValueChange={(val) => setEval1Label(val === "NONE" ? null : parseInt(val as string, 10) as LabelType)}>
                        <SelectTrigger className="h-9 text-xs bg-background"><SelectValue placeholder="Chưa đánh giá"/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="NONE">-- Chưa đánh giá --</SelectItem>
                            <SelectItem value="0">0 - SAFE</SelectItem>
                            <SelectItem value="1">1 - OFFENSIVE</SelectItem>
                            <SelectItem value="2">2 - HATE</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input placeholder="Ghi chú..." value={eval1Note} onChange={(e) => setEval1Note(e.target.value)} className="h-9 text-xs bg-background"/>
                </div>

                {/* Eval 2 */}
                <div className="space-y-3 p-2">
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-1.5">
                            <LabelBadge label={eval2Label} size="sm"/>
                            {eval2Label !== null && (
                                <button type="button" onClick={() => setEval2Label(null)} className="text-muted-foreground hover:text-foreground p-1"><RotateCcw className="size-3"/></button>
                            )}
                        </div>
                        <span className="text-sm font-bold">Đánh giá 2</span>
                    </div>
                    <Select value={eval2Label !== null ? eval2Label.toString() : "NONE"} onValueChange={(val) => setEval2Label(val === "NONE" ? null : parseInt(val as string, 10) as LabelType)}>
                        <SelectTrigger className="h-9 text-xs bg-background"><SelectValue placeholder="Chưa đánh giá"/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="NONE">-- Chưa đánh giá --</SelectItem>
                            <SelectItem value="0">0 - SAFE</SelectItem>
                            <SelectItem value="1">1 - OFFENSIVE</SelectItem>
                            <SelectItem value="2">2 - HATE</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input placeholder="Ghi chú..." value={eval2Note} onChange={(e) => setEval2Note(e.target.value)} className="h-9 text-xs bg-background"/>
                </div>
            </div>
        </div>
    );
}