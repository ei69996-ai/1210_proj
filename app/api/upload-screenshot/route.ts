/**
 * @file upload-screenshot/route.ts
 * @description 스크린샷 업로드 API Route
 *
 * 버그 리포트의 스크린샷을 Supabase Storage에 업로드하는 API Route입니다.
 * 서버 사이드에서만 실행되므로 service role을 안전하게 사용할 수 있습니다.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "파일이 제공되지 않았습니다." },
        { status: 400 }
      );
    }

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "파일 크기는 5MB 이하여야 합니다." },
        { status: 400 }
      );
    }

    // 이미지 파일만 허용
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "이미지 파일만 업로드 가능합니다." },
        { status: 400 }
      );
    }

    const supabase = getServiceRoleClient();
    const bucketName = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "uploads";

    // 파일명 생성 (타임스탬프 + 랜덤 문자열)
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const fileExt = file.name.split(".").pop() || "png";
    const fileName = `bug-reports/${userId || "anonymous"}/${timestamp}-${randomStr}.${fileExt}`;

    // 파일 업로드
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("[Upload Screenshot API] 업로드 실패:", error);
      return NextResponse.json(
        { error: "파일 업로드에 실패했습니다." },
        { status: 500 }
      );
    }

    // 공개 URL 가져오기
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(data.path);

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("[Upload Screenshot API] 에러:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

