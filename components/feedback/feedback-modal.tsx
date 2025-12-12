/**
 * @file feedback-modal.tsx
 * @description 피드백 모달 컴포넌트
 *
 * 사용자 피드백을 수집하는 모달 컴포넌트입니다.
 * 제안, 불만, 질문 타입을 선택할 수 있습니다.
 *
 * @dependencies
 * - components/ui/dialog: Dialog 컴포넌트
 * - components/ui/button: Button 컴포넌트
 * - components/ui/input: Input 컴포넌트
 * - components/ui/textarea: Textarea 컴포넌트
 * - lib/api/feedback-api: submitFeedback 함수
 * - react-hook-form: 폼 관리
 * - zod: 유효성 검사
 * - sonner: toast 알림
 */

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { submitFeedback, type FeedbackType } from "@/lib/api/feedback-api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const feedbackSchema = z.object({
  type: z.enum(["suggestion", "complaint", "question"]),
  content: z.string().min(10, "피드백은 최소 10자 이상 입력해주세요.").max(1000, "피드백은 최대 1000자까지 입력 가능합니다."),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const supabase = useClerkSupabaseClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      type: "suggestion",
      content: "",
    },
  });

  const selectedType = watch("type");

  const onSubmit = async (data: FeedbackFormData) => {
    try {
      setIsSubmitting(true);

      const result = await submitFeedback(supabase, {
        type: data.type as FeedbackType,
        content: data.content,
        page_url: typeof window !== "undefined" ? window.location.pathname : undefined,
      });

      if (result.success) {
        toast.success("피드백이 전송되었습니다. 감사합니다!");
        reset();
        onClose();
      } else {
        toast.error(result.error || "피드백 전송에 실패했습니다.");
      }
    } catch (error) {
      console.error("[Feedback Modal] 피드백 제출 실패:", error);
      toast.error("피드백 전송 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>피드백 보내기</DialogTitle>
          <DialogDescription>
            서비스 개선을 위한 의견을 보내주세요. 로그인하지 않아도 피드백을 보낼 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 피드백 타입 선택 */}
          <div className="space-y-2">
            <Label htmlFor="feedback-type">피드백 타입</Label>
            <Select
              value={selectedType}
              onValueChange={(value) => setValue("type", value as FeedbackType)}
            >
              <SelectTrigger id="feedback-type">
                <SelectValue placeholder="피드백 타입을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="suggestion">제안</SelectItem>
                <SelectItem value="complaint">불만</SelectItem>
                <SelectItem value="question">질문</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          {/* 피드백 내용 입력 */}
          <div className="space-y-2">
            <Label htmlFor="feedback-content">피드백 내용</Label>
            <Textarea
              id="feedback-content"
              placeholder="피드백을 입력해주세요 (최소 10자 이상)"
              rows={6}
              {...register("content")}
              className="resize-none"
              aria-describedby={errors.content ? "content-error" : undefined}
            />
            {errors.content && (
              <p id="content-error" className="text-sm text-destructive">
                {errors.content.message}
              </p>
            )}
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

