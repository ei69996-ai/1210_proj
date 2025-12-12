/**
 * @file feedback-api.ts
 * @description 피드백 API
 *
 * 사용자 피드백을 Supabase에 저장하는 API 함수입니다.
 * 클라이언트 사이드에서만 사용합니다.
 *
 * @dependencies
 * - lib/supabase/clerk-client: Supabase 클라이언트 (클라이언트 사이드)
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type FeedbackType = "suggestion" | "complaint" | "question";

export interface FeedbackData {
  type: FeedbackType;
  content: string;
  page_url?: string;
}

/**
 * 피드백 제출 (클라이언트 사이드)
 * @param supabase Supabase 클라이언트
 * @param feedbackData 피드백 데이터
 * @returns 저장 성공 여부
 */
export async function submitFeedback(
  supabase: SupabaseClient,
  feedbackData: FeedbackData
): Promise<{ success: boolean; error?: string }> {
  try {
    // 현재 사용자 ID 가져오기 (선택 사항)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("feedbacks").insert({
      user_id: user?.id || null,
      type: feedbackData.type,
      content: feedbackData.content,
      page_url: feedbackData.page_url || (typeof window !== "undefined" ? window.location.pathname : undefined),
    });

    if (error) {
      console.error("[Feedback API] 저장 실패:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("[Feedback API] 피드백 제출 실패:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
    };
  }
}


