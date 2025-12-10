import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { Suspense } from "react";

/**
 * Supabase 공식 Next.js 가이드 예시 페이지
 * 
 * 이 페이지는 Supabase 공식 문서의 instruments 예시를 기반으로 합니다.
 * Server Component에서 Supabase 데이터를 쿼리하는 방법을 보여줍니다.
 * 
 * 참고: 실제 instruments 테이블이 없으면 에러가 발생할 수 있습니다.
 * Supabase Dashboard에서 테이블을 생성하거나, 다른 테이블을 사용하세요.
 */
async function InstrumentsData() {
  const supabase = await createClerkSupabaseClient();
  const { data: instruments, error } = await supabase
    .from("instruments")
    .select();

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <p className="text-red-600 dark:text-red-400 font-semibold">
          데이터 로드 오류
        </p>
        <p className="text-red-500 dark:text-red-300 text-sm mt-2">
          {error.message}
        </p>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-4">
          💡 팁: Supabase Dashboard에서 instruments 테이블을 생성하거나,
          <br />
          다른 테이블 이름으로 변경하세요.
        </p>
      </div>
    );
  }

  if (!instruments || instruments.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <p className="text-yellow-600 dark:text-yellow-400">
          데이터가 없습니다. Supabase Dashboard에서 instruments 테이블에 데이터를 추가하세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">악기 목록</h2>
      <ul className="space-y-2">
        {instruments.map((instrument: any) => (
          <li
            key={instrument.id}
            className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <span className="font-medium">{instrument.name}</span>
            {instrument.id && (
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                (ID: {instrument.id})
              </span>
            )}
          </li>
        ))}
      </ul>
      <details className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <summary className="cursor-pointer font-semibold mb-2">
          원본 JSON 데이터 보기
        </summary>
        <pre className="mt-2 text-xs overflow-auto">
          {JSON.stringify(instruments, null, 2)}
        </pre>
      </details>
    </div>
  );
}

export default function Instruments() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Supabase 데이터 쿼리 예시</h1>
        <p className="text-gray-600 dark:text-gray-400">
          이 페이지는 Supabase 공식 Next.js 가이드의 예시를 기반으로 합니다.
          <br />
          Server Component에서 Supabase 데이터를 쿼리하는 방법을 보여줍니다.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              악기 데이터를 불러오는 중...
            </p>
          </div>
        }
      >
        <InstrumentsData />
      </Suspense>
    </div>
  );
}

