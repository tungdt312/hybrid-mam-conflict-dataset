import React from "react";
import { DatasetItem } from "@/types/dataset";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LabelBadge } from "@/components/label-badge";
import {
  Image as ImageIcon,
  Video as VideoIcon,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Info,
} from "lucide-react";

interface DatasetCardProps {
  item: DatasetItem;
  isSelected: boolean;
  onSelect: (item: DatasetItem) => void;
}

export function DatasetCard({ item, isSelected, onSelect }: DatasetCardProps) {
  const hasNullLabel = item.eval1.label === null || item.eval2.label === null;
  const isConflict = !hasNullLabel && item.eval1.label !== item.eval2.label;

  return (
    <Card
      onClick={() => onSelect(item)}
      key={item._id}
      className={`overflow-hidden border transition-all cursor-pointer group ${
        isSelected
          ? "ring-2 ring-primary border-primary bg-primary/[0.03] shadow-md"
          : "hover:border-foreground/30 hover:shadow-xs border-border/80 bg-card"
      }`}
    >
      {/* Card Header: Metadata & Status */}
      <div className="px-4 py-3 flex flex-col lg:flex-row items-center justify-between border-b border-border/60 bg-muted/20 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5">
          <span className="font-mono font-bold text-sm sm:text-base text-foreground">
            #{item._id}
          </span>
          <span className="text-muted-foreground text-xs sm:text-sm">
            {new Date(item.createdAt).toLocaleDateString("vi-VN", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isSelected && (
            <Badge className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5">
              ĐANG SỬA TRONG BẢNG
            </Badge>
          )}

          {hasNullLabel ? (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30 flex items-center gap-1.5">
              <HelpCircle className="size-3.5" /> Chờ đánh giá
            </span>
          ) : isConflict ? (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
              <AlertTriangle className="size-3.5" /> Xung đột
            </span>
          ) : (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5" /> Đồng thuận
            </span>
          )}
        </div>
      </div>

      {/* Card Body: Media, Media Description & Text Content */}
      <div className="p-4 space-y-3">
        {/* Media display (Image thumbnail or Video player) */}
        {item.media && (
          <div className="space-y-2">
            <div className="relative rounded-lg overflow-hidden border border-border bg-black/85 max-h-60 flex items-center justify-center">
              {item.media.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.media.url}
                  alt={item.media.description || "Phương tiện mục dữ liệu"}
                  className="w-full max-h-60 object-cover object-center group-hover:scale-[1.01] transition-transform duration-200"
                />
              ) : (
                <video
                  src={item.media.url}
                  controls
                  className="w-full max-h-60 object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/75 text-white text-xs font-semibold uppercase flex items-center gap-1.5 backdrop-blur-xs">
                {item.media.type === "image" ? (
                  <ImageIcon className="size-3" />
                ) : (
                  <VideoIcon className="size-3" />
                )}
                {item.media.type === "image" ? "Hình ảnh" : "Video"}
              </span>
            </div>

            {/* Media Description Caption Badge / Snippet */}
            {item.mediaDescription && (
              <div className="text-xs sm:text-sm text-muted-foreground bg-muted/40 p-2.5 rounded-md border border-border/50 flex items-start gap-2">
                <Info className="size-4 shrink-0 mt-0.5 text-primary" />
                <span className="leading-relaxed">
                  <strong className="text-foreground/90 font-medium">Ngữ cảnh Media: </strong>
                  {item.mediaDescription}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Text Content */}
        {item.text && (
          <p className="text-sm sm:text-base text-foreground/95 font-normal leading-relaxed whitespace-pre-wrap">
            {item.text}
          </p>
        )}
      </div>

      {/* ===================================================== */}
      {/* CARD FOOTER: 50/50 Split Down the Middle (2 Columns) */}
      {/* ===================================================== */}
      <div className="grid grid-cols-2 divide-x divide-border border-t border-border bg-muted/30">
        {/* Left Half: Evaluation 1 */}
        <div className="p-3.5 space-y-1.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Đánh giá 1
            </span>
            <LabelBadge label={item.eval1.label} size="sm" />
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {item.eval1.note || "(Chưa có ghi chú đánh giá)"}
          </p>
        </div>

        {/* Right Half: Evaluation 2 */}
        <div className="p-3.5 space-y-1.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Đánh giá 2
            </span>
            <LabelBadge label={item.eval2.label} size="sm" />
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {item.eval2.note || "(Chưa có ghi chú đánh giá)"}
          </p>
        </div>
      </div>
    </Card>
  );
}
