/**
 * @file bookmark-list.tsx
 * @description 북마크 목록 컴포넌트
 *
 * 사용자가 북마크한 관광지 목록을 표시하는 컴포넌트입니다.
 * 북마크 조회, 정렬, 삭제 기능을 제공합니다.
 *
 * 주요 기능:
 * 1. 사용자 북마크 목록 조회 (getUserBookmarks)
 * 2. 관광지 상세 정보 조회 (getDetailCommon)
 * 3. TourCard 컴포넌트로 표시
 * 4. 정렬 옵션 (최신순, 이름순, 지역별)
 * 5. 개별 삭제 기능
 * 6. 일괄 삭제 기능
 *
 * @dependencies
 * - @clerk/nextjs: useAuth 훅
 * - lib/supabase/clerk-client: useClerkSupabaseClient 훅
 * - lib/api/supabase-api: getUserBookmarks, removeBookmark 함수
 * - lib/api/tour-api: getDetailCommon 함수
 * - components/tour-card: TourCard 컴포넌트
 * - components/ui: Dialog, Button, Select, Skeleton, Loading, Error
 * - sonner: toast 알림
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { Trash2, CheckSquare, Square, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import {
  getUserBookmarks,
  removeBookmark,
  type Bookmark,
} from "@/lib/api/supabase-api";
import { getDetailCommon } from "@/lib/api/tour-api";
import type { TourItem, TourDetail } from "@/lib/types/tour";
import { TourCard } from "@/components/tour-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Loading } from "@/components/ui/loading";
import { Error } from "@/components/ui/error";

/**
 * 북마크 정렬 옵션 타입
 */
type BookmarkSortOption = "latest" | "name" | "region";

/**
 * 북마크와 관광지 정보를 함께 저장하는 타입
 */
interface BookmarkWithTour extends Bookmark {
  tour?: TourItem;
}

