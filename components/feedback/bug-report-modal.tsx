/**
 * @file bug-report-modal.tsx
 * @description 버그 리포트 모달 컴포넌트
 *
 * 사용자가 발견한 버그를 신고할 수 있는 모달 컴포넌트입니다.
 * 스크린샷 업로드 기능을 포함합니다.
 *
 * @dependencies
 * - components/ui/dialog: Dialog 컴포넌트
 * - components/ui/button: Button 컴포넌트
 * - components/ui/input: Input 컴포넌트
 * - components/ui/textarea: Textarea 컴포넌트
 * - lib/api/bug-report-api: submitBugReport 함수
 * - react-hook-form: 폼 관리
 * - zod: 유효성 검사
 * - sonner: toast 알림
 */

"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { submitBugReport } from "@/lib/api/bug-report-api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";

const bugReportSchema = z.object({
  title: z.string().min(5, "제목은 최소 5자 이상 입력해주세요.").max(200, "제목은 최대 200자까지 입력 가능합니다."),
  description: z.string().min(20, "설명은 최소 20자 이상 입력해주세요.").max(2000, "설명은 최대 2000자까지 입력 가능합니다."),
  steps_to_reproduce: z.string().max(1000, "재현 단계는 최대 1000자까지 입력 가능합니다.").optional(),
  expected_behavior: z.string().max(500, "예상 동작은 최대 500자까지 입력 가능합니다.").optional(),
  actual_behavior: z.string().max(500, "실제 동작은 최대 500자까지 입력 가능합니다.").optional(),
});

type BugReportFormData = z.infer<typeof bugReportSchema>;

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BugReportModal({ isOpen, onClose }: BugReportModalProps) {
  const supabase = useClerkSupabaseClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BugReportFormData>({
    resolver: zodResolver(bugReportSchema),
    defaultValues: {
      title: "",
      description: "",
      steps_to_reproduce: "",
      expected_behavior: "",
      actual_behavior: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 파일 크기 제한 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("스크린샷 크기는 5MB 이하여야 합니다.");
        return;
      }
      // 이미지 파일만 허용
      if (!file.type.startsWith("image/")) {
        toast.error("이미지 파일만 업로드 가능합니다.");
        return;
      }
      setScreenshot(file);
    }
  };

  const handleRemoveScreenshot = () => {
    setScreenshot(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: BugReportFormData) => {
    try {
      setIsSubmitting(true);

      const result = await submitBugReport(supabase, {
        title: data.title,
        description: data.description,
        steps_to_reproduce: data.steps_to_reproduce || undefined,
        expected_behavior: data.expected_behavior || undefined,
        actual_behavior: data.actual_behavior || undefined,
        screenshot: screenshot,
        page_url: typeof window !== "undefined" ? window.location.pathname : undefined,
      });

      if (result.success) {
        toast.success("버그 리포트가 전송되었습니다. 감사합니다!");
        reset();
        setScreenshot(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        onClose();
      } else {
        toast.error(result.error || "버그 리포트 전송에 실패했습니다.");
      }
    } catch (error) {
      console.error("[Bug Report Modal] 버그 리포트 제출 실패:", error);
      toast.error("버그 리포트 전송 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      setScreenshot(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>버그 리포트</DialogTitle>
          <DialogDescription>
            발견하신 버그를 신고해주세요. 로그인하지 않아도 버그를 신고할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 버그 제목 */}
          <div className="space-y-2">
            <Label htmlFor="bug-title">버그 제목 *</Label>
            <Input
              id="bug-title"
              placeholder="버그를 간단히 설명해주세요"
              {...register("title")}
              aria-describedby={errors.title ? "title-error" : undefined}
            />
            {errors.title && (
              <p id="title-error" className="text-sm text-destructive">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* 버그 설명 */}
          <div className="space-y-2">
            <Label htmlFor="bug-description">버그 설명 *</Label>
            <Textarea
              id="bug-description"
              placeholder="버그에 대해 자세히 설명해주세요"
              rows={4}
              {...register("description")}
              className="resize-none"
              aria-describedby={errors.description ? "description-error" : undefined}
            />
            {errors.description && (
              <p id="description-error" className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* 재현 단계 */}
          <div className="space-y-2">
            <Label htmlFor="bug-steps">재현 단계 (선택 사항)</Label>
            <Textarea
              id="bug-steps"
              placeholder="버그를 재현하는 단계를 설명해주세요"
              rows={3}
              {...register("steps_to_reproduce")}
              className="resize-none"
              aria-describedby={errors.steps_to_reproduce ? "steps-error" : undefined}
            />
            {errors.steps_to_reproduce && (
              <p id="steps-error" className="text-sm text-destructive">
                {errors.steps_to_reproduce.message}
              </p>
            )}
          </div>

          {/* 예상 동작 */}
          <div className="space-y-2">
            <Label htmlFor="bug-expected">예상 동작 (선택 사항)</Label>
            <Textarea
              id="bug-expected"
              placeholder="예상되는 정상적인 동작을 설명해주세요"
              rows={2}
              {...register("expected_behavior")}
              className="resize-none"
              aria-describedby={errors.expected_behavior ? "expected-error" : undefined}
            />
            {errors.expected_behavior && (
              <p id="expected-error" className="text-sm text-destructive">
                {errors.expected_behavior.message}
              </p>
            )}
          </div>

          {/* 실제 동작 */}
          <div className="space-y-2">
            <Label htmlFor="bug-actual">실제 동작 (선택 사항)</Label>
            <Textarea
              id="bug-actual"
              placeholder="실제로 발생한 동작을 설명해주세요"
              rows={2}
              {...register("actual_behavior")}
              className="resize-none"
              aria-describedby={errors.actual_behavior ? "actual-error" : undefined}
            />
            {errors.actual_behavior && (
              <p id="actual-error" className="text-sm text-destructive">
                {errors.actual_behavior.message}
              </p>
            )}
          </div>

          {/* 스크린샷 업로드 */}
          <div className="space-y-2">
            <Label htmlFor="bug-screenshot">스크린샷 (선택 사항, 최대 5MB)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="bug-screenshot"
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="flex-1"
                aria-describedby="screenshot-hint"
              />
              {screenshot && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveScreenshot}
                  aria-label="스크린샷 제거"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {screenshot && (
              <div className="text-sm text-muted-foreground">
                선택된 파일: {screenshot.name} ({(screenshot.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
            <p id="screenshot-hint" className="text-xs text-muted-foreground">
              이미지 파일만 업로드 가능합니다 (JPG, PNG, GIF 등)
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "전송 중..." : "전송"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

