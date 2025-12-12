# 환경변수 설정 가이드

이 문서는 My Trip 프로젝트의 환경변수를 설정하는 방법을 안내합니다.

## 목차

1. [개발 환경 설정](#개발-환경-설정)
2. [프로덕션 환경 설정 (Vercel)](#프로덕션-환경-설정-vercel)
3. [환경변수 목록](#환경변수-목록)
4. [환경변수 검증](#환경변수-검증)
5. [문제 해결](#문제-해결)

---

## 개발 환경 설정

### 1. .env.example 파일 생성 (필요한 경우)

프로젝트 루트에 `.env.example` 파일이 없으면 다음 내용으로 생성하세요:

```bash
# =====================================================
# My Trip - 환경변수 설정 예시
# =====================================================
# 이 파일을 복사하여 .env 파일을 생성하고 실제 값을 입력하세요.
# cp .env.example .env
#
# ⚠️ 주의: .env 파일은 절대 Git에 커밋하지 마세요!
# =====================================================

# =====================================================
# Clerk Authentication
# =====================================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# =====================================================
# Supabase
# =====================================================
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_STORAGE_BUCKET=uploads

# =====================================================
# 한국관광공사 API
# =====================================================
# TOUR_API_KEY 또는 NEXT_PUBLIC_TOUR_API_KEY 중 하나 설정
TOUR_API_KEY=
# 또는
NEXT_PUBLIC_TOUR_API_KEY=

# =====================================================
# 네이버 지도
# =====================================================
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=

# =====================================================
# 선택적 환경변수
# =====================================================
NEXT_PUBLIC_SITE_URL=
VERCEL_URL=
```

### 2. .env 파일 생성

프로젝트 루트에 `.env` 파일을 생성합니다:

```bash
cp .env.example .env
```

또는 `.env.example` 파일이 없으면 직접 `.env` 파일을 생성하세요.

### 2. 환경변수 값 입력

`.env` 파일을 열고 각 환경변수에 실제 값을 입력합니다. 각 환경변수별 설정 방법은 아래 [환경변수 목록](#환경변수-목록) 섹션을 참고하세요.

### 3. 환경변수 검증

환경변수가 올바르게 설정되었는지 확인합니다:

```bash
pnpm verify-env
```

모든 필수 환경변수가 설정되어 있으면 성공 메시지가 표시됩니다.

---

## 프로덕션 환경 설정 (Vercel)

### 1. Vercel 대시보드 접속

1. [Vercel 대시보드](https://vercel.com/dashboard)에 로그인
2. 프로젝트 선택 또는 새 프로젝트 생성

### 2. 환경변수 설정

1. 프로젝트 대시보드에서 **Settings** 탭 클릭
2. 왼쪽 메뉴에서 **Environment Variables** 클릭
3. 각 환경변수를 추가:

   - **Name**: 환경변수 이름 (예: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`)
   - **Value**: 환경변수 값
   - **Environment**: 적용할 환경 선택
     - **Production**: 프로덕션 환경
     - **Preview**: 프리뷰 환경 (PR 등)
     - **Development**: 개발 환경

4. **Save** 클릭

### 3. 환경변수 추가 순서

다음 순서로 환경변수를 추가하는 것을 권장합니다:

1. **Clerk 인증** (인증 기능 사용 시)
2. **Supabase** (데이터베이스 사용 시)
3. **한국관광공사 API** (API 기능 사용 시)
4. **네이버 지도** (지도 기능 사용 시)

### 4. 배포 후 확인

환경변수 설정 후 프로젝트를 다시 배포하면 새로운 환경변수가 적용됩니다:

```bash
# 자동 배포 (Git push 시)
git push origin main

# 또는 수동 배포
# Vercel 대시보드에서 "Redeploy" 클릭
```

---

## 환경변수 목록

### Clerk 인증

#### `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (필수)

- **설명**: Clerk Publishable Key (클라이언트에서 사용)
- **설정 방법**:
  1. [Clerk 대시보드](https://dashboard.clerk.com) 접속
  2. 프로젝트 선택
  3. **API Keys** 페이지로 이동
  4. **Publishable Key** 복사
  5. `.env` 파일에 붙여넣기
- **형식**: `pk_test_...` 또는 `pk_live_...`
- **예시**: `pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

#### `CLERK_SECRET_KEY` (필수)

- **설명**: Clerk Secret Key (서버 사이드 전용, 비공개)
- **설정 방법**:
  1. Clerk 대시보드 > **API Keys** 페이지
  2. **Secret Key** 복사
  3. `.env` 파일에 붙여넣기
- **형식**: `sk_test_...` 또는 `sk_live_...`
- **예시**: `sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **⚠️ 보안 주의**: 절대 공개하지 마세요!

#### `NEXT_PUBLIC_CLERK_SIGN_IN_URL` (선택적)

- **설명**: Clerk 로그인 URL
- **기본값**: `/sign-in`
- **설정**: 기본값을 사용하지 않는 경우에만 설정

#### `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` (선택적)

- **설명**: 로그인 후 리다이렉트 URL
- **기본값**: `/`
- **설정**: 기본값을 사용하지 않는 경우에만 설정

#### `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` (선택적)

- **설명**: 회원가입 후 리다이렉트 URL
- **기본값**: `/`
- **설정**: 기본값을 사용하지 않는 경우에만 설정

---

### Supabase

#### `NEXT_PUBLIC_SUPABASE_URL` (필수)

- **설명**: Supabase Project URL (클라이언트에서 사용)
- **설정 방법**:
  1. [Supabase 대시보드](https://app.supabase.com) 접속
  2. 프로젝트 선택
  3. **Settings** > **API** 페이지로 이동
  4. **Project URL** 복사
  5. `.env` 파일에 붙여넣기
- **형식**: `https://xxxxxxxxxxxxx.supabase.co`
- **예시**: `https://abcdefghijklmnop.supabase.co`

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY` (필수)

- **설명**: Supabase Anon Key (클라이언트에서 사용)
- **설정 방법**:
  1. Supabase 대시보드 > **Settings** > **API** 페이지
  2. **anon public** 키 복사
  3. `.env` 파일에 붙여넣기
- **형식**: JWT 토큰 형식
- **예시**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### `SUPABASE_SERVICE_ROLE_KEY` (필수)

- **설명**: Supabase Service Role Key (서버 사이드 전용, 매우 중요, 비공개)
- **설정 방법**:
  1. Supabase 대시보드 > **Settings** > **API** 페이지
  2. **service_role secret** 키 복사
  3. `.env` 파일에 붙여넣기
- **형식**: JWT 토큰 형식
- **예시**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **⚠️ 보안 주의**: 
  - 절대 공개하지 마세요!
  - 이 키는 모든 RLS(Row Level Security)를 우회하는 관리자 권한입니다
  - 클라이언트 코드에 포함하지 마세요
  - Git에 커밋하지 마세요

#### `NEXT_PUBLIC_STORAGE_BUCKET` (선택적)

- **설명**: Supabase Storage Bucket 이름
- **기본값**: `uploads`
- **설정**: 기본값을 사용하지 않는 경우에만 설정

---

### 한국관광공사 API

#### `TOUR_API_KEY` 또는 `NEXT_PUBLIC_TOUR_API_KEY` (필수, 둘 중 하나)

- **설명**: 한국관광공사 공공 API 키
- **우선순위**: `TOUR_API_KEY` > `NEXT_PUBLIC_TOUR_API_KEY`
- **설정 방법**:
  1. [한국관광공사 공공 API](https://www.data.go.kr/data/15101578/openapi.do) 접속
  2. API 키 발급 신청
  3. 발급받은 API 키 복사
  4. `.env` 파일에 붙여넣기
     - 서버 사이드에서만 사용: `TOUR_API_KEY` 설정
     - 클라이언트에서도 사용: `NEXT_PUBLIC_TOUR_API_KEY` 설정
- **형식**: 문자열 (일반적으로 50자 이상)
- **예시**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

**참고**: 
- `TOUR_API_KEY`는 서버 사이드에서만 사용되므로 보안상 더 안전합니다
- `NEXT_PUBLIC_TOUR_API_KEY`는 클라이언트 코드에 노출되므로, 공개 API 키인 경우에만 사용하세요

---

### 네이버 지도

#### `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` (필수)

- **설명**: 네이버 지도 API Client ID (클라이언트에서 사용)
- **설정 방법**: 
  - **상세 가이드**: [네이버 지도 API 설정 가이드](NAVER_MAP_API_SETUP.md) 참고
  - **간단 요약**:
    1. [네이버 클라우드 플랫폼](https://www.ncloud.com) 접속
    2. 로그인 후 **Services** > **Maps** 선택
    3. **Web Dynamic Map** 서비스 활성화
    4. **Application** 등록 후 **Client ID** 발급
    5. `.env` 파일에 붙여넣기
- **형식**: 문자열
- **예시**: `xxxxxxxxxxxxxxxxxx`

**참고**: 
- 네이버 클라우드 플랫폼은 신용카드 등록이 필요할 수 있습니다
- 월 10,000,000건까지 무료로 사용 가능합니다
- **중요**: Application 등록 시 배포된 사이트 URL을 등록해야 합니다

---

### 선택적 환경변수

#### `NEXT_PUBLIC_SITE_URL` (선택적)

- **설명**: 프로덕션 사이트 URL
- **기본값**: `VERCEL_URL` 또는 `http://localhost:3000`
- **설정**: Vercel 배포 시 자동으로 설정되지만, 수동으로 설정할 수도 있습니다
- **예시**: `https://my-trip.vercel.app`

#### `VERCEL_URL` (선택적)

- **설명**: Vercel 자동 설정 URL
- **설정**: Vercel 배포 시 자동으로 설정됩니다
- **개발 환경**: 설정하지 않아도 됩니다

---

## 환경변수 검증

### 검증 스크립트 실행

프로젝트 루트에서 다음 명령어를 실행하여 환경변수를 검증합니다:

```bash
pnpm verify-env
```

### 검증 항목

검증 스크립트는 다음을 확인합니다:

1. **필수 환경변수 존재 여부**: 모든 필수 환경변수가 설정되어 있는지 확인
2. **환경변수 형식 검증**: 
   - Clerk 키는 `pk_` 또는 `sk_`로 시작하는지 확인
   - Supabase URL은 `https://`로 시작하고 `supabase.co` 도메인을 포함하는지 확인
   - 기타 환경변수의 길이 검증
3. **한국관광공사 API 키**: `TOUR_API_KEY` 또는 `NEXT_PUBLIC_TOUR_API_KEY` 중 하나가 설정되어 있는지 확인

### 검증 결과

검증이 성공하면:

```
🎉 모든 필수 환경변수가 올바르게 설정되었습니다!
   Phase 6 최적화 & 배포를 진행할 수 있습니다.
```

검증이 실패하면:

```
⚠️  실패한 항목이 있습니다. 다음을 확인하세요:
   1. .env 파일이 프로젝트 루트에 있는지 확인
   2. .env.example 파일을 참고하여 필수 환경변수 설정
   3. docs/ENV_SETUP.md 가이드를 참고하세요
```

---

## 문제 해결

### 1. 환경변수를 찾을 수 없음

**증상**: `process.env.XXX is undefined` 에러

**해결 방법**:
1. `.env` 파일이 프로젝트 루트에 있는지 확인
2. 환경변수 이름이 정확한지 확인 (대소문자 구분)
3. 개발 서버를 재시작: `pnpm dev`

### 2. Clerk 인증이 작동하지 않음

**증상**: 로그인 버튼 클릭 시 에러

**해결 방법**:
1. `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`가 `pk_`로 시작하는지 확인
2. `CLERK_SECRET_KEY`가 `sk_`로 시작하는지 확인
3. Clerk 대시보드에서 키가 활성화되어 있는지 확인

### 3. Supabase 연결 실패

**증상**: 데이터베이스 쿼리 실패

**해결 방법**:
1. `NEXT_PUBLIC_SUPABASE_URL`이 올바른 형식인지 확인
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 올바른지 확인
3. Supabase 프로젝트가 활성화되어 있는지 확인
4. 네트워크 연결 확인

### 4. 한국관광공사 API 에러

**증상**: API 호출 실패

**해결 방법**:
1. `TOUR_API_KEY` 또는 `NEXT_PUBLIC_TOUR_API_KEY` 중 하나가 설정되어 있는지 확인
2. API 키가 유효한지 확인 (한국관광공사 API 사이트에서 확인)
3. API 호출 제한에 도달하지 않았는지 확인

### 5. 네이버 지도가 표시되지 않음

**증상**: 지도가 로드되지 않음

**해결 방법**:
1. `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`가 설정되어 있는지 확인
2. 네이버 클라우드 플랫폼에서 Web Dynamic Map 서비스가 활성화되어 있는지 확인
3. 브라우저 콘솔에서 에러 메시지 확인

### 6. Vercel 배포 시 환경변수 미적용

**증상**: 배포 후 환경변수가 적용되지 않음

**해결 방법**:
1. Vercel 대시보드에서 환경변수가 올바르게 설정되어 있는지 확인
2. 환경변수 설정 후 프로젝트를 다시 배포
3. Vercel 대시보드 > **Deployments** > **Redeploy** 클릭

---

## 보안 주의사항

### 절대 공개하지 마세요

다음 환경변수는 절대 공개하지 마세요:

- `CLERK_SECRET_KEY`: 서버 사이드 전용, 인증 토큰 서명에 사용
- `SUPABASE_SERVICE_ROLE_KEY`: 모든 RLS를 우회하는 관리자 권한

### Git에 커밋하지 마세요

- `.env` 파일은 `.gitignore`에 포함되어 있어야 합니다
- 환경변수 값이 포함된 코드를 커밋하지 마세요
- `.env.example` 파일만 커밋하세요 (값 없이 키만 포함)

### 프로덕션 환경

- 프로덕션 환경에서는 Vercel 대시보드에서 환경변수를 설정하세요
- 환경변수 값은 암호화되어 저장됩니다
- 환경변수 변경 후 반드시 재배포하세요

---

## 추가 자료

- [Clerk 문서](https://clerk.com/docs)
- [Supabase 문서](https://supabase.com/docs)
- [한국관광공사 API 문서](https://www.data.go.kr/data/15101578/openapi.do)
- [네이버 지도 API 문서](https://navermaps.github.io/maps.js.ncp/docs/)
- [Vercel 환경변수 가이드](https://vercel.com/docs/concepts/projects/environment-variables)

---

## 문의

환경변수 설정에 문제가 있으면 다음을 확인하세요:

1. 이 문서의 [문제 해결](#문제-해결) 섹션
2. 프로젝트의 `scripts/verify-env.ts` 스크립트 실행
3. 각 서비스의 공식 문서

