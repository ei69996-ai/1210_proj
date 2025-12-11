/**
 * @file tour.ts
 * @description 한국관광공사 API 응답 타입 정의
 *
 * 한국관광공사 공공 API (KorService2)의 응답 데이터 구조를 정의합니다.
 * API 문서: https://www.data.go.kr/data/15101578/openapi.do
 */

/**
 * 관광지 목록 항목 (areaBasedList2, searchKeyword2 응답)
 */
export interface TourItem {
  addr1: string; // 주소
  addr2?: string; // 상세주소
  areacode: string; // 지역코드
  contentid: string; // 콘텐츠ID
  contenttypeid: string; // 콘텐츠타입ID
  title: string; // 제목
  mapx: string; // 경도 (KATEC 좌표계, 정수형)
  mapy: string; // 위도 (KATEC 좌표계, 정수형)
  firstimage?: string; // 대표이미지1
  firstimage2?: string; // 대표이미지2
  tel?: string; // 전화번호
  cat1?: string; // 대분류
  cat2?: string; // 중분류
  cat3?: string; // 소분류
  modifiedtime: string; // 수정일 (YYYYMMDDHHmmss)
}

/**
 * 관광지 상세 정보 (detailCommon2 응답)
 */
export interface TourDetail {
  contentid: string; // 콘텐츠ID
  contenttypeid: string; // 콘텐츠타입ID
  title: string; // 제목
  addr1: string; // 주소
  addr2?: string; // 상세주소
  zipcode?: string; // 우편번호
  tel?: string; // 전화번호
  homepage?: string; // 홈페이지
  overview?: string; // 개요 (긴 설명)
  firstimage?: string; // 대표이미지1
  firstimage2?: string; // 대표이미지2
  mapx: string; // 경도 (KATEC 좌표계, 정수형)
  mapy: string; // 위도 (KATEC 좌표계, 정수형)
  areacode?: string; // 지역코드 (areacodeYN: "Y"일 때 포함)
}

/**
 * 관광지 운영 정보 (detailIntro2 응답)
 * 타입별로 필드가 다르므로 공통 필드만 정의
 */
export interface TourIntro {
  contentid: string; // 콘텐츠ID
  contenttypeid: string; // 콘텐츠타입ID
  usetime?: string; // 이용시간/개장시간
  restdate?: string; // 휴무일
  infocenter?: string; // 문의처
  parking?: string; // 주차 가능 여부
  chkpet?: string; // 반려동물 동반 가능 여부
  // 관광지(12) 추가 필드
  expguide?: string; // 체험안내
  expagerange?: string; // 체험가능연령
  // 문화시설(14) 추가 필드
  usefee?: string; // 이용요금
  usetimeculture?: string; // 관람시간
  restdateculture?: string; // 휴관일
  // 축제/행사(15) 추가 필드
  playtime?: string; // 공연시간
  eventstartdate?: string; // 행사시작일
  eventenddate?: string; // 행사종료일
  eventplace?: string; // 행사장소
  eventhomepage?: string; // 행사홈페이지
  // 레포츠(28) 추가 필드
  usefeeleports?: string; // 이용요금
  usetimeleports?: string; // 이용시간
  // 숙박(32) 추가 필드
  checkintime?: string; // 체크인
  checkouttime?: string; // 체크아웃
  // 음식점(39) 추가 필드
  firstmenu?: string; // 대표메뉴
  treatmenu?: string; // 취급메뉴
  opentimefood?: string; // 영업시간
  restdatefood?: string; // 휴무일
}

/**
 * 관광지 이미지 정보 (detailImage2 응답)
 */
export interface TourImage {
  contentid: string; // 콘텐츠ID
  originimgurl: string; // 원본 이미지 URL
  smallimageurl: string; // 썸네일 이미지 URL
  imgname?: string; // 이미지명
  serialnum?: string; // 일련번호
}

/**
 * 반려동물 동반 여행 정보 (detailPetTour2 응답)
 */
export interface PetTourInfo {
  contentid: string; // 콘텐츠ID
  contenttypeid: string; // 콘텐츠타입ID
  chkpetleash?: string; // 애완동물 동반 여부 (Y/N)
  chkpetsize?: string; // 애완동물 크기 (소형, 중형, 대형)
  chkpetplace?: string; // 입장 가능 장소 (실내, 실외, 모두)
  chkpetfee?: string; // 추가 요금 정보
  petinfo?: string; // 기타 반려동물 정보
}

/**
 * API 응답 래퍼 타입
 */
export interface TourApiResponse<T> {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item: T | T[];
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

/**
 * 지역 코드 정보 (areaCode2 응답)
 */
export interface AreaCode {
  code: string; // 지역코드
  name: string; // 지역명
  rnum?: number; // 순번
}

