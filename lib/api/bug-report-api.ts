/**
 * @file bug-report-api.ts
 * @description 버그 리포트 API
 *
 * 사용자 버그 리포트를 Supabase에 저장하는 API 함수입니다.
 *
 * @dependencies
 * - lib/supabase/clerk-client: Supabase 클라이언트 (클라이언트 사이드)
 * - lib/supabase/server: Supabase 클라이언트 (서버 사이드)
 * - lib/supabase/service-role: Supabase Service Role 클라이언트 (스크린샷 업로드)
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { getBrowserInfo } from "./error-logger";

export interface BugReportData {
  title: string;
  description: string;
  steps_to_reproduce?: string;
  expected_behavior?: string;
  actual_behavior?: string;
  screenshot?: File | null;
  page_url?: string;
}

/**
 * 스크린샷을 Supabase Storage에 업로드 (API Route 사용)
 * @param file 스크린샷 파일
 * @param userId 사용자 ID (선택 사항)
 * @returns 업로드된 파일 URL
 */
async function uploadScreenshot(
  file: File,
  userId?: string
): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    if (userId) {
      formData.append("userId", userId);
    }

    const response = await fetch("/api/upload-screenshot", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("[Bug Report API] 스크린샷 업로드 실패:", error);
      return null;
    }

    const data = await response.json();
    return data.url || null;
  } catch (error) {
    console.error("[Bug Report API] 스크린샷 업로드 실패:", error);
    return null;
  }
}

/**
 * 버그 리포트 제출 (클라이언트 사이드)
 * @param supabase Supabase 클라이언트
 * @param bugReportData 버그 리포트 데이터
 * @returns 저장 성공 여부
 */
export async function submitBugReport(
  supabase: SupabaseClient,
  bugReportData: BugReportData
): Promise<{ success: boolean; error?: string }> {
  try {
    // 현재 사용자 ID 가져오기 (선택 사항)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 브라우저 정보 수집
    const browserInfo = getBrowserInfo();

    // 스크린샷 업로드 (있는 경우)
    let screenshotUrl: string | null = null;
    if (bugReportData.screenshot) {
      screenshotUrl = await uploadScreenshot(
        bugReportData.screenshot,
        user?.id
      );
    }

    // 화면 해상도
    const screenResolution =
      typeof window !== "undefined"
        ? `${window.screen.width}x${window.screen.height}`
        : null;

    // 버그 리포트 저장
    const { error } = await supabase.from("bug_reports").insert({
      user_id: user?.id || null,
      title: bugReportData.title,
      description: bugReportData.description,
      steps_to_reproduce: bugReportData.steps_to_reproduce || null,
      expected_behavior: bugReportData.expected_behavior || null,
      actual_behavior: bugReportData.actual_behavior || null,
      screenshot_url: screenshotUrl,
      page_url: bugReportData.page_url || (typeof window !== "undefined" ? window.location.pathname : ""),
      browser_info: JSON.stringify(browserInfo),
      screen_resolution: screenResolution,
      status: "open",
    });

    if (error) {
      console.error("[Bug Report API] 저장 실패:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("[Bug Report API] 버그 리포트 제출 실패:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

