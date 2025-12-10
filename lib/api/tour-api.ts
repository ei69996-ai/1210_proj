/**
 * @file tour-api.ts
 * @description 한국관광공사 API 클라이언트
 *
 * 한국관광공사 공공 API (KorService2)를 호출하는 함수들을 제공합니다.
 * Base URL: https://apis.data.go.kr/B551011/KorService2
 *
 * 주요 기능:
 * 1. 지역코드 조회
 * 2. 지역 기반 관광지 목록 조회
 * 3. 키워드 검색
 * 4. 관광지 상세 정보 조회
 * 5. 관광지 운영 정보 조회
 * 6. 관광지 이미지 목록 조회
 * 7. 반려동물 동반 정보 조회
 *
 * @dependencies
 * - 환경변수: TOUR_API_KEY 또는 NEXT_PUBLIC_TOUR_API_KEY
 * - 타입: lib/types/tour.ts
 */

import type {
  TourItem,
  TourDetail,
  TourIntro,
  TourImage,
  PetTourInfo,
  AreaCode,
  TourApiResponse,
} from "@/lib/types/tour";

const BASE_URL = "https://apis.data.go.kr/B551011/KorService2";

/**
 * 공통 파라미터 생성
 * 환경변수 우선순위: TOUR_API_KEY > NEXT_PUBLIC_TOUR_API_KEY
 */
function getCommonParams(): Record<string, string> {
  const serviceKey =
    process.env.TOUR_API_KEY || process.env.NEXT_PUBLIC_TOUR_API_KEY;

  if (!serviceKey) {
    throw new Error(
      "한국관광공사 API 키가 설정되지 않았습니다. TOUR_API_KEY 또는 NEXT_PUBLIC_TOUR_API_KEY 환경변수를 설정해주세요."
    );
  }

  return {
    serviceKey,
    MobileOS: "ETC",
    MobileApp: "MyTrip",
    _type: "json",
  };
}

/**
 * API 호출 재시도 로직이 포함된 fetch 래퍼
 * 최대 3회 재시도, 지수 백오프 적용
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 3,
  timeout = 30000
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // 타임아웃 설정
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 성공 응답 (2xx, 3xx)
      if (response.ok) {
        return response;
      }

      // 4xx 에러는 재시도하지 않음
      if (response.status >= 400 && response.status < 500) {
        throw new Error(
          `API 요청 실패: ${response.status} ${response.statusText}`
        );
      }

      // 5xx 에러는 재시도
      lastError = new Error(
        `서버 에러: ${response.status} ${response.statusText}`
      );
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(`요청 시간 초과 (${timeout}ms)`);
      }

      lastError = error instanceof Error ? error : new Error(String(error));
    }

    // 마지막 시도가 아니면 대기 (지수 백오프)
    if (attempt < maxRetries - 1) {
      const delay = Math.pow(2, attempt) * 1000; // 1초, 2초, 4초
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error("알 수 없는 에러가 발생했습니다.");
}

/**
 * API 응답 파싱 및 에러 처리
 */
async function parseApiResponse<T>(
  response: Response
): Promise<TourApiResponse<T>> {
  const data = await response.json();

  if (!data.response) {
    throw new Error("API 응답 형식이 올바르지 않습니다.");
  }

  const { header } = data.response;
  if (header.resultCode !== "0000") {
    throw new Error(
      `API 에러: ${header.resultCode} - ${header.resultMsg}`
    );
  }

  return data as TourApiResponse<T>;
}

/**
 * URL 쿼리 파라미터 생성
 */
function buildQueryString(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
}

/**
 * 지역코드 조회 (areaCode2)
 * @param numOfRows 페이지당 항목 수 (기본값: 10)
 * @param pageNo 페이지 번호 (기본값: 1)
 */
