# 성능 최적화 가이드

## Lighthouse 점수 측정

### 측정 방법

#### 1. Chrome DevTools 사용 (권장)

1. 프로덕션 빌드 생성:
   ```bash
   pnpm build
   pnpm start
   ```

2. Chrome 브라우저에서 `http://localhost:3000` 접속

3. Chrome DevTools 열기 (F12)

4. Lighthouse 탭 선택

5. 측정 항목 선택:
   - Performance (성능)
   - Accessibility (접근성)
   - Best Practices (모범 사례)
   - SEO (검색 엔진 최적화)

6. "Analyze page load" 클릭

#### 2. Lighthouse CLI 사용

```bash
# Lighthouse CLI 설치
npm install -g lighthouse

# 측정 실행
lighthouse http://localhost:3000 --view
```

### 목표 지표

- **Performance**: > 80점
- **Accessibility**: > 90점
- **Best Practices**: > 90점
- **SEO**: > 90점

### Web Vitals 목표

- **First Contentful Paint (FCP)**: < 1.8초
- **Largest Contentful Paint (LCP)**: < 2.5초
- **Time to Interactive (TTI)**: < 3.8초
- **Total Blocking Time (TBT)**: < 200ms
- **Cumulative Layout Shift (CLS)**: < 0.1

### 개선 우선순위

1. 가장 낮은 점수 항목부터 개선
2. 가장 큰 성능 영향 항목 우선
3. 사용자 경험에 직접적인 영향이 있는 항목 우선

## 번들 크기 분석

### 분석 도구 사용

```bash
# 번들 분석 실행
pnpm analyze
```

브라우저에서 자동으로 번들 분석 리포트가 열립니다.

### 목표 번들 크기

- 초기 번들 (First Load JS): < 200KB (gzipped)
- 각 페이지 번들: < 100KB (gzipped)

## 성능 최적화 체크리스트

- [x] 이미지 최적화 (Next.js Image 컴포넌트 사용)
- [x] 코드 분할 (동적 import)
- [x] API 캐싱 전략
- [ ] 번들 크기 최적화
- [ ] Lighthouse 점수 측정 및 개선

