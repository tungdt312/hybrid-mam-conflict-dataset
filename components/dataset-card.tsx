import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LabelBadge } from "@/components/label-badge";
import {
  Image as ImageIcon,
  Film,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { SampleData } from "@/types/dataset";

interface DatasetCardProps {
  item: SampleData;
  isSelected: boolean;
  onSelect: (item: SampleData) => void;
}

export function DatasetCard({ item, isSelected, onSelect }: DatasetCardProps) {
  const { modality_type, metadata, raw_inputs, agent_extracted_context, gold_annotation, eval1, eval2 } = item;

  const hasNullLabel = eval1?.label === null || eval2?.label === null;
  const isConflict = !hasNullLabel && eval1?.label !== eval2?.label;

  return (
      <Card
          onClick={() => onSelect(item)}
          className={`overflow-hidden border transition-all cursor-pointer group ${
              isSelected
                  ? "ring-2 ring-primary border-primary bg-primary/[0.03] shadow-md"
                  : "hover:border-foreground/30 hover:shadow-xs border-border/80 bg-card"
          }`}
      >
        {/* Card Header: ID, Modality & Language & Trạng thái đánh giá kép */}
        <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-b border-border/60 bg-muted/20 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
          <span className="font-mono font-bold text-sm sm:text-base text-foreground">
            #{item._id}
          </span>
            <Badge variant="outline" className="font-mono text-[10px] uppercase">
              {modality_type}
            </Badge>
            <Badge variant="secondary" className="text-[10px] uppercase">
              {metadata?.language || "vi"}
            </Badge>
          </div>

          <div className="flex items-center gap-2 mt-1 sm:mt-0">
            {isSelected && (
                <Badge className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5">
                  ĐANG CHỈNH SỬA
                </Badge>
            )}

            {hasNullLabel ? (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30 flex items-center gap-1">
              <HelpCircle className="size-3" /> Chờ đánh giá
            </span>
            ) : isConflict ? (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
              <AlertTriangle className="size-3" /> Xung đột
            </span>
            ) : (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="size-3" /> Đồng thuận
            </span>
            )}
          </div>
        </div>

        {/* Card Body: Raw Inputs & Agent Context */}
        <div className="p-4 space-y-3">
          {raw_inputs?.text && (
              <p className="text-sm sm:text-base text-foreground/95 font-normal leading-relaxed whitespace-pre-wrap">
                {raw_inputs.text}
              </p>
          )}

          {raw_inputs?.image_path && (
              <div className="relative rounded-lg overflow-hidden border border-border bg-black/85 max-h-50 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={raw_inputs.image_path}
                    alt="Raw Input Image"
                    className="w-full max-h-50 object-cover"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 text-white text-xs font-semibold flex items-center gap-1">
              <ImageIcon className="size-3" /> Hình ảnh đầu vào
            </span>
              </div>
          )}

          {raw_inputs?.video_path && (
              <div className="relative rounded-lg overflow-hidden border border-border bg-black/85 max-h-50 flex items-center justify-center">
                <video
                    src={raw_inputs.video_path}
                    controls
                    className="w-full max-h-50 object-cover"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 text-white text-xs font-semibold flex items-center gap-1">
              <Film className="size-3" /> Video đầu vào
            </span>
              </div>
          )}

          {agent_extracted_context?.vision_context && (
              <div className="text-xs bg-muted/40 p-2.5 rounded-md border border-border/50 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-primary">
                  <Cpu className="size-3.5" /> OCR & Vision AI Context:
                </div>
                <p className="text-muted-foreground italic">"{agent_extracted_context.vision_context.ocr_text || agent_extracted_context.vision_context.image_caption}"</p>
              </div>
          )}
        </div>

        {/* Card Footer: 50/50 Split cho eval1 và eval2 */}
        <div className="grid grid-cols-2 divide-x divide-border border-t border-border bg-muted/30">
          <div className="p-3.5 space-y-1.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Đánh giá 1
            </span>
              <LabelBadge label={eval1?.label} size="sm" />
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {eval1?.note || "(Chưa có ghi chú)"}
            </p>
          </div>

          <div className="p-3.5 space-y-1.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Đánh giá 2
            </span>
              <LabelBadge label={eval2?.label} size="sm" />
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {eval2?.note || "(Chưa có ghi chú)"}
            </p>
          </div>
        </div>
      </Card>
  );
}