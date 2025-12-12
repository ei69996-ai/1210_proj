/**
 * @file feedback-button.tsx
 * @description 피드백 버튼 컴포넌트
 *
 * 고정 위치에 표시되는 피드백 버튼입니다.
 * 클릭 시 피드백 모달 또는 버그 리포트 모달을 선택할 수 있습니다.
 */

"use client";

import { useState } from "react";
import { MessageSquare, Bug } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { FeedbackModal } from "./feedback-modal";
import { BugReportModal } from "./bug-report-modal";

export function FeedbackButton() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [bugReportOpen, setBugReportOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
            aria-label="피드백 보내기"
            size="icon"
          >
            <MessageSquare className="h-6 w-6" aria-hidden="true" />
            <span className="sr-only">피드백 보내기</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="mb-2">
          <DropdownMenuItem
            onClick={() => setFeedbackOpen(true)}
            className="cursor-pointer"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>피드백 보내기</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setBugReportOpen(true)}
            className="cursor-pointer"
          >
            <Bug className="mr-2 h-4 w-4" />
            <span>버그 신고</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
      <BugReportModal isOpen={bugReportOpen} onClose={() => setBugReportOpen(false)} />
    </>
  );
}

