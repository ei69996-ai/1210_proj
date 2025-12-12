/**
 * @file verify-env.ts
 * @description 환경변수 보안 검증 스크립트
 *
 * Phase 6 최적화 & 배포를 위한 필수 환경변수 검증을 수행합니다.
 * 모든 필수 환경변수가 올바르게 설정되었는지 확인하고, 누락된 항목을 리포트합니다.
 *
 * 실행 방법:
 *   pnpm tsx scripts/verify-env.ts
 *   또는
 *   pnpm verify-env
 *
 * @dependencies
 * - dotenv: 환경변수 로딩
 */

// 환경변수 로딩 (스크립트 실행 시 .env 파일 자동 로드)
import "dotenv/config";

interface EnvVar {
  key: string;
  required: boolean;
  description: string;
  validator?: (value: string) => boolean;
  validatorMessage?: string;
}

interface VerificationResult {
  name: string;
  passed: boolean;
  message: string;
  details?: string;
}

/**
 * 환경변수 정의
 */
const ENV_VARS: EnvVar[] = [
  // Clerk 인증
  {
    key: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    required: true,
    description: "Clerk Publishable Key (클라이언트에서 사용)",
    validator: (value) => value.startsWith("pk_"),
    validatorMessage: "Clerk Publishable Key는 'pk_'로 시작해야 합니다.",
  },
  {
    key: "CLERK_SECRET_KEY",
    required: true,
    description: "Clerk Secret Key (서버 사이드 전용, 비공개)",
    validator: (value) => value.startsWith("sk_"),
    validatorMessage: "Clerk Secret Key는 'sk_'로 시작해야 합니다.",
  },
  {
    key: "NEXT_PUBLIC_CLERK_SIGN_IN_URL",
    required: false,
    description: "Clerk 로그인 URL (기본값: /sign-in)",
  },
  {
    key: "NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL",
    required: false,
    description: "Clerk 로그인 후 리다이렉트 URL (기본값: /)",
  },
  {
    key: "NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL",
    required: false,
    description: "Clerk 회원가입 후 리다이렉트 URL (기본값: /)",
  },
  // Supabase
  {
    key: "NEXT_PUBLIC_SUPABASE_URL",
    required: true,
    description: "Supabase Project URL (클라이언트에서 사용)",
    validator: (value) => {
      try {
        const url = new URL(value);
        return url.protocol === "https:" && url.hostname.includes("supabase.co");
      } catch {
        return false;
      }
    },
    validatorMessage: "Supabase URL은 https://로 시작하고 supabase.co 도메인을 포함해야 합니다.",
  },
  {
    key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    required: true,
    description: "Supabase Anon Key (클라이언트에서 사용)",
    validator: (value) => value.length > 50,
    validatorMessage: "Supabase Anon Key는 충분한 길이여야 합니다.",
  },
  {
    key: "SUPABASE_SERVICE_ROLE_KEY",
    required: true,
    description: "Supabase Service Role Key (서버 사이드 전용, 매우 중요, 비공개)",
    validator: (value) => value.length > 50,
    validatorMessage: "Supabase Service Role Key는 충분한 길이여야 합니다.",
  },
  {
    key: "NEXT_PUBLIC_STORAGE_BUCKET",
    required: false,
    description: "Supabase Storage Bucket 이름 (기본값: uploads)",
  },
  // 한국관광공사 API
  {
    key: "TOUR_API_KEY",
    required: false,
    description: "한국관광공사 API 키 (서버 사이드 우선)",
    validator: (value) => value.length > 10,
    validatorMessage: "TOUR_API_KEY는 충분한 길이여야 합니다.",
  },
  {
    key: "NEXT_PUBLIC_TOUR_API_KEY",
    required: false,
    description: "한국관광공사 API 키 (클라이언트 사이드 대체)",
    validator: (value) => value.length > 10,
    validatorMessage: "NEXT_PUBLIC_TOUR_API_KEY는 충분한 길이여야 합니다.",
  },
  // 네이버 지도
  {
    key: "NEXT_PUBLIC_NAVER_MAP_CLIENT_ID",
    required: true,
    description: "네이버 지도 API Client ID (클라이언트에서 사용)",
    validator: (value) => value.length > 10,
    validatorMessage: "네이버 지도 Client ID는 충분한 길이여야 합니다.",
  },
  // 선택적 환경변수
  {
    key: "NEXT_PUBLIC_SITE_URL",
    required: false,
    description: "프로덕션 사이트 URL (기본값: VERCEL_URL 또는 localhost:3000)",
  },
  {
    key: "VERCEL_URL",
    required: false,
    description: "Vercel 자동 설정 URL (Vercel 배포 시 자동 설정)",
  },
];

