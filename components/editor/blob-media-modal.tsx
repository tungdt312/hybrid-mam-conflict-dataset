"use client";

import React, { useEffect, useMemo, useState } from "react";
import { BlobStorageItem, MediaData } from "@/types/dataset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Check,
  CheckCircle2,
  Cloud,
  ExternalLink,
  Eye,
  Film,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

interface BlobMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaData) => void;
  currentMediaUrl?: string | null;
}

function formatBytes(bytes: number, decimals = 1) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function isVideoFile(pathnameOrUrl: string): boolean {
  const cleanUrl = pathnameOrUrl.split("?")[0].toLowerCase();
  return (
    cleanUrl.endsWith(".mp4") ||
    cleanUrl.endsWith(".webm") ||
    cleanUrl.endsWith(".mov") ||
    cleanUrl.endsWith(".ogg") ||
    cleanUrl.endsWith(".mkv")
  );
}

export function BlobMediaModal({
  isOpen,
  onClose,
  onSelect,
  currentMediaUrl,
}: BlobMediaModalProps) {
  const [blobs, setBlobs] = useState<BlobStorageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "IMAGE" | "VIDEO">("ALL");
  const [previewItem, setPreviewItem] = useState<BlobStorageItem | null>(null);

  const fetchBlobs = async (loadMore = false) => {
    try {
      if (loadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const params = new URLSearchParams();
      params.set("limit", "60");
      if (loadMore && cursor) {
        params.set("cursor", cursor);
      }

      const res = await fetch(`/api/upload?${params.toString()}`);
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || "Không thể tải danh sách tệp từ Vercel Blob");
      }

      const newBlobs: BlobStorageItem[] = json.data?.blobs || [];
      if (loadMore) {
        setBlobs((prev) => [...prev, ...newBlobs]);
      } else {
        setBlobs(newBlobs);
      }

      setCursor(json.data?.cursor);
      setHasMore(Boolean(json.data?.hasMore));
    } catch (err: any) {
      console.error(err);
      toast.error(`Lỗi tải danh sách tệp: ${err.message}`);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBlobs(false);
    }
  }, [isOpen]);

  // Client-side search and category filtering
  const filteredBlobs = useMemo(() => {
    return blobs.filter((item) => {
      const isVideo = isVideoFile(item.pathname || item.url);
      if (filterType === "IMAGE" && isVideo) return false;
      if (filterType === "VIDEO" && !isVideo) return false;

      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const name = (item.pathname || item.url).toLowerCase();
      return name.includes(query);
    });
  }, [blobs, filterType, searchQuery]);

  const handleSelectBlob = (item: BlobStorageItem) => {
    const isVideo = isVideoFile(item.pathname || item.url);
    const fileName =
      item.pathname?.split("/").pop() || item.url.split("/").pop() || "media";

    onSelect({
      type: isVideo ? "video" : "image",
      url: item.url,
      name: fileName,
      size: item.size,
      isExistingBlob: true,
      uploadedAt: item.uploadedAt,
    });

    toast.success(`Đã chọn: ${fileName}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-card text-card-foreground border border-border rounded-2xl shadow-2xl flex flex-col z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/80 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Cloud className="size-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                Thư viện tệp Vercel Blob
                <Badge variant="outline" className="text-xs font-medium">
                  {blobs.length} tệp
                </Badge>
              </h2>
              <p className="text-xs text-muted-foreground">
                Chọn hình ảnh hoặc video đã được lưu trữ sẵn trên Vercel Blob
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="size-8 rounded-full hover:bg-muted"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Toolbar: Search, Filters, Refresh */}
        <div className="p-4 border-b border-border/60 bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên tệp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center p-0.5 rounded-lg bg-muted/60 border border-border/40 text-xs">
              <button
                type="button"
                onClick={() => setFilterType("ALL")}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  filterType === "ALL"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setFilterType("IMAGE")}
                className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                  filterType === "IMAGE"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ImageIcon className="size-3.5" />
                Ảnh
              </button>
              <button
                type="button"
                onClick={() => setFilterType("VIDEO")}
                className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                  filterType === "VIDEO"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Film className="size-3.5" />
                Video
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchBlobs(false)}
              disabled={isLoading}
              className="h-8.5 px-2.5 text-xs gap-1.5"
            >
              <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Làm mới</span>
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 min-h-[350px] max-h-[55vh]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm">Đang tải danh sách tệp từ Vercel Blob...</p>
            </div>
          ) : filteredBlobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-2">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-1">
                <Cloud className="size-6 opacity-60" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                {searchQuery
                  ? "Không tìm thấy tệp nào phù hợp"
                  : "Chưa có tệp nào trên kho lưu trữ Vercel Blob"}
              </p>
              <p className="text-xs max-w-sm">
                {searchQuery
                  ? `Không có kết quả nào khớp với "${searchQuery}". Hãy thử từ khóa khác.`
                  : "Hãy tải lên tệp mới từ giao diện nhập dữ liệu để lưu vào Vercel Blob."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {filteredBlobs.map((item) => {
                const isVideo = isVideoFile(item.pathname || item.url);
                const isSelected = currentMediaUrl === item.url;
                const fileName =
                  item.pathname?.split("/").pop() ||
                  item.url.split("/").pop() ||
                  "media";
                const dateStr = item.uploadedAt
                  ? new Date(item.uploadedAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : "";

                return (
                  <div
                    key={item.url}
                    onClick={() => handleSelectBlob(item)}
                    className={`group relative flex flex-col rounded-xl border overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/40"
                        : "border-border/70 hover:border-primary/50 bg-card hover:bg-muted/30"
                    }`}
                  >
                    {/* Media Thumbnail */}
                    <div className="relative aspect-4/3 w-full bg-black/90 overflow-hidden flex items-center justify-center">
                      {isVideo ? (
                        <div className="relative w-full h-full flex items-center justify-center bg-zinc-900">
                          <Film className="size-8 text-zinc-500" />
                          <video
                            src={item.url}
                            className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
                            preload="metadata"
                          />
                        </div>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.url}
                          alt={fileName}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      )}

                      {/* Top Badges */}
                      <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 h-4.5 bg-black/70 text-white backdrop-blur-xs font-semibold border-none"
                        >
                          {isVideo ? "VIDEO" : "IMG"}
                        </Badge>
                      </div>

                      <div className="absolute top-2 right-2 z-10">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-black/70 text-zinc-200 backdrop-blur-xs font-mono font-medium">
                          {formatBytes(item.size)}
                        </span>
                      </div>

                      {/* Selection Overlay / Hover Indicator */}
                      {isSelected ? (
                        <div className="absolute inset-0 bg-primary/20 backdrop-blur-none flex items-center justify-center z-10">
                          <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                            <Check className="size-5 stroke-[2.5]" />
                          </div>
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
                          <Button
                            size="sm"
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectBlob(item);
                            }}
                            className="h-7 px-3 text-xs font-semibold shadow-md"
                          >
                            Chọn tệp
                          </Button>
                          <Button
                            size="icon"
                            variant="secondary"
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewItem(item);
                            }}
                            className="size-7 bg-white/90 text-black hover:bg-white shadow-md"
                            title="Xem trước"
                          >
                            <Eye className="size-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Metadata Details */}
                    <div className="p-2.5 flex flex-col justify-between flex-1 gap-1">
                      <div className="flex items-start justify-between gap-1">
                        <span
                          className="text-xs font-medium text-foreground truncate block flex-1"
                          title={fileName}
                        >
                          {fileName}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="size-3.5 text-primary shrink-0 mt-0.5" />
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>{dateStr}</span>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-foreground"
                          title="Mở tab mới"
                        >
                          <ExternalLink className="size-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Load More Button */}
          {hasMore && (
            <div className="pt-4 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchBlobs(true)}
                disabled={isLoadingMore}
                className="text-xs h-8 px-4 gap-2"
              >
                {isLoadingMore && <Loader2 className="size-3.5 animate-spin" />}
                Tải thêm tệp khác
              </Button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-border/80 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Đã hiển thị {filteredBlobs.length} / {blobs.length} tệp
          </span>
          <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
            Đóng
          </Button>
        </div>
      </div>

      {/* Lightbox / Zoom Preview */}
      {previewItem && (
        <div
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="relative max-w-4xl max-h-[85vh] bg-card rounded-xl overflow-hidden border border-border shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
              <span className="text-xs font-semibold truncate max-w-md">
                {previewItem.pathname || previewItem.url}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPreviewItem(null)}
                className="size-7"
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="p-2 bg-black/95 flex items-center justify-center max-h-[70vh] overflow-hidden">
              {isVideoFile(previewItem.url) ? (
                <video src={previewItem.url} controls autoPlay className="max-h-[65vh] w-auto" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewItem.url}
                  alt="Preview"
                  className="max-h-[65vh] max-w-full object-contain"
                />
              )}
            </div>
            <div className="p-3 border-t border-border bg-card flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                Kích thước: {formatBytes(previewItem.size)}
              </span>
              <Button
                size="sm"
                onClick={() => {
                  handleSelectBlob(previewItem);
                  setPreviewItem(null);
                }}
                className="h-8 text-xs font-semibold"
              >
                <Check className="size-3.5 mr-1.5" />
                Chọn tệp này
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
