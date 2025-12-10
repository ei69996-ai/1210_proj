import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";

/**
 * Clerk + Supabase 네이티브 통합 클라이언트 (Server Component용)
 *
 * Supabase 공식 Next.js 가이드 패턴을 따르며, Clerk 인증과 통합됩니다:
 * - @supabase/ssr의 createServerClient 사용 (cookie 기반 세션 관리)
 * - Next.js 15의 cookies() 사용
 * - Clerk 토큰을 accessToken 옵션으로 전달
 * - 2025년 4월부터 권장되는 네이티브 통합 방식
 *
 * @example
 * ```tsx
 * // Server Component
 * import { createClerkSupabaseClient } from '@/lib/supabase/server';
 *
 * export default async function MyPage() {
 *   const supabase = await createClerkSupabaseClient();
 *   const { data } = await supabase.from('table').select('*');
 *   return <div>...</div>;
 * }
 * ```
 */
export async function createClerkSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // Server Component는 읽기 전용이므로 경고가 로그될 수 있습니다
          // 세션 갱신이 필요한 경우 middleware를 사용하세요
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set(name, value, options);
            } catch (error) {
              // Server Component에서는 cookie 설정이 제한될 수 있습니다
              // 이는 정상적인 동작입니다
            }
          });
        },
      },
      // Clerk 토큰을 accessToken으로 전달
      async accessToken() {
        return (await auth()).getToken() ?? null;
      },
    }
  );
}
