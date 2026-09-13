"use client";

import React, { useState, useMemo, useEffect } from "react";
import { DatasetItem, LabelType, MediaData } from "@/types/dataset";
import { EditorPanel } from "@/components/editor-panel";
import { DataListPanel, FilterCategory } from "@/components/data-list-panel";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Layers,
  Database,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
} from "lucide-react";

export function DatasetAnnotator() {
  // Dataset collection state
  const [items, setItems] = useState<DatasetItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  // Search & Filter state for Right Column
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterCategory>("ALL");

  // Form states (Left Column) - Mặc định là null
  const [text, setText] = useState("");
  const [media, setMedia] = useState<MediaData | null>(null);
  const [mediaDescription, setMediaDescription] = useState("");
  const [eval1Label, setEval1Label] = useState<LabelType | null>(null);
  const [eval1Note, setEval1Note] = useState("");
  const [eval2Label, setEval2Label] = useState<LabelType | null>(null);
  const [eval2Note, setEval2Note] = useState("");

  const isEditMode = activeItemId !== null;

  // Lấy danh sách dataset từ MongoDB khi component được mount
  const fetchDataset = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/dataset');
      const result = await res.json();
      if (result.success) {
        setItems(result.data);
      } else {
        toast.error("Không thể tải danh sách từ cơ sở dữ liệu.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi kết nối khi tải dữ liệu.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDataset();
  }, []);

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      toast.error("Định dạng không được hỗ trợ. Vui lòng tải lên hình ảnh hoặc video.");
      return;
    }

    const toastId = toast.loading("Đang tải tệp lên đám mây...");

    try {
      // 1. Gọi API upload file lên server/cloud
      const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: file, // Truyền trực tiếp file binary
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Tải lên thất bại");
      }

      // 2. Nhận lại URL thật từ cloud (ví dụ: https://xxxx.public.blob.vercel-storage.com/...)
      const fileUrl = result.data.url;

      // 3. Cập nhật state media với URL thật
      setMedia({
        type: isImage ? "image" : "video",
        url: fileUrl, // URL lưu vào MongoDB
        name: file.name,
        size: file.size,
        description: mediaDescription,
      });

      toast.dismiss(toastId);
      toast.success(`Đã tải lên thành công ${isImage ? "hình ảnh" : "video"}!`);
    } catch (error: any) {
      console.error(error);
      toast.dismiss(toastId);
      toast.error(`Lỗi tải lên: ${error.message}`);
    }
  };
  // Remove uploaded media in Create Mode
  const handleRemoveMedia = async () => {
    if (!media || !media.url) {
      setMedia(null);
      return;
    }

    const fileUrlToDelete = media.url;

    // Gỡ hiển thị trước trên giao diện ngay lập tức cho mượt
    setMedia(null);
    const toastId = toast.loading("Đang xóa tệp khỏi đám mây...");

    try {
      const res = await fetch(`/api/upload?url=${encodeURIComponent(fileUrlToDelete)}`, {
        method: 'DELETE',
      });

      const result = await res.json();
      if (result.success) {
        toast.dismiss(toastId);
        toast.success("Đã gỡ và xóa tệp thành công khỏi đám mây.");
      } else {
        toast.dismiss(toastId);
        toast.error(`Không thể xóa tệp trên cloud: ${result.error}`);
      }
    } catch (error) {
      console.error(error);
      toast.dismiss(toastId);
      toast.error("Lỗi kết nối khi xóa tệp.");
    }
  };

  // Reset / Cancel form (đưa đánh giá về mặc định là null)
  const handleCancelEdit = () => {
    setActiveItemId(null);
    setText("");
    setMedia(null);
    setMediaDescription("");
    setEval1Label(null);
    setEval1Note("");
    setEval2Label(null);
    setEval2Note("");
  };

  // Select card from list -> shift to Edit Mode
  const handleSelectCard = (item: DatasetItem) => {
    setActiveItemId(item._id);
    setText(item.text);
    setMedia(item.media || null);
    setMediaDescription(item.mediaDescription || item.media?.description || "");
    setEval1Label(item.eval1.label);
    setEval1Note(item.eval1.note);
    setEval2Label(item.eval2.label);
    setEval2Note(item.eval2.note);
    toast.info(`Đang chỉnh sửa đánh giá cho #${item._id}. Nội dung văn bản & media gốc đã khóa.`);
  };

  // Create Data (Create Mode) -> Gọi API POST `/api/dataset`
  const handleCreateData = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim() && !media) {
      toast.error("Vui lòng cung cấp ít nhất nội dung văn bản hoặc đính kèm tệp phương tiện.");
      return;
    }

    const newPayload = {
      text: text.trim(),
      mediaDescription: mediaDescription.trim() || undefined,
      media: media
          ? {
            ...media,
            description: mediaDescription.trim() || undefined,
          }
          : null,
      eval1: {
        label: eval1Label,
        note: eval1Note.trim(),
      },
      eval2: {
        label: eval2Label,
        note: eval2Note.trim(),
      },
    };

    try {
      const res = await fetch('/api/dataset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPayload),
      });

      const result = await res.json();
      if (result.success) {
        setItems((prev) => [result.data, ...prev]);
        toast.success(`Đã tạo thành công mục dữ liệu mới #${result.data.id}`);
        handleCancelEdit();
      } else {
        toast.error(`Lỗi: ${result.error}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Không thể kết nối tới server khi tạo dữ liệu.");
    }
  };

  // Save Changes (Edit Mode) -> Gọi API PUT `/api/dataset/[id]`
  const handleSaveChanges = async () => {
    if (!activeItemId) return;

    const updatePayload = {
      eval1: {
        label: eval1Label,
        note: eval1Note.trim(),
      },
      eval2: {
        label: eval2Label,
        note: eval2Note.trim(),
      },
    };

    try {
      const res = await fetch(`/api/dataset/${activeItemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      const result = await res.json();
      if (result.success) {
        setItems((prev) =>
            prev.map((item) => (item._id === activeItemId ? result.data : item))
        );
        toast.success(`Đã lưu cập nhật đánh giá cho #${activeItemId}`);
        handleCancelEdit();
      } else {
        toast.error(`Lỗi: ${result.error}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi cập nhật dữ liệu lên server.");
    }
  };

  // Delete Data (Edit Mode) -> Gọi API DELETE `/api/dataset/[id]`
  // Xóa Data (Edit Mode) -> Xóa cả file trên Vercel Blob (nếu có) và gọi API DELETE `/api/dataset/[id]`
  const handleDeleteData = async () => {
    if (!activeItemId) return;
    const toDeleteId = activeItemId;

    // Lấy thông tin media của item đang chọn để xóa file cloud nếu tồn tại
    const currentItem = items.find((item) => item._id === toDeleteId);
    const mediaUrlToDelete = currentItem?.media?.url;

    const toastId = toast.loading("Đang xóa bản ghi và tệp liên quan...");

    try {
      // 1. Nếu có đính kèm media trên cloud, gọi API xóa file trước
      if (mediaUrlToDelete) {
        try {
          await fetch(`/api/upload?url=${encodeURIComponent(mediaUrlToDelete)}`, {
            method: 'DELETE',
          });
        } catch (mediaError) {
          console.error("Không thể xóa file trên cloud, tiếp tục xóa bản ghi DB:", mediaError);
        }
      }

      // 2. Gọi API xóa bản ghi trong MongoDB
      const res = await fetch(`/api/dataset/${toDeleteId}`, {
        method: 'DELETE',
      });

      const result = await res.json();
      if (result.success) {
        setItems((prev) => prev.filter((item) => item._id !== toDeleteId));
        toast.dismiss(toastId);
        toast.error(`Đã xóa vĩnh viễn mục #${toDeleteId} và tệp đính kèm khỏi hệ thống.`);
        handleCancelEdit();
      } else {
        toast.dismiss(toastId);
        toast.error(`Lỗi: ${result.error}`);
      }
    } catch (error) {
      console.error(error);
      toast.dismiss(toastId);
      toast.error("Lỗi kết nối khi xóa bản ghi.");
    }
  };

  // Seeding nhanh dữ liệu mẫu nếu DB trống
  const handleSeedData = async () => {
    try {
      const res = await fetch('/api/dataset/seed', { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        toast.success(result.message);
        fetchDataset(); // Tải lại danh sách sau khi seed
      } else {
        toast.error(`Lỗi seed: ${result.error}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Không thể thực hiện nạp dữ liệu mẫu.");
    }
  };

  // Export structured JSON
  const handleExportJSON = () => {
    const exportData = {
      dataset_name: "hybrid_mam_conflict_dataset",
      exported_at: new Date().toISOString(),
      total_items: items.length,
      conflict_count: items.filter(
          (i) => i.eval1.label !== null && i.eval2.label !== null && i.eval1.label !== i.eval2.label
      ).length,
      consensus_count: items.filter(
          (i) => i.eval1.label !== null && i.eval2.label !== null && i.eval1.label === i.eval2.label
      ).length,
      pending_count: items.filter((i) => i.eval1.label === null || i.eval2.label === null).length,
      items: items.map((item) => {
        const isPending = item.eval1.label === null || item.eval2.label === null;
        const status = isPending
            ? "PENDING"
            : item.eval1.label === item.eval2.label
                ? "CONSENSUS"
                : "CONFLICT";

        return {
          id: item._id,
          text: item.text,
          media_description: item.mediaDescription || null,
          media: item.media
              ? {
                type: item.media.type,
                name: item.media.name,
                url: item.media.url,
                size_bytes: item.media.size || null,
                description: item.media.description || item.mediaDescription || null,
              }
              : null,
          evaluation_1: {
            annotator: "Người đánh giá 1",
            label: item.eval1.label,
            note: item.eval1.note,
          },
          evaluation_2: {
            annotator: "Người đánh giá 2",
            label: item.eval2.label,
            note: item.eval2.note,
          },
          status,
          created_at: item.createdAt,
          updated_at: item.updatedAt || item.createdAt,
        };
      }),
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(exportData, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute(
        "download",
        `hybrid_mam_dataset_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    toast.success(`Đã xuất thành công ${items.length} mục dữ liệu ra tệp JSON.`);
  };

  // Filtered dataset items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
          !searchQuery.trim() ||
          item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.eval1.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.eval2.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.mediaDescription && item.mediaDescription.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      const hasNull = item.eval1.label === null || item.eval2.label === null;

      if (filterType === "ALL") return true;
      if (filterType === "PENDING") return hasNull;
      if (filterType === "CONFLICT") return !hasNull && item.eval1.label !== item.eval2.label;
      if (filterType === "CONSENSUS") return !hasNull && item.eval1.label === item.eval2.label;
      return item.eval1.label === filterType || item.eval2.label === filterType;
    });
  }, [items, searchQuery, filterType]);

  // Metric counters
  const pendingCount = useMemo(
      () => items.filter((i) => i.eval1.label === null || i.eval2.label === null).length,
      [items]
  );
  const conflictCount = useMemo(
      () =>
          items.filter(
              (i) => i.eval1.label !== null && i.eval2.label !== null && i.eval1.label !== i.eval2.label
          ).length,
      [items]
  );
  const consensusCount = useMemo(
      () =>
          items.filter(
              (i) => i.eval1.label !== null && i.eval2.label !== null && i.eval1.label === i.eval2.label
          ).length,
      [items]
  );

  return (
      <div className="w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Top Banner / Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border/80">
          <div>
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-xs">
                <Database className="size-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                  Công cụ Tạo & Gán nhãn Tập dữ liệu (MongoDB)
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-0.5">
                  Môi trường đánh giá đa phương thức lưu trữ trực tiếp trên cơ sở dữ liệu MongoDB Atlas.
                </p>
              </div>
            </div>
          </div>

          {/* Global Statistics Chips & Actions */}
          <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
            {items.length === 0 && !isLoading && (
                <button
                    onClick={handleSeedData}
                    className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <RefreshCw className="size-3.5" /> Nạp dữ liệu mẫu
                </button>
            )}

            <Badge variant="outline" className="px-3.5 py-1.5 font-semibold bg-card gap-2 text-xs sm:text-sm">
              <Layers className="size-4 text-muted-foreground" />
              Tổng cộng: <span className="text-foreground font-bold">{items.length}</span>
            </Badge>
            <Badge
                variant="outline"
                className="px-3.5 py-1.5 font-semibold bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/25 gap-2 text-xs sm:text-sm"
            >
              <HelpCircle className="size-4" />
              Chờ đánh giá: <span className="font-bold">{pendingCount}</span>
            </Badge>
            <Badge
                variant="outline"
                className="px-3.5 py-1.5 font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25 gap-2 text-xs sm:text-sm"
            >
              <AlertCircle className="size-4" />
              Xung đột: <span className="font-bold">{conflictCount}</span>
            </Badge>
            <Badge
                variant="outline"
                className="px-3.5 py-1.5 font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25 gap-2 text-xs sm:text-sm"
            >
              <CheckCircle2 className="size-4" />
              Đồng thuận: <span className="font-bold">{consensusCount}</span>
            </Badge>

            {/* Theme Toggle Button */}
            <ThemeToggle />
          </div>
        </header>

        {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <RefreshCw className="size-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Đang đồng bộ dữ liệu từ MongoDB...</p>
            </div>
        ) : (
            /* 50/50 Desktop Split Layout */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
              {/* LEFT COLUMN: Form & Editor Panel Component */}
              <EditorPanel
                  isEditMode={isEditMode}
                  activeItemId={activeItemId}
                  text={text}
                  setText={setText}
                  media={media}
                  mediaDescription={mediaDescription}
                  setMediaDescription={setMediaDescription}
                  eval1Label={eval1Label}
                  setEval1Label={setEval1Label}
                  eval1Note={eval1Note}
                  setEval1Note={setEval1Note}
                  eval2Label={eval2Label}
                  setEval2Label={setEval2Label}
                  eval2Note={eval2Note}
                  setEval2Note={setEval2Note}
                  onFileUpload={handleFileUpload}
                  onRemoveMedia={handleRemoveMedia}
                  onCreateData={handleCreateData}
                  onSaveChanges={handleSaveChanges}
                  onCancelEdit={handleCancelEdit}
                  onDeleteData={handleDeleteData}
              />

              {/* RIGHT COLUMN: Data List & Export Panel Component */}
              <DataListPanel
                  items={items}
                  filteredItems={filteredItems}
                  activeItemId={activeItemId}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  filterType={filterType}
                  setFilterType={setFilterType}
                  conflictCount={conflictCount}
                  consensusCount={consensusCount}
                  pendingCount={pendingCount}
                  onSelectCard={handleSelectCard}
                  onExportJSON={handleExportJSON}
              />
            </div>
        )}
      </div>
  );
}