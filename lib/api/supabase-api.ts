/**
 * @file supabase-api.ts
 * @description 북마크 관련 Supabase 쿼리 함수
 *
 * 북마크 기능을 위한 Supabase 데이터베이스 쿼리 함수들을 제공합니다.
 * Clerk 인증과 연동되어 사용자의 북마크를 관리합니다.
 *
 * 주요 기능:
 * 1. 북마크 조회 (getBookmark)
 * 2. 북마크 추가 (addBookmark)
 * 3. 북마크 제거 (removeBookmark)
 * 4. 사용자 북마크 목록 조회 (getUserBookmarks)
 *
 * @dependencies
 * - @supabase/supabase-js: Supabase 클라이언트
 * - lib/supabase/clerk-client: useClerkSupabaseClient 훅
 */

import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * 북마크 타입 정의
 */
export interface Bookmark {
  id: string;
  user_id: string;
  content_id: string;
  created_at: string;
}

/**
 * Clerk userId를 Supabase user_id (UUID)로 변환
 * @param supabase Supabase 클라이언트
 * @param clerkUserId Clerk 사용자 ID
 * @returns Supabase user_id (UUID) 또는 null
 */
export async function getSupabaseUserId(
  supabase: SupabaseClient,
  clerkUserId: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (error) {
      // 사용자가 없는 경우 (PGRST116: no rows returned)
      if (error.code === "PGRST116") {
        console.warn("Supabase user not found for clerk_id:", clerkUserId);
        return null;
      }
      throw error;
    }

    return data?.id ?? null;
  } catch (error) {
    console.error("Error getting Supabase user ID:", error);
    throw error;
  }
}

/**
 * 특정 관광지의 북마크 여부 조회
 * @param supabase Supabase 클라이언트
 * @param clerkUserId Clerk 사용자 ID
 * @param contentId 관광지 ID (한국관광공사 API contentid)
 * @returns 북마크 정보 또는 null
 */
export async function getBookmark(
  supabase: SupabaseClient,
  clerkUserId: string,
  contentId: string
): Promise<Bookmark | null> {
  try {
    // Clerk userId를 Supabase user_id로 변환
    const userId = await getSupabaseUserId(supabase, clerkUserId);
    if (!userId) {
      return null;
    }

    // 북마크 조회
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .eq("content_id", contentId)
      .single();

    if (error) {
      // 북마크가 없는 경우 (PGRST116: no rows returned)
      if (error.code === "PGRST116") {
        return null;
      }
      throw error;
    }

    return data as Bookmark;
  } catch (error) {
    console.error("Error getting bookmark:", error);
    throw error;
  }
}

/**
 * 북마크 추가
 * @param supabase Supabase 클라이언트
 * @param clerkUserId Clerk 사용자 ID
 * @param contentId 관광지 ID (한국관광공사 API contentid)
 * @returns 생성된 북마크 정보
 */
export async function addBookmark(
  supabase: SupabaseClient,
  clerkUserId: string,
  contentId: string
): Promise<Bookmark> {
  try {
    // Clerk userId를 Supabase user_id로 변환
    const userId = await getSupabaseUserId(supabase, clerkUserId);
    if (!userId) {
      throw new Error("User not found in Supabase. Please sync your account first.");
    }

    // 북마크 추가
    const { data, error } = await supabase
      .from("bookmarks")
      .insert({
        user_id: userId,
        content_id: contentId,
      })
      .select()
      .single();

    if (error) {
      // 중복 북마크인 경우 (23505: unique_violation)
      if (error.code === "23505") {
        // 이미 북마크가 있는 경우, 기존 북마크 반환
        const existingBookmark = await getBookmark(supabase, clerkUserId, contentId);
        if (existingBookmark) {
          return existingBookmark;
        }
        throw new Error("Bookmark already exists");
      }
      throw error;
    }

    return data as Bookmark;
  } catch (error) {
    console.error("Error adding bookmark:", error);
    throw error;
  }
}

/**
 * 북마크 제거
 * @param supabase Supabase 클라이언트
 * @param clerkUserId Clerk 사용자 ID
 * @param contentId 관광지 ID (한국관광공사 API contentid)
 * @returns 성공 여부
 */
export async function removeBookmark(
  supabase: SupabaseClient,
  clerkUserId: string,
  contentId: string
): Promise<boolean> {
  try {
    // Clerk userId를 Supabase user_id로 변환
    const userId = await getSupabaseUserId(supabase, clerkUserId);
    if (!userId) {
      throw new Error("User not found in Supabase. Please sync your account first.");
    }

    // 북마크 제거
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", userId)
      .eq("content_id", contentId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error removing bookmark:", error);
    throw error;
  }
}

/**
 * 사용자의 모든 북마크 목록 조회
 * @param supabase Supabase 클라이언트
 * @param clerkUserId Clerk 사용자 ID
 * @returns 북마크 목록
 */
export async function getUserBookmarks(
  supabase: SupabaseClient,
  clerkUserId: string
): Promise<Bookmark[]> {
  try {
    // Clerk userId를 Supabase user_id로 변환
    const userId = await getSupabaseUserId(supabase, clerkUserId);
    if (!userId) {
      return [];
    }

    // 북마크 목록 조회 (최신순 정렬)
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []) as Bookmark[];
  } catch (error) {
    console.error("Error getting user bookmarks:", error);
    throw error;
  }
}