/**
 * 환경변수 검증
 */
function verifyEnvVars(): VerificationResult[] {
  const results: VerificationResult[] = [];

  // 한국관광공사 API 키는 TOUR_API_KEY 또는 NEXT_PUBLIC_TOUR_API_KEY 중 하나만 있어도 됨
  const hasTourApiKey =
    process.env.TOUR_API_KEY || process.env.NEXT_PUBLIC_TOUR_API_KEY;

  for (const envVar of ENV_VARS) {
    const value = process.env[envVar.key];
    const isSet = value !== undefined && value !== "";

    // 한국관광공사 API 키는 특별 처리
    if (
      (envVar.key === "TOUR_API_KEY" || envVar.key === "NEXT_PUBLIC_TOUR_API_KEY") &&
      hasTourApiKey
    ) {
      // 둘 중 하나라도 있으면 통과
      results.push({
        name: envVar.key,
        passed: true,
        message: `${envVar.description} - 설정됨 (${hasTourApiKey ? "TOUR_API_KEY 또는 NEXT_PUBLIC_TOUR_API_KEY 중 하나 설정됨" : ""})`,
      });
      continue;
    }

    // 필수 환경변수 검증
    if (envVar.required && !isSet) {
      results.push({
        name: envVar.key,
        passed: false,
        message: `${envVar.description} - 누락됨`,
        details: "이 환경변수는 필수입니다. .env 파일에 설정해주세요.",
      });
      continue;
    }

    // 선택적 환경변수는 설정되지 않아도 통과
    if (!envVar.required && !isSet) {
      results.push({
        name: envVar.key,
        passed: true,
        message: `${envVar.description} - 선택적 (설정되지 않음)`,
      });
      continue;
    }

    // 값 검증 (validator가 있는 경우)
    if (isSet && envVar.validator) {
      const isValid = envVar.validator(value!);
      if (!isValid) {
        results.push({
          name: envVar.key,
          passed: false,
          message: `${envVar.description} - 형식 오류`,
          details: envVar.validatorMessage || "환경변수 값의 형식이 올바르지 않습니다.",
        });
        continue;
      }
    }

    // 보안을 위해 값의 일부만 표시 (처음 4자 + ... + 마지막 4자)
    const maskedValue = isSet && value!.length > 12
      ? `${value!.substring(0, 4)}...${value!.substring(value!.length - 4)}`
      : isSet
      ? "***"
      : "";

    results.push({
      name: envVar.key,
      passed: true,
      message: `${envVar.description} - 설정됨`,
      details: maskedValue ? `값: ${maskedValue}` : undefined,
    });
  }

  // 한국관광공사 API 키 추가 검증
  if (!hasTourApiKey) {
    results.push({
      name: "한국관광공사 API 키",
      passed: false,
      message: "TOUR_API_KEY 또는 NEXT_PUBLIC_TOUR_API_KEY 중 하나는 필수입니다.",
      details: "한국관광공사 API를 사용하려면 둘 중 하나를 설정해야 합니다.",
    });
  }

  return results;
}

/**
 * 검증 결과 리포트 출력
 */
