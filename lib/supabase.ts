/**
 * @deprecated 이 파일은 더 이상 사용되지 않습니다.
 * 
 * 대신 다음 파일들을 사용하세요:
 * - Client Component: `lib/supabase/clerk-client.ts`의 `useClerkSupabaseClient()`
 * - Server Component: `lib/supabase/server.ts`의 `createClerkSupabaseClient()`
 * - Service Role: `lib/supabase/service-role.ts`의 `getServiceRoleClient()`
 * - Public Data: `lib/supabase/client.ts`의 `supabase`
 * 
 * 이 파일은 하위 호환성을 위해 유지되지만, 새 코드에서는 사용하지 마세요.
 */

import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

/**
 * @deprecated `lib/supabase/server.ts`의 `createClerkSupabaseClient()`를 사용하세요.
 */
export const createSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      async accessToken() {
        return (await auth()).getToken();
      },
    }
  );
};
