-- =====================================================
-- 마이그레이션: errors 테이블 생성
-- 작성일: 2025-01-01
-- 설명: 에러 로깅을 위한 errors 테이블
-- =====================================================

-- errors 테이블 생성
CREATE TABLE IF NOT EXISTS public.errors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    error_message TEXT NOT NULL,
    error_stack TEXT,
    error_code TEXT,
    page_url TEXT,
    browser_info TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 테이블 소유자 설정
ALTER TABLE public.errors OWNER TO postgres;

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_errors_user_id ON public.errors(user_id);
CREATE INDEX IF NOT EXISTS idx_errors_created_at ON public.errors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_errors_error_code ON public.errors(error_code);

-- Row Level Security (RLS) 비활성화 (개발 환경)
ALTER TABLE public.errors DISABLE ROW LEVEL SECURITY;

-- 권한 부여
GRANT ALL ON TABLE public.errors TO anon;
GRANT ALL ON TABLE public.errors TO authenticated;
GRANT ALL ON TABLE public.errors TO service_role;

-- 테이블 설명
COMMENT ON TABLE public.errors IS '에러 로깅 정보 - 프로덕션 환경에서 발생하는 에러 추적';
COMMENT ON COLUMN public.errors.user_id IS '에러가 발생한 사용자 ID (선택 사항)';
COMMENT ON COLUMN public.errors.error_message IS '에러 메시지';
COMMENT ON COLUMN public.errors.error_stack IS '에러 스택 트레이스';
COMMENT ON COLUMN public.errors.error_code IS '에러 코드';
COMMENT ON COLUMN public.errors.page_url IS '에러가 발생한 페이지 URL';
COMMENT ON COLUMN public.errors.browser_info IS '브라우저 정보 (JSON 형식)';
COMMENT ON COLUMN public.errors.user_agent IS 'User Agent 문자열';

