# 배포 가이드

이 문서는 My Trip 프로젝트를 Vercel에 배포하는 방법을 안내합니다.

## 목차

1. [Vercel 프로젝트 생성](#vercel-프로젝트-생성)
2. [환경변수 설정](#환경변수-설정)
3. [빌드 테스트](#빌드-테스트)
4. [배포 실행](#배포-실행)
5. [배포 후 테스트](#배포-후-테스트)
6. [문제 해결](#문제-해결)

---

## Vercel 프로젝트 생성

### 1. Vercel 계정 생성

1. [Vercel 웹사이트](https://vercel.com)에 접속
2. **Sign Up** 클릭
3. GitHub, GitLab, 또는 Bitbucket 계정으로 로그인 (권장)
4. 이메일 인증 완료

### 2. Git 저장소 준비

배포하기 전에 프로젝트가 Git 저장소에 푸시되어 있어야 합니다:

```bash
# Git 저장소 초기화 (아직 초기화하지 않은 경우)
git init

# 원격 저장소 추가 (GitHub, GitLab, Bitbucket 등)
git remote add origin <your-repository-url>

# 코드 커밋 및 푸시
git add .
git commit -m "Initial commit"
git push -u origin main
```

### 3. Vercel 프로젝트 생성

#### 방법 1: Vercel 대시보드에서 생성 (권장)

1. [Vercel 대시보드](https://vercel.com/dashboard)에 로그인
2. **Add New...** > **Project** 클릭
3. Git 저장소 선택 (GitHub, GitLab, Bitbucket)
4. 프로젝트 선택 또는 **Import** 클릭
5. 프로젝트 설정:
   - **Project Name**: `my-trip` (또는 원하는 이름)
   - **Framework Preset**: Next.js (자동 감지)
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `pnpm build` (자동 감지)
   - **Output Directory**: `.next` (기본값)
   - **Install Command**: `pnpm install` (자동 감지)
6. **Deploy** 클릭

#### 방법 2: Vercel CLI 사용

```bash
# Vercel CLI 설치
pnpm add -g vercel

# 프로젝트 루트에서 실행
vercel

# 첫 배포 시 설정 질문에 답변:
# - Set up and deploy? Y
# - Which scope? (계정 선택)
# - Link to existing project? N
# - Project name? my-trip
# - Directory? ./
# - Override settings? N
```

### 4. 배포 자동화 설정

Vercel은 Git 저장소와 연동되면 자동으로 배포를 설정합니다:

- **Production 배포**: `main` 브랜치에 푸시 시 자동 배포
- **Preview 배포**: 다른 브랜치에 푸시 시 자동 프리뷰 배포
- **Pull Request**: PR 생성 시 자동 프리뷰 배포

설정 확인:
1. Vercel 대시보드 > 프로젝트 선택
2. **Settings** > **Git** 탭
3. **Production Branch**: `main` 확인
4. **Automatic deployments from Git**: 활성화 확인

---

## 환경변수 설정

### 1. Vercel 대시보드에서 환경변수 추가

1. Vercel 대시보드 > 프로젝트 선택
2. **Settings** 탭 클릭
3. 왼쪽 메뉴에서 **Environment Variables** 클릭
4. 각 환경변수를 추가:

   - **Name**: 환경변수 이름 (예: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`)
   - **Value**: 환경변수 값
   - **Environment**: 적용할 환경 선택
     - **Production**: 프로덕션 환경
     - **Preview**: 프리뷰 환경 (PR 등)
     - **Development**: 개발 환경

5. **Save** 클릭

### 2. 필수 환경변수 목록

다음 환경변수를 모두 설정해야 합니다:

#### Clerk 인증

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (Production, Preview, Development)
- `CLERK_SECRET_KEY` (Production, Preview, Development)

#### Supabase

- `NEXT_PUBLIC_SUPABASE_URL` (Production, Preview, Development)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Production, Preview, Development)
- `SUPABASE_SERVICE_ROLE_KEY` (Production, Preview, Development)
- `NEXT_PUBLIC_STORAGE_BUCKET` (선택적, 기본값: `uploads`)

#### 한국관광공사 API

- `TOUR_API_KEY` 또는 `NEXT_PUBLIC_TOUR_API_KEY` 중 하나 (Production, Preview, Development)

#### 네이버 지도

- `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` (Production, Preview, Development)

### 3. 환경변수 추가 순서

다음 순서로 환경변수를 추가하는 것을 권장합니다:

1. **Clerk 인증** (인증 기능 사용 시)
2. **Supabase** (데이터베이스 사용 시)
3. **한국관광공사 API** (API 기능 사용 시)
4. **네이버 지도** (지도 기능 사용 시)

### 4. 환경변수 검증

환경변수 설정 후 다음을 확인하세요:

1. 모든 필수 환경변수가 설정되었는지 확인
2. 환경별 설정이 올바른지 확인 (Production, Preview, Development)
3. 환경변수 값이 올바른지 확인 (오타, 공백 등)

자세한 환경변수 설정 방법은 [docs/ENV_SETUP.md](ENV_SETUP.md)를 참고하세요.

### 5. 환경변수 적용

환경변수 설정 후 프로젝트를 다시 배포하면 새로운 환경변수가 적용됩니다:

```bash
# 자동 배포 (Git push 시)
git push origin main

# 또는 수동 배포
# Vercel 대시보드 > Deployments > Redeploy 클릭
```

---

## 빌드 테스트

### 1. 로컬 빌드 테스트

배포하기 전에 로컬에서 빌드 테스트를 수행하세요:

```bash
# 의존성 설치
pnpm install

# 빌드 실행
pnpm build
```

### 2. 빌드 성공 확인

빌드가 성공하면 다음 메시지가 표시됩니다:

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    5.2 kB         85.3 kB
└ ○ /places/[contentId]                 8.1 kB         88.2 kB
...
```

### 3. 빌드 에러 해결

빌드 중 에러가 발생하면 다음을 확인하세요:

1. **TypeScript 에러**: 타입 오류 확인 및 수정
2. **환경변수 누락**: `.env` 파일 확인
3. **의존성 문제**: `pnpm install` 재실행
4. **Next.js 설정**: `next.config.ts` 확인

### 4. 빌드 최적화 확인

번들 크기를 확인하여 최적화 여부를 확인하세요:

```bash
# 번들 분석 실행
pnpm analyze
```

번들 분석 결과를 확인하고 불필요한 의존성을 제거하세요.

### 5. 빌드 경고 확인

빌드 중 경고가 표시되면 다음을 확인하세요:

- **이미지 최적화**: Next.js Image 컴포넌트 사용 확인
- **코드 분할**: 동적 import 사용 확인
- **불필요한 코드**: 사용하지 않는 import 제거

---

## 배포 실행

### 1. 자동 배포 (Git Push)

Vercel은 Git 저장소와 연동되면 자동으로 배포합니다:

```bash
# main 브랜치에 푸시하면 Production 배포
git push origin main

# 다른 브랜치에 푸시하면 Preview 배포
git checkout -b feature/new-feature
git push origin feature/new-feature
```

### 2. 수동 배포

Vercel 대시보드에서 수동으로 배포할 수 있습니다:

1. Vercel 대시보드 > 프로젝트 선택
2. **Deployments** 탭 클릭
3. **Redeploy** 버튼 클릭
4. 배포할 브랜치 선택
5. **Redeploy** 클릭

### 3. 배포 로그 확인

배포 중 또는 배포 후 로그를 확인할 수 있습니다:

1. Vercel 대시보드 > 프로젝트 선택
2. **Deployments** 탭 클릭
3. 배포 항목 클릭
4. **Build Logs** 탭에서 빌드 로그 확인
5. **Function Logs** 탭에서 런타임 로그 확인

### 4. 배포 성공 확인

배포가 성공하면 다음을 확인할 수 있습니다:

- **Status**: Ready (초록색)
- **URL**: 배포된 사이트 URL (예: `https://my-trip.vercel.app`)
- **Build Time**: 빌드 소요 시간

---

## 배포 후 테스트

### 1. 기본 기능 테스트

배포 후 다음 기능을 테스트하세요:

#### 홈페이지 (`/`)

- [ ] 페이지 로딩 확인
- [ ] 관광지 목록 표시 확인
- [ ] 필터 기능 테스트 (지역, 타입)
- [ ] 검색 기능 테스트
- [ ] 지도 표시 확인
- [ ] 무한 스크롤 동작 확인

#### 상세페이지 (`/places/[contentId]`)

- [ ] 관광지 상세 정보 표시 확인
- [ ] 이미지 갤러리 동작 확인
- [ ] 지도 표시 확인
- [ ] 공유 기능 테스트
- [ ] 북마크 기능 테스트 (로그인 필요)

#### 통계 페이지 (`/stats`)

- [ ] 통계 요약 카드 표시 확인
- [ ] 지역별 분포 차트 표시 확인
- [ ] 타입별 분포 차트 표시 확인

#### 북마크 페이지 (`/bookmarks`)

- [ ] 로그인 후 접근 확인
- [ ] 북마크 목록 표시 확인
- [ ] 북마크 삭제 기능 테스트

#### 인증 기능

- [ ] 로그인 기능 테스트
- [ ] 로그아웃 기능 테스트
- [ ] 회원가입 기능 테스트 (선택적)

### 2. 성능 확인

#### Lighthouse 점수 측정

1. 배포된 사이트 URL 접속
2. Chrome DevTools 열기 (F12)
3. **Lighthouse** 탭 선택
4. **Generate report** 클릭
5. 목표 점수 확인:
   - **Performance**: > 80
   - **Accessibility**: > 90
   - **Best Practices**: > 90
   - **SEO**: > 90

#### 페이지 로딩 속도 확인

- [ ] 초기 로딩 시간 < 3초
- [ ] 이미지 로딩 시간 확인
- [ ] API 응답 시간 확인

### 3. 에러 모니터링

#### 브라우저 콘솔 확인

1. 배포된 사이트 접속
2. Chrome DevTools 열기 (F12)
3. **Console** 탭 확인
4. 에러 메시지 확인 및 수정

#### Vercel 로그 확인

1. Vercel 대시보드 > 프로젝트 선택
2. **Deployments** 탭 클릭
3. 배포 항목 클릭
4. **Function Logs** 탭에서 런타임 에러 확인

#### API 에러 확인

- [ ] 한국관광공사 API 호출 성공 확인
- [ ] Supabase API 호출 성공 확인
- [ ] 네이버 지도 API 호출 성공 확인

### 4. 환경변수 확인

배포 후 환경변수가 올바르게 적용되었는지 확인하세요:

1. Vercel 대시보드 > 프로젝트 선택
2. **Settings** > **Environment Variables** 확인
3. 모든 필수 환경변수가 설정되어 있는지 확인
4. 환경변수 값이 올바른지 확인

환경변수 관련 에러가 발생하면:
- 환경변수 이름 확인 (대소문자 구분)
- 환경변수 값 확인 (공백, 특수문자 등)
- 환경변수 적용 환경 확인 (Production, Preview, Development)

---

## 문제 해결

### 1. 빌드 실패

**증상**: Vercel 배포 시 빌드 실패

**해결 방법**:
1. 로컬에서 `pnpm build` 실행하여 에러 확인
2. TypeScript 에러 수정
3. 환경변수 누락 확인
4. 의존성 문제 확인 (`pnpm install` 재실행)

### 2. 환경변수 미적용

**증상**: 배포 후 환경변수가 적용되지 않음

**해결 방법**:
1. Vercel 대시보드에서 환경변수 확인
2. 환경변수 설정 후 재배포
3. 환경변수 이름 확인 (대소문자 구분)
4. 환경변수 적용 환경 확인 (Production, Preview, Development)

### 3. 페이지 로딩 실패

**증상**: 배포된 사이트가 로딩되지 않음

**해결 방법**:
1. Vercel 대시보드에서 배포 상태 확인
2. 빌드 로그 확인
3. 런타임 로그 확인
4. 브라우저 콘솔 에러 확인

### 4. API 호출 실패

**증상**: API 호출이 실패함

**해결 방법**:
1. 환경변수 확인 (API 키 등)
2. CORS 설정 확인
3. API 호출 제한 확인
4. 네트워크 연결 확인

### 5. 이미지 로딩 실패

**증상**: 이미지가 표시되지 않음

**해결 방법**:
1. `next.config.ts`에서 이미지 도메인 설정 확인
2. 이미지 URL 형식 확인
3. 외부 이미지 도메인 허용 확인

---

## 추가 자료

- [Vercel 공식 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [환경변수 설정 가이드](ENV_SETUP.md)
- [배포 전 체크리스트](DEPLOYMENT_CHECKLIST.md)

---

## 문의

배포에 문제가 있으면 다음을 확인하세요:

1. 이 문서의 [문제 해결](#문제-해결) 섹션
2. Vercel 대시보드의 빌드 로그
3. 각 서비스의 공식 문서

