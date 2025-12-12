/**
 * @file log-error/route.ts
 * @description 에러 로깅 API Route
 *
 * 프로덕션 환경에서 발생하는 에러를 Supabase에 저장하는 API Route입니다.
 * 서버 사이드에서만 실행되므로 service role을 안전하게 사용할 수 있습니다.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      error_message,
      error_stack,
      error_code,
      page_url,
      browser_info,
      user_agent,
    } = body;

    if (!error_message) {
      return NextResponse.json(
        { error: "에러 메시지가 제공되지 않았습니다." },
        { status: 400 }
      );
    }

    const supabase = getServiceRoleClient();

    const { error } = await supabase.from("errors").insert({
      user_id: user_id || null,
      error_message,
      error_stack: error_stack || null,
      error_code: error_code || null,
      page_url: page_url || null,
      browser_info: browser_info || null,
      user_agent: user_agent || null,
    });

    if (error) {
      console.error("[Log Error API] 저장 실패:", error);
      return NextResponse.json(
        { error: "에러 로깅에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Log Error API] 에러:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

