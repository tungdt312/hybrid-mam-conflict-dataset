import React from "react";
import { SampleData } from "@/types/dataset";
import { DatasetCard } from "@/components/dataset-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Download, Search, HelpCircle } from "lucide-react";

export type FilterCategory = "ALL" | "CONFLICT" | "CONSENSUS" | "PENDING" | 0 | 1 | 2;

interface DataListPanelProps {
  items: SampleData[];
  filteredItems: SampleData[];
  activeItemId: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterType: FilterCategory;
  setFilterType: (filter: FilterCategory) => void;
  conflictCount: number;
  consensusCount: number;
  pendingCount: number;
  onSelectCard: (item: SampleData) => void;
  onExportJSON: () => void;
}

export function DataListPanel({
                                items,
                                filteredItems,
                                activeItemId,
                                searchQuery,
                                setSearchQuery,
                                filterType,
                                setFilterType,
                                conflictCount,
                                consensusCount,
                                pendingCount,
                                onSelectCard,
                                onExportJSON,
                              }: DataListPanelProps) {
  return (
      <Card className="shadow-sm border-border/80 bg-card">
        <CardHeader className="border-b border-border/60 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <div>
              <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2.5 text-foreground">
                <span>Danh sách Mục Dữ liệu</span>
                <Badge variant="secondary" className="font-mono text-xs sm:text-sm px-2.5 py-0.5">
                  {filteredItems.length} / {items.length}
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
                Nhấp vào bất kỳ thẻ nào để tải vào bảng chỉnh sửa đánh giá kép (eval1 & eval2).
              </CardDescription>
            </div>

            <Button
                onClick={onExportJSON}
                variant="default"
                className="gap-2.5 h-10 px-4 text-sm sm:text-base font-semibold shrink-0 shadow-xs cursor-pointer"
            >
              <Download className="size-4" />
              Xuất tệp JSON
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            <div className="relative">
              <Search className="size-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                  type="text"
                  placeholder="Tìm kiếm bài viết, mô tả media hoặc ghi chú đánh giá..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9.5 h-10 text-sm sm:text-base bg-background"
              />
              {searchQuery && (
                  <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground text-sm font-semibold cursor-pointer"
                  >
                    ✕
                  </button>
              )}
            </div>

            {/* Filter Pills tương ứng với label số và trạng thái */}
            <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 text-xs sm:text-sm">
              <button
                  type="button"
                  onClick={() => setFilterType("ALL")}
                  className={`px-3 py-1.5 rounded-lg transition-colors font-semibold cursor-pointer whitespace-nowrap ${
                      filterType === "ALL" ? "bg-primary text-primary-foreground shadow-xs" : "bg-muted text-muted-foreground"
                  }`}
              >
                Tất cả ({items.length})
              </button>
              <button
                  type="button"
                  onClick={() => setFilterType("CONFLICT")}
                  className={`px-3 py-1.5 rounded-lg transition-colors font-semibold cursor-pointer whitespace-nowrap ${
                      filterType === "CONFLICT" ? "bg-amber-600 text-white shadow-xs" : "bg-muted text-muted-foreground"
                  }`}
              >
                Xung đột ({conflictCount})
              </button>
              <button
                  type="button"
                  onClick={() => setFilterType("CONSENSUS")}
                  className={`px-3 py-1.5 rounded-lg transition-colors font-semibold cursor-pointer whitespace-nowrap ${
                      filterType === "CONSENSUS" ? "bg-emerald-600 text-white shadow-xs" : "bg-muted text-muted-foreground"
                  }`}
              >
                Đồng thuận ({consensusCount})
              </button>
              <button
                  type="button"
                  onClick={() => setFilterType("PENDING")}
                  className={`px-3 py-1.5 rounded-lg transition-colors font-semibold cursor-pointer whitespace-nowrap ${
                      filterType === "PENDING" ? "bg-slate-700 text-white shadow-xs" : "bg-muted text-muted-foreground"
                  }`}
              >
                Chưa đánh giá ({pendingCount})
              </button>
              <button
                  type="button"
                  onClick={() => setFilterType(0)}
                  className={`px-3 py-1.5 rounded-lg transition-colors font-semibold cursor-pointer whitespace-nowrap ${
                      filterType === 0 ? "bg-emerald-700 text-white shadow-xs" : "bg-muted text-muted-foreground"
                  }`}
              >
                SAFE (0)
              </button>
              <button
                  type="button"
                  onClick={() => setFilterType(1)}
                  className={`px-3 py-1.5 rounded-lg transition-colors font-semibold cursor-pointer whitespace-nowrap ${
                      filterType === 1 ? "bg-amber-600 text-white shadow-xs" : "bg-muted text-muted-foreground"
                  }`}
              >
                OFFENSIVE (1)
              </button>
              <button
                  type="button"
                  onClick={() => setFilterType(2)}
                  className={`px-3 py-1.5 rounded-lg transition-colors font-semibold cursor-pointer whitespace-nowrap ${
                      filterType === 2 ? "bg-rose-600 text-white shadow-xs" : "bg-muted text-muted-foreground"
                  }`}
              >
                HATE (2)
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 max-h-[750px] overflow-y-auto space-y-4 pr-1">
          {filteredItems.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground space-y-2.5">
                <HelpCircle className="size-10 mx-auto text-muted-foreground/60" />
                <p className="text-base font-semibold text-foreground">Không tìm thấy mục dữ liệu nào</p>
                <p className="text-xs sm:text-sm">Không có mục nào khớp với từ khóa tìm kiếm hoặc bộ lọc hiện tại.</p>
              </div>
          ) : (
              filteredItems.map((item) => (
                  <DatasetCard
                      key={item._id}
                      item={item}
                      isSelected={activeItemId === item._id}
                      onSelect={onSelectCard}
                  />
              ))
          )}
        </CardContent>
      </Card>
  );
}