export function BookmarkList() {
  const { isLoaded, userId } = useAuth();
  const supabase = useClerkSupabaseClient();
  const [bookmarks, setBookmarks] = useState<BookmarkWithTour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<BookmarkSortOption>("latest");
  const [selectedBookmarks, setSelectedBookmarks] = useState<Set<string>>(
    new Set()
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 북마크 목록 조회 및 관광지 정보 가져오기
  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!isLoaded || !userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // 북마크 목록 조회
        const bookmarkList = await getUserBookmarks(supabase, userId);

        if (bookmarkList.length === 0) {
          setBookmarks([]);
          setIsLoading(false);
          return;
        }

        // 각 북마크의 관광지 상세 정보 조회 (병렬 처리)
        const tourPromises = bookmarkList.map(async (bookmark) => {
          try {
            const tourDetail = await getDetailCommon(bookmark.content_id);
            // TourDetail을 TourItem으로 변환
            const tourItem: TourItem = {
              contentid: tourDetail.contentid,
              contenttypeid: tourDetail.contenttypeid,
              title: tourDetail.title,
              addr1: tourDetail.addr1,
              addr2: tourDetail.addr2,
              areacode: tourDetail.areacode || "",
              mapx: tourDetail.mapx,
              mapy: tourDetail.mapy,
              firstimage: tourDetail.firstimage,
              firstimage2: tourDetail.firstimage2,
              tel: tourDetail.tel,
              modifiedtime: "", // 북마크 생성 시간을 사용할 수 없으므로 빈 문자열
            };
            return {
              ...bookmark,
              tour: tourItem,
            };
          } catch (error) {
            console.error(
              `관광지 정보 조회 실패 (contentId: ${bookmark.content_id}):`,
              error
            );
            // 관광지 정보 조회 실패해도 북마크는 유지
            return {
              ...bookmark,
              tour: undefined,
            };
          }
        });

        const bookmarksWithTours = await Promise.all(tourPromises);
        setBookmarks(bookmarksWithTours);
      } catch (err) {
        console.error("북마크 목록 조회 실패:", err);
        setError(
          err instanceof Error
            ? err.message
            : "북마크 목록을 불러오는 중 오류가 발생했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookmarks();
  }, [isLoaded, userId, supabase]);

  // 정렬된 북마크 목록
  const sortedBookmarks = useMemo(() => {
    if (!bookmarks.length) return bookmarks;

    const sorted = [...bookmarks];

    switch (sortOption) {
      case "name":
        // 이름순 (가나다순)
        sorted.sort((a, b) => {
          const titleA = a.tour?.title || "";
          const titleB = b.tour?.title || "";
          return titleA.localeCompare(titleB, "ko");
        });
        break;
      case "region":
        // 지역별 (areacode 기준)
        sorted.sort((a, b) => {
          const areaA = a.tour?.areacode || "";
          const areaB = b.tour?.areacode || "";
          return areaA.localeCompare(areaB);
        });
        break;
      case "latest":
      default:
        // 최신순 (created_at 기준 내림차순)
        sorted.sort((a, b) => {
          const timeA = new Date(a.created_at).getTime();
          const timeB = new Date(b.created_at).getTime();
          return timeB - timeA;
        });
        break;
    }

    return sorted;
  }, [bookmarks, sortOption]);

  // 체크박스 토글
  const toggleBookmarkSelection = (bookmarkId: string) => {
    setSelectedBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(bookmarkId)) {
        next.delete(bookmarkId);
      } else {
        next.add(bookmarkId);
      }
      return next;
    });
  };

  // 전체 선택/해제
  const toggleAllSelection = () => {
    if (selectedBookmarks.size === sortedBookmarks.length) {
      setSelectedBookmarks(new Set());
    } else {
      setSelectedBookmarks(
        new Set(sortedBookmarks.map((b) => b.id))
      );
    }
  };

  // 개별 삭제
  const handleDeleteClick = (bookmarkId: string) => {
    setDeleteTarget(bookmarkId);
    setDeleteDialogOpen(true);
  };

  // 일괄 삭제
  const handleBatchDeleteClick = () => {
    if (selectedBookmarks.size === 0) {
      toast.error("삭제할 북마크를 선택해주세요.");
      return;
    }
    setDeleteTarget(null); // null이면 일괄 삭제
    setDeleteDialogOpen(true);
  };

  // 삭제 실행
  const handleDeleteConfirm = async () => {
    if (!isLoaded || !userId) {
      toast.error("인증 상태를 확인할 수 없습니다.");
      return;
    }

    try {
      setIsDeleting(true);

      if (deleteTarget) {
        // 개별 삭제
        const bookmark = bookmarks.find((b) => b.id === deleteTarget);
        if (!bookmark) {
          toast.error("북마크를 찾을 수 없습니다.");
          return;
        }

        await removeBookmark(supabase, userId, bookmark.content_id);
        setBookmarks((prev) => prev.filter((b) => b.id !== deleteTarget));
        setSelectedBookmarks((prev) => {
          const next = new Set(prev);
          next.delete(deleteTarget);
          return next;
        });
        toast.success("북마크가 삭제되었습니다.");
      } else {
        // 일괄 삭제
        const bookmarksToDelete = bookmarks.filter((b) =>
          selectedBookmarks.has(b.id)
        );

        const deletePromises = bookmarksToDelete.map((bookmark) =>
          removeBookmark(supabase, userId, bookmark.content_id)
        );

        await Promise.all(deletePromises);
        setBookmarks((prev) =>
          prev.filter((b) => !selectedBookmarks.has(b.id))
        );
        setSelectedBookmarks(new Set());
        toast.success(
          `${bookmarksToDelete.length}개의 북마크가 삭제되었습니다.`
        );
      }

      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      console.error("북마크 삭제 실패:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "북마크 삭제 중 오류가 발생했습니다."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // 로딩 상태
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading size="lg" text="인증 상태를 확인하는 중..." />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* 필터/정렬 영역 스켈레톤 */}
        <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
        {/* 목록 스켈레톤 */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-full rounded-lg border bg-card shadow-sm"
            >
              <Skeleton className="h-48 w-full rounded-t-lg" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <Error
        message={error}
        showRetry
        onRetry={() => {
          setError(null);
          setIsLoading(true);
          // useEffect가 다시 실행되도록 userId를 의존성으로 사용
        }}
      />
    );
  }

  // 빈 상태
  if (bookmarks.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 text-center"
        role="status"
        aria-live="polite"
      >
        <div className="mb-4 text-4xl" aria-hidden="true">
          ⭐
        </div>
        <h3 className="mb-2 text-lg font-semibold">북마크가 없습니다</h3>
        <p className="text-sm text-muted-foreground">
          관광지를 북마크하여 나중에 쉽게 찾아보세요.
        </p>
      </div>
    );
  }

  // 관광지 정보가 있는 북마크만 필터링
  const validBookmarks = sortedBookmarks.filter((b) => b.tour);

  return (
    <div className="space-y-6">
      {/* 필터/정렬 영역 */}
      <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {/* 전체 선택 체크박스 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAllSelection}
            className="h-8 w-8 p-0"
            aria-label={
              selectedBookmarks.size === sortedBookmarks.length
                ? "전체 선택 해제"
                : "전체 선택"
            }
          >
            {selectedBookmarks.size === sortedBookmarks.length ? (
              <CheckSquare className="h-5 w-5" />
            ) : (
              <Square className="h-5 w-5" />
            )}
          </Button>
          <span className="text-sm text-muted-foreground">
            {selectedBookmarks.size > 0
              ? `${selectedBookmarks.size}개 선택됨`
              : `${validBookmarks.length}개의 북마크`}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {/* 정렬 옵션 */}
          <Select
            value={sortOption}
            onValueChange={(value) =>
              setSortOption(value as BookmarkSortOption)
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="정렬" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">최신순</SelectItem>
              <SelectItem value="name">이름순</SelectItem>
              <SelectItem value="region">지역별</SelectItem>
            </SelectContent>
          </Select>
          {/* 일괄 삭제 버튼 */}
          {selectedBookmarks.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBatchDeleteClick}
            >
              선택 삭제 ({selectedBookmarks.size})
            </Button>
          )}
        </div>
      </div>

      {/* 북마크 목록 */}
      {validBookmarks.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-12 text-center"
          role="status"
          aria-live="polite"
        >
          <div className="mb-4 text-4xl" aria-hidden="true">
            ⚠️
          </div>
          <h3 className="mb-2 text-lg font-semibold">
            표시할 수 있는 북마크가 없습니다
          </h3>
          <p className="text-sm text-muted-foreground">
            일부 북마크의 관광지 정보를 불러올 수 없습니다.
          </p>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          role="list"
          aria-label="북마크 목록"
        >
          {validBookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="group relative"
              role="listitem"
            >
              {/* 체크박스 */}
              <div className="absolute left-2 top-2 z-10">
                <Button
                  variant="secondary"
                  size="icon"
                  className={`h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm ${
                    selectedBookmarks.has(bookmark.id)
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  } transition-opacity`}
                  onClick={() => toggleBookmarkSelection(bookmark.id)}
                  aria-label={
                    selectedBookmarks.has(bookmark.id)
                      ? "선택 해제"
                      : "선택"
                  }
                >
                  {selectedBookmarks.has(bookmark.id) ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {/* 삭제 버튼 */}
              <div className="absolute right-2 top-2 z-10">
                <Button
                  variant="destructive"
                  size="icon"
                  className={`h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm ${
                    "opacity-0 group-hover:opacity-100"
                  } transition-opacity`}
                  onClick={() => handleDeleteClick(bookmark.id)}
                  aria-label="북마크 삭제"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {/* TourCard */}
              {bookmark.tour && (
                <TourCard tour={bookmark.tour} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {deleteTarget ? "북마크 삭제" : "선택한 북마크 삭제"}
            </DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? "이 북마크를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
                : `선택한 ${selectedBookmarks.size}개의 북마크를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleteTarget(null);
              }}
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  삭제 중...
                </>
              ) : (
                "삭제"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

