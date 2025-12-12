-- =====================================================
-- 마이그레이션: bug_reports 테이블 생성
-- 작성일: 2025-01-01
-- 설명: 버그 리포트를 위한 bug_reports 테이블
-- =====================================================

-- bug_reports 테이블 생성
CREATE TABLE IF NOT EXISTS public.bug_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    steps_to_reproduce TEXT,
    expected_behavior TEXT,
    actual_behavior TEXT,
    screenshot_url TEXT,
    page_url TEXT NOT NULL,
    browser_info TEXT NOT NULL,
    screen_resolution TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 테이블 소유자 설정
ALTER TABLE public.bug_reports OWNER TO postgres;

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_bug_reports_user_id ON public.bug_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON public.bug_reports(status);
CREATE INDEX IF NOT EXISTS idx_bug_reports_created_at ON public.bug_reports(created_at DESC);

-- Row Level Security (RLS) 비활성화 (개발 환경)
ALTER TABLE public.bug_reports DISABLE ROW LEVEL SECURITY;

-- 권한 부여
GRANT ALL ON TABLE public.bug_reports TO anon;
GRANT ALL ON TABLE public.bug_reports TO authenticated;
GRANT ALL ON TABLE public.bug_reports TO service_role;

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_bug_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_bug_reports_updated_at
    BEFORE UPDATE ON public.bug_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_bug_reports_updated_at();

-- 테이블 설명
COMMENT ON TABLE public.bug_reports IS '버그 리포트 정보 - 사용자가 발견한 버그 신고';
COMMENT ON COLUMN public.bug_reports.user_id IS '버그를 신고한 사용자 ID (비로그인 사용자는 NULL)';
COMMENT ON COLUMN public.bug_reports.title IS '버그 제목';
COMMENT ON COLUMN public.bug_reports.description IS '버그 설명';
COMMENT ON COLUMN public.bug_reports.steps_to_reproduce IS '재현 단계';
COMMENT ON COLUMN public.bug_reports.expected_behavior IS '예상 동작';
COMMENT ON COLUMN public.bug_reports.actual_behavior IS '실제 동작';
COMMENT ON COLUMN public.bug_reports.screenshot_url IS '스크린샷 URL (Supabase Storage)';
COMMENT ON COLUMN public.bug_reports.page_url IS '버그가 발생한 페이지 URL';
COMMENT ON COLUMN public.bug_reports.browser_info IS '브라우저 정보 (JSON 형식)';
COMMENT ON COLUMN public.bug_reports.screen_resolution IS '화면 해상도';
COMMENT ON COLUMN public.bug_reports.status IS '버그 상태: open(열림), in_progress(진행중), resolved(해결됨), closed(닫힘)';

