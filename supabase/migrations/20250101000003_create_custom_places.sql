-- =====================================================
-- 마이그레이션: custom_places 테이블 생성
-- 설명: 사용자가 직접 등록하는 '마이 플레이스' 기능 지원
-- =====================================================

CREATE TABLE IF NOT EXISTS public.custom_places (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    address TEXT,
    description TEXT,
    image_url TEXT,
    map_x DOUBLE PRECISION, -- 경도 (Longitude)
    map_y DOUBLE PRECISION, -- 위도 (Latitude)
    content_type_id TEXT DEFAULT '12', -- 기본값: 관광지(12)
    is_public BOOLEAN DEFAULT false, -- 공개 여부 (기본값: 비공개)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 테이블 소유자 설정
ALTER TABLE public.custom_places OWNER TO postgres;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_custom_places_user_id ON public.custom_places(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_places_created_at ON public.custom_places(created_at DESC);

-- RLS 비활성화 (개발 편의성)
ALTER TABLE public.custom_places DISABLE ROW LEVEL SECURITY;

-- 권한 부여
GRANT ALL ON TABLE public.custom_places TO anon;
GRANT ALL ON TABLE public.custom_places TO authenticated;
GRANT ALL ON TABLE public.custom_places TO service_role;

-- 테이블 코멘트
COMMENT ON TABLE public.custom_places IS '사용자가 직접 등록한 나만의 장소';
COMMENT ON COLUMN public.custom_places.map_x IS '경도 (Longitude)';
COMMENT ON COLUMN public.custom_places.map_y IS '위도 (Latitude)';