function printReport(results: VerificationResult[]) {
  console.log("\n" + "=".repeat(70));
  console.log("🔐 환경변수 보안 검증 결과");
  console.log("=".repeat(70) + "\n");

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const total = results.length;

  // 섹션별 그룹핑
  const clerkResults = results.filter((r) =>
    r.name.startsWith("NEXT_PUBLIC_CLERK_") || r.name.startsWith("CLERK_")
  );
  const supabaseResults = results.filter((r) =>
    r.name.startsWith("NEXT_PUBLIC_SUPABASE_") || r.name.startsWith("SUPABASE_")
  );
  const apiResults = results.filter(
    (r) =>
      r.name.includes("TOUR_API_KEY") ||
      r.name.includes("NAVER_MAP") ||
      r.name === "한국관광공사 API 키"
  );
  const optionalResults = results.filter(
    (r) =>
      r.name.startsWith("NEXT_PUBLIC_SITE_URL") || r.name.startsWith("VERCEL_URL")
  );

  if (clerkResults.length > 0) {
    console.log("📋 Clerk 인증 환경변수");
    console.log("-".repeat(70));
    clerkResults.forEach((result) => {
      const icon = result.passed ? "✅" : "❌";
      console.log(`${icon} ${result.name}`);
      console.log(`   ${result.message}`);
      if (result.details) {
        console.log(`   📝 ${result.details}`);
      }
      console.log();
    });
  }

  if (supabaseResults.length > 0) {
    console.log("📋 Supabase 환경변수");
    console.log("-".repeat(70));
    supabaseResults.forEach((result) => {
      const icon = result.passed ? "✅" : "❌";
      console.log(`${icon} ${result.name}`);
      console.log(`   ${result.message}`);
      if (result.details) {
        console.log(`   📝 ${result.details}`);
      }
      console.log();
    });
  }

  if (apiResults.length > 0) {
    console.log("📋 API 환경변수");
    console.log("-".repeat(70));
    apiResults.forEach((result) => {
      const icon = result.passed ? "✅" : "❌";
      console.log(`${icon} ${result.name}`);
      console.log(`   ${result.message}`);
      if (result.details) {
        console.log(`   📝 ${result.details}`);
      }
      console.log();
    });
  }

  if (optionalResults.length > 0) {
    console.log("📋 선택적 환경변수");
    console.log("-".repeat(70));
    optionalResults.forEach((result) => {
      const icon = result.passed ? "✅" : "ℹ️";
      console.log(`${icon} ${result.name}`);
      console.log(`   ${result.message}`);
      if (result.details) {
        console.log(`   📝 ${result.details}`);
      }
      console.log();
    });
  }

  console.log("=".repeat(70));
  console.log(`\n📈 요약: ${passed}/${total} 항목 통과, ${failed} 항목 실패\n`);

  if (failed > 0) {
    console.log("⚠️  실패한 항목이 있습니다. 다음을 확인하세요:");
    console.log("   1. .env 파일이 프로젝트 루트에 있는지 확인");
    console.log("   2. .env.example 파일을 참고하여 필수 환경변수 설정");
    console.log("   3. docs/ENV_SETUP.md 가이드를 참고하세요");
    console.log();
    console.log("🔒 보안 주의사항:");
    console.log("   - SUPABASE_SERVICE_ROLE_KEY와 CLERK_SECRET_KEY는 절대 공개하지 마세요");
    console.log("   - .env 파일은 .gitignore에 포함되어 있어야 합니다");
    console.log("   - 프로덕션 환경에서는 Vercel 대시보드에서 환경변수를 설정하세요");
    console.log();
    process.exit(1);
  } else {
    console.log("🎉 모든 필수 환경변수가 올바르게 설정되었습니다!");
    console.log("   Phase 6 최적화 & 배포를 진행할 수 있습니다.\n");
  }
}

/**
 * 메인 함수
 */
function main() {
  try {
    console.log("🔍 환경변수 보안 검증을 시작합니다...\n");

    const results = verifyEnvVars();
    printReport(results);
  } catch (error) {
    console.error("\n❌ 검증 중 오류 발생:");
    console.error(error instanceof Error ? error.message : String(error));
    console.error("\n환경변수 검증 스크립트를 확인하세요.");
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

export { verifyEnvVars, ENV_VARS };


