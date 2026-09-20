"use client";

import React, {useEffect, useMemo, useState} from "react";
import {EvidenceSource, LabelType, MediaData, SampleData} from "@/types/dataset";
import {EditorPanel} from "@/components/editor/editor-panel";
import {DataListPanel, FilterCategory} from "@/components/data-list-panel";
import {ThemeToggle} from "@/components/theme-toggle";
import {Badge} from "@/components/ui/badge";
import {toast} from "sonner";
import {AlertCircle, CheckCircle2, Database, HelpCircle, Layers, RefreshCw,} from "lucide-react";

export function DatasetAnnotator() {
    // Dataset collection state
    const [items, setItems] = useState<SampleData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [activeItemId, setActiveItemId] = useState<string | null>(null);

    // Search & Filter state for Right Column
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<FilterCategory>("ALL");

    // Form states (Left Column) tương thích chuẩn SampleData mới
    const [text, setText] = useState("");
    const [media, setMedia] = useState<MediaData | null>(null);
    const [mediaDescription, setMediaDescription] = useState("");

    // Các trường bổ sung theo chuẩn Schema mới
    const [modalityType, setModalityType] = useState<"TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "MIX">("TEXT");
    const [language, setLanguage] = useState<"vi" | "en">("vi");

    // Gold Annotation states
    const [goldDecision, setGoldDecision] = useState<"PASS" | "REVIEW" | "BLOCK">("REVIEW");
    const [goldLabel, setGoldLabel] = useState<LabelType | null>(null);
    const [goldExplanation, setGoldExplanation] = useState("");
    const [evidenceSources, setEvidenceSources] = useState<EvidenceSource[]>([]);

    // Agent extracted contexts for media
    const [ocrText, setOcrText] = useState("");
    const [imageCaption, setImageCaption] = useState("");
    const [videoDuration, setVideoDuration] = useState<number>(0);
    const [videoCaption, setVideoCaption] = useState("");

    // Dual annotations (eval1 & eval2 với LabelType | null)[cite: 12]
    const [eval1Label, setEval1Label] = useState<LabelType | null>(null);
    const [eval1Note, setEval1Note] = useState("");
    const [eval2Label, setEval2Label] = useState<LabelType | null>(null);
    const [eval2Note, setEval2Note] = useState("");

    const isEditMode = activeItemId !== null;

    // Lấy danh sách dataset từ API/MongoDB khi component được mount
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

    // Evidence Sources handlers
    const handleRemoveEvidence = (index: number) => {
        setEvidenceSources((prev) => prev.filter((_, i) => i !== index));
    };
    const handleAddEvidence = () => {
        setEvidenceSources((prev) => [
            ...prev,
            {
                modality: "TEXT",
                locator_type: "char_range",
                locator: {
                    char_start: null,
                    char_end: null,
                    box_2d: null,
                    start_second: null,
                    end_second: null,
                },
                supports_label: 0,
            },
        ]);
    };

// Cập nhật trường chính của evidence source (modality, locator_type, supports_label)
    const handleUpdateEvidence = (index: number, field: keyof EvidenceSource, val: any) => {
        setEvidenceSources((prev) => {
            const updated = [...prev];
            updated[index] = {...updated[index], [field]: val};
            return updated;
        });
    };

// Cập nhật chi tiết bên trong thuộc tính locator
    const handleUpdateLocator = (index: number, locatorField: string, val: any) => {
        setEvidenceSources((prev) => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                locator: {
                    ...updated[index].locator,
                    [locatorField]: val, // Cập nhật trường con trong locator, ví dụ 'box_2d'
                },
            };
            return updated;
        });
    };
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
            const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
                method: 'POST',
                body: file,
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || "Tải lên thất bại");
            }

            const fileUrl = result.data.url;

            setMedia({
                type: isImage ? "image" : "video",
                url: fileUrl,
                name: file.name,
                size: file.size,
                description: mediaDescription,
            });

            if (modalityType === "TEXT") {
                setModalityType(isImage ? "IMAGE" : "VIDEO");
            }

            toast.dismiss(toastId);
            toast.success(`Đã tải lên thành công ${isImage ? "hình ảnh" : "video"}!`);
        } catch (error: any) {
            console.error(error);
            toast.dismiss(toastId);
            toast.error(`Lỗi tải lên: ${error.message}`);
        }
    };

    // Remove uploaded media
    const handleRemoveMedia = async () => {
        if (!media || !media.url) {
            setMedia(null);
            setModalityType("TEXT");
            return;
        }

        // Nếu tệp này được chọn từ Vercel Blob (ảnh cũ có sẵn), chỉ gỡ khỏi biểu mẫu, không xóa trên đám mây
        if (media.isExistingBlob) {
            setMedia(null);
            setModalityType("TEXT");
            toast.info("Đã gỡ tệp khỏi biểu mẫu (tệp vẫn được giữ an toàn trên Vercel Blob).");
            return;
        }

        const fileUrlToDelete = media.url;
        setMedia(null);
        setModalityType("TEXT");
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

    // Chọn ảnh/video cũ có sẵn từ Vercel Blob
    const handleSelectExistingMedia = (selectedMedia: MediaData) => {
        setMedia(selectedMedia);
        if (modalityType === "TEXT") {
            setModalityType(selectedMedia.type === "image" ? "IMAGE" : "VIDEO");
        }
    };

    // Reset / Cancel form
    const handleCancelEdit = () => {
        setActiveItemId(null);
        setText("");
        setMedia(null);
        setMediaDescription("");
        setModalityType("TEXT");
        setLanguage("vi");
        setGoldDecision("REVIEW");
        setGoldLabel(null);
        setGoldExplanation("");
        setEvidenceSources([]);
        setOcrText("");
        setImageCaption("");
        setVideoDuration(0);
        setVideoCaption("");
        setEval1Label(null);
        setEval1Note("");
        setEval2Label(null);
        setEval2Note("");
    };

    // Select card from list -> shift to Edit Mode
    const handleSelectCard = (item: SampleData) => {
        setActiveItemId(item._id);
        setText(item.raw_inputs.text || "");

        if (item.raw_inputs.image_path) {
            setMedia({
                type: "image",
                url: item.raw_inputs.image_path,
                name: item.raw_inputs.image_path.split("/").pop() || "image",
                description: item.agent_extracted_context?.vision_context?.image_caption || "",
            });
        } else if (item.raw_inputs.video_path) {
            setMedia({
                type: "video",
                url: item.raw_inputs.video_path,
                name: item.raw_inputs.video_path.split("/").pop() || "video",
                description: item.agent_extracted_context?.video_context?.video_caption || "",
            });
        } else {
            setMedia(null);
        }

        setMediaDescription(
            item.agent_extracted_context?.vision_context?.image_caption ||
            item.agent_extracted_context?.video_context?.video_caption || ""
        );

        setModalityType(item.modality_type);
        setLanguage(item.metadata?.language || "vi");

        // Khôi phục Gold Annotation
        setGoldDecision(item.gold_annotation?.decision || "REVIEW");
        setGoldLabel(item.gold_annotation?.label !== undefined ? item.gold_annotation.label : null);
        setGoldExplanation(item.gold_annotation?.explanation_vi || "");
        setEvidenceSources(item.gold_annotation?.evidence_sources || []);

        // Khôi phục Context media
        setOcrText(item.agent_extracted_context?.vision_context?.ocr_text || "");
        setImageCaption(item.agent_extracted_context?.vision_context?.image_caption || "");
        setVideoDuration(item.agent_extracted_context?.video_context?.duration_seconds || 0);
        setVideoCaption(item.agent_extracted_context?.video_context?.video_caption || "");

        // Khôi phục Dual evaluations
        setEval1Label(item.eval1.label);
        setEval1Note(item.eval1.note);
        setEval2Label(item.eval2.label);
        setEval2Note(item.eval2.note);

        toast.info(`Đang chỉnh sửa đánh giá cho mục #${item._id}.`);
    };

    // Create Data (Create Mode)
    const handleCreateData = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!text.trim() && !media) {
            toast.error("Vui lòng cung cấp ít nhất nội dung văn bản hoặc đính kèm tệp phương tiện.");
            return;
        }

        const newPayload: Partial<SampleData> = {
            modality_type: modalityType,
            metadata: {
                language: language,
            },
            raw_inputs: {
                text: text.trim() || null,
                image_path: media?.type === "image" ? media.url : null,
                audio_path: null,
                video_path: media?.type === "video" ? media.url : null,
            },
            agent_extracted_context: {
                vision_context: media?.type === "image" ? {
                    ocr_text: ocrText.trim(),
                    image_caption: imageCaption.trim() || mediaDescription.trim(),
                    detected_objects: [],
                } : null,
                audio_context: null,
                video_context: media?.type === "video" ? {
                    duration_seconds: videoDuration,
                    video_caption: videoCaption.trim() || mediaDescription.trim(),
                } : null,
            },
            gold_annotation: {
                decision: goldDecision,
                label: goldLabel || null,
                evidence_sources: evidenceSources,
                reasoning_log: [],
                explanation_vi: goldExplanation.trim() || "Chưa có giải thích chi tiết.",
            },
            eval1: {
                label: eval1Label,
                note: eval1Note.trim(),
            },
            eval2: {
                label: eval2Label,
                note: eval2Note.trim(),
            },
        };

        // Lưu lại URL tệp hiện tại để phòng trường hợp cần rollback (chỉ dọn dẹp nếu là tệp vừa tải mới, không xóa ảnh cũ từ Blob)
        const shouldCleanupOnFail = media?.url && !media.isExistingBlob;
        const uploadedFileUrl = shouldCleanupOnFail ? media.url : null;

        try {
            const res = await fetch('/api/dataset', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(newPayload),
            });

            const result = await res.json();
            if (result.success) {
                setItems((prev) => [result.data, ...prev]);
                toast.success(`Đã tạo thành công mục dữ liệu mới #${result.data._id}`);
                handleCancelEdit();
            } else {
                // Nếu API trả về thất bại, tiến hành xóa tệp đã tải lên trước đó (nếu có)
                if (uploadedFileUrl) {
                    try {
                        await fetch(`/api/upload?url=${encodeURIComponent(uploadedFileUrl)}`, {
                            method: 'DELETE',
                        });
                    } catch (cleanupErr) {
                        console.error("Lỗi khi dọn dẹp tệp mồ côi:", cleanupErr);
                    }
                }
                toast.error(`Lỗi: ${result.error}`);
            }
        } catch (error) {
            console.error(error);

            // Nếu xảy ra lỗi mạng hoặc ngoại lệ trong quá trình gọi API, xóa tệp đã tải lên
            if (uploadedFileUrl) {
                try {
                    await fetch(`/api/upload?url=${encodeURIComponent(uploadedFileUrl)}`, {
                        method: 'DELETE',
                    });
                } catch (cleanupErr) {
                    console.error("Lỗi khi dọn dẹp tệp mồ côi:", cleanupErr);
                }
            }

            toast.error("Không thể kết nối tới server khi tạo dữ liệu.");
        }
    };

    // Save Changes (Edit Mode)
    const handleSaveChanges = async () => {
        if (!activeItemId) return;

        const updatePayload = {
            modality_type: modalityType,
            metadata: {language},
            gold_annotation: {
                decision: goldDecision,
                label: goldLabel,
                evidence_sources: evidenceSources,
                explanation_vi: goldExplanation.trim(),
            },
            agent_extracted_context: {
                vision_context: media?.type === "image" ? {
                    ocr_text: ocrText.trim(),
                    image_caption: imageCaption.trim(),
                    detected_objects: [],
                } : null,
                video_context: media?.type === "video" ? {
                    duration_seconds: videoDuration,
                    video_caption: videoCaption.trim(),
                } : null,
            },
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
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(updatePayload),
            });

            const result = await res.json();
            if (result.success) {
                setItems((prev) =>
                    prev.map((item) => (item._id === activeItemId ? result.data : item))
                );
                toast.success(`Đã lưu cập nhật cho #${activeItemId}`);
                handleCancelEdit();
            } else {
                toast.error(`Lỗi: ${result.error}`);
            }
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi cập nhật dữ liệu lên server.");
        }
    };

    // Delete Data (Edit Mode)
    const handleDeleteData = async () => {
        if (!activeItemId) return;
        const toDeleteId = activeItemId;

        const currentItem = items.find((item) => item._id === toDeleteId);
        const mediaUrlToDelete = currentItem?.raw_inputs?.image_path || currentItem?.raw_inputs?.video_path;

        const toastId = toast.loading("Đang xóa bản ghi và tệp liên quan...");

        try {
            if (mediaUrlToDelete) {
                try {
                    await fetch(`/api/upload?url=${encodeURIComponent(mediaUrlToDelete)}`, {
                        method: 'DELETE',
                    });
                } catch (mediaError) {
                    console.error("Không thể xóa file trên cloud:", mediaError);
                }
            }

            const res = await fetch(`/api/dataset/${toDeleteId}`, {
                method: 'DELETE',
            });

            const result = await res.json();
            if (result.success) {
                setItems((prev) => prev.filter((item) => item._id !== toDeleteId));
                toast.dismiss(toastId);
                toast.error(`Đã xóa vĩnh viễn mục #${toDeleteId}.`);
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

    // Seeding nhanh dữ liệu mẫu
    const handleSeedData = async () => {
        try {
            const res = await fetch('/api/dataset/seed', {method: 'POST'});
            const result = await res.json();
            if (result.success) {
                toast.success(result.message);
                fetchDataset();
            } else {
                toast.error(`Lỗi seed: ${result.error}`);
            }
        } catch (error) {
            console.error(error);
            toast.error("Không thể thực hiện nạp dữ liệu mẫu.");
        }
    };

    // Export structured JSON theo chuẩn SampleData interface
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
            items: items,
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

        toast.success(`Đã xuất thành công ${items.length} mục dữ liệu ra tệp JSON chuẩn.`);
    };

    // Filtered dataset items
    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const textContent = item.raw_inputs.text || "";
            const visionCap = item.agent_extracted_context?.vision_context?.image_caption || "";
            const videoCap = item.agent_extracted_context?.video_context?.video_caption || "";

            const matchesSearch =
                !searchQuery.trim() ||
                textContent.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.eval1.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.eval2.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
                visionCap.toLowerCase().includes(searchQuery.toLowerCase()) ||
                videoCap.toLowerCase().includes(searchQuery.toLowerCase());

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
            <header
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border/80">
                <div>
                    <div className="flex items-center gap-3">
                        <div
                            className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-xs">
                            <Database className="size-6"/>
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
                            className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                            <RefreshCw className="size-3.5"/> Nạp dữ liệu mẫu
                        </button>
                    )}

                    <Badge variant="outline" className="px-3.5 py-1.5 font-semibold bg-card gap-2 text-xs sm:text-sm">
                        <Layers className="size-4 text-muted-foreground"/>
                        Tổng cộng: <span className="text-foreground font-bold">{items.length}</span>
                    </Badge>
                    <Badge
                        variant="outline"
                        className="px-3.5 py-1.5 font-semibold bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/25 gap-2 text-xs sm:text-sm"
                    >
                        <HelpCircle className="size-4"/>
                        Chờ đánh giá: <span className="font-bold">{pendingCount}</span>
                    </Badge>
                    <Badge
                        variant="outline"
                        className="px-3.5 py-1.5 font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25 gap-2 text-xs sm:text-sm"
                    >
                        <AlertCircle className="size-4"/>
                        Xung đột: <span className="font-bold">{conflictCount}</span>
                    </Badge>
                    <Badge
                        variant="outline"
                        className="px-3.5 py-1.5 font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25 gap-2 text-xs sm:text-sm"
                    >
                        <CheckCircle2 className="size-4"/>
                        Đồng thuận: <span className="font-bold">{consensusCount}</span>
                    </Badge>

                    {/* Theme Toggle Button */}
                    <ThemeToggle/>
                </div>
            </header>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <RefreshCw className="size-8 animate-spin text-primary"/>
                    <p className="text-sm text-muted-foreground">Đang đồng bộ dữ liệu từ MongoDB...</p>
                </div>
            ) : (
                /* 50/50 Desktop Split Layout */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
                    {/* LEFT COLUMN: Form & Editor Panel Component */}
                    <EditorPanel
                        isEditMode={isEditMode}
                        activeItemId={activeItemId}
                        modalityType={modalityType}
                        setModalityType={setModalityType}
                        language={language}
                        setLanguage={setLanguage}
                        goldDecision={goldDecision}
                        setGoldDecision={setGoldDecision}
                        goldLabel={goldLabel}
                        setGoldLabel={setGoldLabel}
                        goldExplanation={goldExplanation}
                        setGoldExplanation={setGoldExplanation}
                        evidenceSources={evidenceSources}
                        onAddEvidence={handleAddEvidence}
                        onUpdateEvidence={handleUpdateEvidence}
                        onRemoveEvidence={handleRemoveEvidence}
                        onUpdateLocator={handleUpdateLocator}
                        text={text}
                        setText={setText}
                        media={media}
                        mediaDescription={mediaDescription}
                        setMediaDescription={setMediaDescription}
                        ocrText={ocrText}
                        setOcrText={setOcrText}
                        imageCaption={imageCaption}
                        setImageCaption={setImageCaption}
                        videoDuration={videoDuration}
                        setVideoDuration={setVideoDuration}
                        videoCaption={videoCaption}
                        setVideoCaption={setVideoCaption}
                        eval1Label={eval1Label}
                        setEval1Label={setEval1Label}
                        eval1Note={eval1Note}
                        setEval1Note={setEval1Note}
                        eval2Label={eval2Label}
                        setEval2Label={setEval2Label}
                        eval2Note={eval2Note}
                        setEval2Note={setEval2Note}
                        onFileUpload={handleFileUpload}
                        onSelectExistingMedia={handleSelectExistingMedia}
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