export async function getAreaCode(
  numOfRows = 10,
  pageNo = 1
): Promise<AreaCode[]> {
  const commonParams = getCommonParams();
  const params = {
    ...commonParams,
    numOfRows,
    pageNo,
  };

  const queryString = buildQueryString(params);
  const url = `${BASE_URL}/areaCode2?${queryString}`;

  try {
    const response = await fetchWithRetry(url);
    const data = await parseApiResponse<AreaCode>(response);

    const items = data.response.body.items.item;
    return Array.isArray(items) ? items : items ? [items] : [];
  } catch (error) {
    throw new Error(
      `지역코드 조회 실패: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * 지역 기반 관광지 목록 조회 (areaBasedList2)
 * @param areaCode 지역코드 (선택)
 * @param contentTypeId 관광 타입 ID (선택)
 * @param numOfRows 페이지당 항목 수 (기본값: 10)
 * @param pageNo 페이지 번호 (기본값: 1)
 */
export async function getAreaBasedList(
  areaCode?: string,
  contentTypeId?: string,
  numOfRows = 10,
  pageNo = 1
): Promise<{ items: TourItem[]; totalCount: number }> {
  const commonParams = getCommonParams();
  const params = {
    ...commonParams,
    numOfRows,
    pageNo,
    ...(areaCode && { areaCode }),
    ...(contentTypeId && { contentTypeId }),
  };

  const queryString = buildQueryString(params);
  const url = `${BASE_URL}/areaBasedList2?${queryString}`;

  try {
    const response = await fetchWithRetry(url);
    const data = await parseApiResponse<TourItem>(response);

    const items = data.response.body.items.item;
    const itemArray = Array.isArray(items) ? items : items ? [items] : [];

    return {
      items: itemArray,
      totalCount: data.response.body.totalCount,
    };
  } catch (error) {
    throw new Error(
      `관광지 목록 조회 실패: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * 키워드 검색 (searchKeyword2)
 * @param keyword 검색 키워드
 * @param areaCode 지역코드 (선택)
 * @param contentTypeId 관광 타입 ID (선택)
 * @param numOfRows 페이지당 항목 수 (기본값: 10)
 * @param pageNo 페이지 번호 (기본값: 1)
 */
export async function searchKeyword(
  keyword: string,
  areaCode?: string,
  contentTypeId?: string,
  numOfRows = 10,
  pageNo = 1
): Promise<{ items: TourItem[]; totalCount: number }> {
  if (!keyword || keyword.trim() === "") {
    throw new Error("검색 키워드를 입력해주세요.");
  }

  const commonParams = getCommonParams();
  const params = {
    ...commonParams,
    keyword: keyword.trim(),
    numOfRows,
    pageNo,
    ...(areaCode && { areaCode }),
    ...(contentTypeId && { contentTypeId }),
  };

  const queryString = buildQueryString(params);
  const url = `${BASE_URL}/searchKeyword2?${queryString}`;

  try {
    const response = await fetchWithRetry(url);
    const data = await parseApiResponse<TourItem>(response);

    const items = data.response.body.items.item;
    const itemArray = Array.isArray(items) ? items : items ? [items] : [];

    return {
      items: itemArray,
      totalCount: data.response.body.totalCount,
    };
  } catch (error) {
    throw new Error(
      `키워드 검색 실패: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * 관광지 상세 정보 조회 (detailCommon2)
 * @param contentId 콘텐츠 ID
 */
export async function getDetailCommon(
  contentId: string
): Promise<TourDetail> {
  if (!contentId) {
    throw new Error("콘텐츠 ID가 필요합니다.");
  }

  const commonParams = getCommonParams();
  const params = {
    ...commonParams,
    contentId,
    defaultYN: "Y",
    firstImageYN: "Y",
    areacodeYN: "Y",
    catcodeYN: "Y",
    addrinfoYN: "Y",
    mapinfoYN: "Y",
    overviewYN: "Y",
  };

  const queryString = buildQueryString(params);
  const url = `${BASE_URL}/detailCommon2?${queryString}`;

  try {
    const response = await fetchWithRetry(url);
    const data = await parseApiResponse<TourDetail>(response);

    const items = data.response.body.items.item;
    const item = Array.isArray(items) ? items[0] : items;

    if (!item) {
      throw new Error("관광지 정보를 찾을 수 없습니다.");
    }

    return item;
  } catch (error) {
    throw new Error(
      `상세 정보 조회 실패: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * 관광지 운영 정보 조회 (detailIntro2)
 * @param contentId 콘텐츠 ID
 * @param contentTypeId 콘텐츠 타입 ID
 */
export async function getDetailIntro(
  contentId: string,
  contentTypeId: string
): Promise<TourIntro> {
  if (!contentId || !contentTypeId) {
    throw new Error("콘텐츠 ID와 타입 ID가 필요합니다.");
  }

  const commonParams = getCommonParams();
  const params = {
    ...commonParams,
    contentId,
    contentTypeId,
  };

  const queryString = buildQueryString(params);
  const url = `${BASE_URL}/detailIntro2?${queryString}`;

  try {
    const response = await fetchWithRetry(url);
    const data = await parseApiResponse<TourIntro>(response);

    const items = data.response.body.items.item;
    const item = Array.isArray(items) ? items[0] : items;

    if (!item) {
      throw new Error("운영 정보를 찾을 수 없습니다.");
    }

    return item;
  } catch (error) {
    throw new Error(
      `운영 정보 조회 실패: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * 관광지 이미지 목록 조회 (detailImage2)
 * @param contentId 콘텐츠 ID
 */
export async function getDetailImage(
  contentId: string
): Promise<TourImage[]> {
  if (!contentId) {
    throw new Error("콘텐츠 ID가 필요합니다.");
  }

  const commonParams = getCommonParams();
  const params = {
    ...commonParams,
    contentId,
    imageYN: "Y",
    subImageYN: "Y",
  };

  const queryString = buildQueryString(params);
  const url = `${BASE_URL}/detailImage2?${queryString}`;

  try {
    const response = await fetchWithRetry(url);
    const data = await parseApiResponse<TourImage>(response);

    const items = data.response.body.items.item;
    return Array.isArray(items) ? items : items ? [items] : [];
  } catch (error) {
    throw new Error(
      `이미지 목록 조회 실패: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * 반려동물 동반 정보 조회 (detailPetTour2)
 * @param contentId 콘텐츠 ID
 */
export async function getDetailPetTour(
  contentId: string
): Promise<PetTourInfo | null> {
  if (!contentId) {
    throw new Error("콘텐츠 ID가 필요합니다.");
  }

  const commonParams = getCommonParams();
  const params = {
    ...commonParams,
    contentId,
  };

  const queryString = buildQueryString(params);
  const url = `${BASE_URL}/detailPetTour2?${queryString}`;

  try {
    const response = await fetchWithRetry(url);
    const data = await parseApiResponse<PetTourInfo>(response);

    const items = data.response.body.items.item;
    if (!items) {
      return null; // 반려동물 정보가 없는 경우 null 반환
    }

    const item = Array.isArray(items) ? items[0] : items;
    return item;
  } catch (error) {
    // 반려동물 정보가 없는 경우 에러 대신 null 반환
    if (error instanceof Error && error.message.includes("조회 실패")) {
      return null;
    }
    throw new Error(
      `반려동물 정보 조회 실패: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

