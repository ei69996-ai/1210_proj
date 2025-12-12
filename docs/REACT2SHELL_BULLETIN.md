# React2Shell Security Bulletin

CVE-2025-55182는 React, Next.js 및 기타 프레임워크의 중요한 취약점으로 즉각적인 조치가 필요합니다.

**출처**: [Vercel React2Shell Security Bulletin](https://vercel.com/kb/bulletin/react2shell)

**최종 업데이트**: 2025년 12월 9일

## 개요

2025년 12월 4일, React Server Components의 중요한 취약점인 React2Shell에 대한 공개 익스플로잇이 등장했습니다. 이 취약점은 React 19 (CVE-2025-55182)와 Next.js (CVE-2025-66478)를 포함한 이를 사용하는 프레임워크에 영향을 미칩니다.

## 필수 조치

이 취약점은 Next.js 버전 15.0.0부터 16.0.6까지 영향을 미칩니다. 영향을 받는 버전을 사용 중이라면 다른 보호 조치가 있더라도 즉시 업그레이드해야 합니다.

## 취약한 버전

다음 버전들이 취약합니다:

- **Next.js 15.0.0 ~ 16.0.6**: 모든 버전이 취약
- **Next.js 14 canary 버전**: 14.3.0-canary.76 이후 버전
- **React Server Components를 사용하는 모든 프레임워크**

## 패치된 버전

| 취약한 버전 | 패치된 버전 |
|------------|------------|
| Next.js 15.0.x | 15.0.5 |
| Next.js 15.1.x | 15.1.9 |
| Next.js 15.2.x | 15.2.6 |
| Next.js 15.3.x | 15.3.6 |
| Next.js 15.4.x | 15.4.8 |
| **Next.js 15.5.x** | **15.5.7** |
| Next.js 16.0.x | 16.0.7 |
| Next.js 14 canaries after 14.3.0-canary.76 | 14.3.0-canary.76로 다운그레이드 |
| Next.js 15 canaries before 15.6.0-canary.58 | 15.6.0-canary.58 |
| Next.js 16 canaries before 16.1.0-canary.12 | 16.1.0-canary.12 이상 |

## React2Shell이란?

React2Shell은 React Server Components의 중요한 취약점으로, React 19와 이를 사용하는 프레임워크에 영향을 미칩니다. 특정 조건에서 특수하게 제작된 요청이 의도하지 않은 원격 코드 실행으로 이어질 수 있습니다.

## 취약점 확인 방법

### 1. 자동 확인 도구 사용

Vercel에서 제공하는 자동 확인 및 업그레이드 도구를 사용할 수 있습니다:

```bash
npx fix-react2shell-next
```

이 도구는 취약한 패키지를 스캔하고 업그레이드합니다.

### 2. 수동 확인

`package.json`에서 현재 Next.js 버전을 확인하세요:

```json
{
  "dependencies": {
    "next": "15.5.7"
  }
}
```

또한 다음 패키지들의 버전도 확인해야 합니다:

- `next`
- `react-server-dom-webpack`
- `react-server-dom-parcel`
- `react-server-dom-turbopack`

### 3. Vercel 대시보드 확인

Vercel을 사용하는 경우, 프로덕션 배포가 취약한 버전을 사용 중이면 vercel.com 대시보드에 배너가 표시됩니다.

## 업그레이드 방법

### 방법 1: 자동 업그레이드 (권장)

Vercel Agent를 사용하여 자동으로 코드 리뷰를 수행하고 취약한 프로젝트를 업그레이드하는 Pull Request를 생성할 수 있습니다.

### 방법 2: 명령줄 유틸리티 사용

```bash
npx fix-react2shell-next
```

### 방법 3: 수동 업그레이드

1. **현재 버전 확인**

   `package.json`에서 현재 Next.js 버전을 확인합니다.

2. **패치된 버전으로 업데이트**

   위의 표를 참고하여 적절한 패치된 버전으로 `package.json`을 업데이트합니다:

   ```json
   {
     "dependencies": {
       "next": "15.5.7"
     }
   }
   ```

3. **의존성 설치**

   ```bash
   pnpm install
   ```

   **중요**: `package.json` 변경사항과 함께 lockfile 변경사항도 반드시 커밋해야 합니다.

4. **즉시 배포**

   테스트 후 가능한 한 빨리 업데이트된 애플리케이션을 배포하세요.

## Vercel 배포 보호

프로덕션 앱이 패치되었더라도 이전 버전은 여전히 취약할 수 있습니다. 프로덕션 도메인 외의 모든 배포에 대해 Standard Protection을 켜는 것을 강력히 권장합니다.

### 배포 보호 설정

1. Vercel 대시보드에서 프로젝트 선택
2. **Settings** > **Deployment Protection** 이동
3. 프로덕션 도메인 외의 모든 배포에 대해 Standard Protection 활성화

## 환경변수 로테이션

취약한 시스템이 잠재적으로 손상되었을 수 있다고 가정하세요. 프레임워크 버전을 패치하고 애플리케이션을 재배포한 후, 모든 애플리케이션 시크릿을 로테이션하는 것을 권장합니다.

Vercel 팀 및 프로젝트의 환경변수를 로테이션하는 방법은 [Vercel 문서](https://vercel.com/docs/environment-variables/rotating-secrets)를 참고하세요.

## Vercel WAF 보호

Vercel WAF 규칙은 알려진 익스플로잇 패턴을 필터링하여 추가 방어 계층을 제공합니다:

- CVE 발표 전에 Vercel은 React 팀과 협력하여 익스플로잇을 차단하는 WAF 규칙을 설계하고 모든 Vercel 사용자에게 전역 보호를 제공했습니다.
- 새로운 익스플로잇 변형에 대한 지속적인 모니터링과 반복적인 WAF 규칙 업데이트

**중요**: WAF 규칙은 공격의 모든 가능한 변형에 대해 100% 보호를 보장할 수 없습니다. 패치된 버전으로 업그레이드하는 것이 유일한 완전한 수정 방법입니다.

## 자주 묻는 질문

### 가장 쉬운 업그레이드 방법은?

Vercel에서 취약한 패키지를 스캔하고 업그레이드하는 npm 패키지를 릴리스했습니다:

```bash
npx fix-react2shell-next
```

### 내 앱이 이 CVE로 인해 공격받았는지 어떻게 알 수 있나요?

확실하게 알 수는 없지만, 애플리케이션 로그와 활동을 검토하여 예상치 못한 동작을 확인하는 것을 권장합니다. 여기에는 예상치 못한 POST 요청이나 함수 타임아웃 급증이 포함될 수 있습니다.

### 사용 가능한 보호 조치는 무엇인가요?

패치된 버전으로 업그레이드하는 것이 유일한 완전한 수정 방법입니다. Vercel WAF 규칙은 알려진 익스플로잇 패턴을 필터링하여 추가 방어 계층을 제공하지만, WAF 규칙은 공격의 모든 가능한 변형에 대해 100% 보호를 보장할 수 없습니다.

## 추가 자료

- [공식 Next.js 보안 공지](https://nextjs.org/security)
- [React 보안 공지](https://react.dev/blog/security)
- 추가 질문: security@vercel.com

## 참고

이 문서는 [Vercel React2Shell Security Bulletin](https://vercel.com/kb/bulletin/react2shell)을 기반으로 작성되었습니다. 최신 정보는 원본 문서를 참고하세요.

