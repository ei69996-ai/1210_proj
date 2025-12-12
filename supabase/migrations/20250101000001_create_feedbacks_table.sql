-- =====================================================
-- 마이그레이션: feedbacks 테이블 생성
-- 작성일: 2025-01-01
-- 설명: 사용자 피드백 수집을 위한 feedbacks 테이블
-- =====================================================

-- feedbacks 테이블 생성
CREATE TABLE IF NOT EXISTS public.feedbacks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('suggestion', 'complaint', 'question')),
    content TEXT NOT NULL,
    page_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 테이블 소유자 설정
ALTER TABLE public.feedbacks OWNER TO postgres;

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_feedbacks_user_id ON public.feedbacks(user_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_type ON public.feedbacks(type);
CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON public.feedbacks(created_at DESC);

-- Row Level Security (RLS) 비활성화 (개발 환경)
ALTER TABLE public.feedbacks DISABLE ROW LEVEL SECURITY;

-- 권한 부여
GRANT ALL ON TABLE public.feedbacks TO anon;
GRANT ALL ON TABLE public.feedbacks TO authenticated;
GRANT ALL ON TABLE public.feedbacks TO service_role;

-- 테이블 설명
COMMENT ON TABLE public.feedbacks IS '사용자 피드백 정보 - 개선 의견, 불만, 질문 등';
COMMENT ON COLUMN public.feedbacks.user_id IS '피드백을 작성한 사용자 ID (비로그인 사용자는 NULL)';
COMMENT ON COLUMN public.feedbacks.type IS '피드백 타입: suggestion(제안), complaint(불만), question(질문)';
COMMENT ON COLUMN public.feedbacks.content IS '피드백 내용';
COMMENT ON COLUMN public.feedbacks.page_url IS '피드백이 발생한 페이지 URL';

