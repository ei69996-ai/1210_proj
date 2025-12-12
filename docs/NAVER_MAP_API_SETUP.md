# 네이버 지도 API 설정 가이드

이 문서는 네이버 클라우드 플랫폼에서 네이버 지도 API 키를 발급받는 방법을 안내합니다.

## 목차

1. [네이버 클라우드 플랫폼 계정 생성](#네이버-클라우드-플랫폼-계정-생성)
2. [지도 API 서비스 활성화](#지도-api-서비스-활성화)
3. [Application 등록 및 Client ID 발급](#application-등록-및-client-id-발급)
4. [환경변수 설정](#환경변수-설정)
5. [문제 해결](#문제-해결)

---

## 네이버 클라우드 플랫폼 계정 생성

### 1. 회원가입

1. [네이버 클라우드 플랫폼](https://www.ncloud.com) 접속
2. 우측 상단 **회원가입** 클릭
3. 네이버 계정으로 로그인 또는 새 계정 생성
4. 회원가입 정보 입력 및 약관 동의
5. 이메일 인증 완료

### 2. 본인인증

1. 로그인 후 **마이페이지** > **본인인증** 이동
2. 휴대폰 인증 또는 공동인증서 인증 진행
3. 본인인증 완료

**참고**: 본인인증은 필수입니다. 본인인증을 완료하지 않으면 서비스를 사용할 수 없습니다.

---

## 지도 API 서비스 활성화

### 1. 네이버 클라우드 플랫폼 콘솔 접속

1. [네이버 클라우드 플랫폼 콘솔](https://console.ncloud.com) 접속
2. 로그인

### 2. Services 메뉴에서 Maps 선택

1. 콘솔 상단 메뉴에서 **Services** 클릭
2. **AI·NAVER API** 섹션에서 **Maps** 선택
3. 또는 검색창에 "Maps" 또는 "지도" 검색

### 3. Web Dynamic Map 서비스 활성화

1. **Maps** 서비스 페이지에서 **Web Dynamic Map** 선택
2. **서비스 신청** 또는 **활성화** 버튼 클릭
3. 서비스 약관 동의
4. 서비스 활성화 완료

**참고**: 
- Web Dynamic Map 서비스는 무료로 제공됩니다 (월 10,000,000건까지)
- 일부 서비스는 신용카드 등록이 필요할 수 있습니다

---

## Application 등록 및 Client ID 발급

### 1. Application 등록

1. **Maps** 서비스 페이지에서 **Application** 탭 선택
2. **Application 등록** 버튼 클릭
3. Application 정보 입력:
   - **Application 이름**: 원하는 이름 입력 (예: "My Trip")
   - **Service**: **Web Dynamic Map** 선택
   - **환경**: **Web** 선택
   - **URL**: 배포된 사이트 URL 입력
     - 예: `https://1210-proj-4yqbpbmt8-ei69996-4596s-projects.vercel.app`
     - 또는 `https://*.vercel.app` (와일드카드 사용 가능)
   - **환경 추가** 버튼으로 여러 URL 추가 가능 (개발/프로덕션)

4. **등록** 버튼 클릭

### 2. Client ID 확인

1. Application 등록 후 **Application 목록**에서 등록한 Application 선택
2. **Client ID** 확인
   - Client ID는 다음과 같은 형식입니다: `xxxxxxxxxxxxxxxxxx`
   - 이 값을 복사하여 환경변수에 설정합니다

### 3. Client ID 형식

```
예시: abc123def456ghi789
```

---

## 환경변수 설정

### 1. 로컬 환경 (.env 파일)

프로젝트 루트의 `.env` 파일에 다음을 추가합니다:

```bash
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=your_client_id_here
```

**예시**:
```bash
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=abc123def456ghi789
```

### 2. Vercel 환경변수 설정

1. [Vercel 대시보드](https://vercel.com/dashboard) 접속
2. 프로젝트 선택
3. **Settings** > **Environment Variables** 이동
4. 새 환경변수 추가:
   - **Name**: `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`
   - **Value**: 발급받은 Client ID
   - **Environment**: Production, Preview, Development 모두 선택
5. **Save** 클릭

### 3. 환경변수 적용

환경변수 설정 후 프로젝트를 다시 배포하면 새로운 환경변수가 적용됩니다:

```bash
# Vercel CLI로 재배포
vercel --prod

# 또는 Git push로 자동 배포
git push origin main
```

---

## 문제 해결

### 1. 지도가 표시되지 않음

#### 원인 1: Client ID가 설정되지 않음

**해결 방법**:
1. `.env` 파일에 `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`가 설정되어 있는지 확인
2. Vercel 대시보드에서 환경변수가 설정되어 있는지 확인
3. 환경변수 이름이 정확한지 확인 (대소문자 구분)

#### 원인 2: Application URL이 등록되지 않음

**해결 방법**:
1. 네이버 클라우드 플랫폼 콘솔에서 Application 설정 확인
2. 현재 사이트 URL이 Application에 등록되어 있는지 확인
3. URL 형식이 올바른지 확인:
   - `https://your-domain.com`
   - `https://*.vercel.app` (와일드카드 사용 시)

#### 원인 3: 서비스가 활성화되지 않음

**해결 방법**:
1. 네이버 클라우드 플랫폼 콘솔에서 **Maps** > **Web Dynamic Map** 서비스가 활성화되어 있는지 확인
2. 서비스가 비활성화되어 있다면 **서비스 신청** 또는 **활성화** 클릭

### 2. 브라우저 콘솔 에러 확인

브라우저 개발자 도구(F12)를 열고 콘솔에서 다음 에러를 확인하세요:

#### 에러: "Invalid client ID"

**원인**: Client ID가 잘못되었거나 설정되지 않음

**해결 방법**:
1. 환경변수 값이 올바른지 확인
2. Client ID에 공백이나 특수문자가 없는지 확인
3. 환경변수 재설정 후 재배포

#### 에러: "This domain is not registered"

**원인**: 현재 도메인이 Application에 등록되지 않음

**해결 방법**:
1. 네이버 클라우드 플랫폼 콘솔에서 Application 설정 확인
2. 현재 사이트 URL을 Application에 추가
3. 와일드카드 사용: `https://*.vercel.app`

### 3. 지도가 로드되지만 마커가 표시되지 않음

**원인**: 좌표 변환 문제 또는 API 호출 실패

**해결 방법**:
1. 브라우저 콘솔에서 에러 메시지 확인
2. 네트워크 탭에서 API 호출 상태 확인
3. 좌표 데이터가 올바른지 확인

### 4. 개발 환경에서만 작동하고 프로덕션에서 작동하지 않음

**원인**: Vercel 환경변수가 설정되지 않음

**해결 방법**:
1. Vercel 대시보드에서 환경변수 확인
2. Production 환경에 환경변수가 설정되어 있는지 확인
3. 환경변수 설정 후 재배포

---

## Application URL 등록 가이드

### 개발 환경 URL

```
http://localhost:3000
```

### Vercel Preview URL

```
https://*.vercel.app
```

또는 특정 Preview URL:
```
https://1210-proj-git-main-ei69996-4596s-projects.vercel.app
```

### Vercel Production URL

```
https://1210-proj-4yqbpbmt8-ei69996-4596s-projects.vercel.app
```

또는 커스텀 도메인:
```
https://your-custom-domain.com
```

### 와일드카드 사용

여러 도메인을 한 번에 등록하려면 와일드카드를 사용할 수 있습니다:

```
https://*.vercel.app
```

이렇게 설정하면 모든 Vercel Preview 및 Production URL이 자동으로 허용됩니다.

---

## 단계별 체크리스트

다음 체크리스트를 따라 설정을 완료하세요:

### 1. 네이버 클라우드 플랫폼 설정

- [ ] 네이버 클라우드 플랫폼 계정 생성
- [ ] 본인인증 완료
- [ ] Maps 서비스 페이지 접속
- [ ] Web Dynamic Map 서비스 활성화

### 2. Application 등록

- [ ] Application 등록
- [ ] Application 이름 설정
- [ ] Service: Web Dynamic Map 선택
- [ ] 환경: Web 선택
- [ ] URL 등록 (개발/프로덕션)
- [ ] Client ID 확인 및 복사

### 3. 환경변수 설정

- [ ] 로컬 `.env` 파일에 `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` 설정
- [ ] Vercel 대시보드에서 환경변수 설정
- [ ] Production, Preview, Development 환경 모두 설정

### 4. 배포 및 확인

- [ ] 환경변수 설정 후 재배포
- [ ] 배포된 사이트에서 지도 표시 확인
- [ ] 브라우저 콘솔에서 에러 확인

---

## 참고 자료

- [네이버 클라우드 플랫폼 공식 문서](https://guide.ncloud.com/docs/maps-web-dynamic-map)
- [네이버 지도 API v3 문서](https://navermaps.github.io/maps.js.ncp/docs/)
- [환경변수 설정 가이드](ENV_SETUP.md)
- [배포 가이드](DEPLOYMENT.md)

---

## 문의

네이버 지도 API 설정에 문제가 있으면:

1. 이 문서의 [문제 해결](#문제-해결) 섹션 확인
2. 브라우저 콘솔에서 에러 메시지 확인
3. 네이버 클라우드 플랫폼 고객센터 문의

---

## 빠른 참조

### Client ID 확인 위치

1. 네이버 클라우드 플랫폼 콘솔
2. Services > Maps
3. Application 탭
4. 등록한 Application 선택
5. Client ID 복사

### 환경변수 설정 위치

**로컬**:
```bash
# .env 파일
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=your_client_id
```

**Vercel**:
- 대시보드 > 프로젝트 > Settings > Environment Variables

### Application URL 등록 예시

```
개발: http://localhost:3000
프로덕션: https://*.vercel.app
또는: https://your-specific-domain.vercel.app
```


