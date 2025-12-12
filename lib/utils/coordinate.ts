/**
 * @file coordinate.ts
 * @description 좌표 변환 유틸리티
 *
 * 한국관광공사 API에서 제공하는 KATEC 좌표계를
 * 네이버 지도에서 사용하는 WGS84 좌표계로 변환합니다.
 *
 * 변환 공식:
 * - KATEC 좌표는 정수형으로 저장됨 (예: 126981757)
 * - WGS84로 변환하려면 10000000으로 나눔
 * - mapx (경도), mapy (위도) 각각 변환
 */

/**
 * KATEC 좌표를 WGS84 좌표로 변환
 * @param mapx KATEC 경도 (정수형 문자열)
 * @param mapy KATEC 위도 (정수형 문자열)
 * @returns WGS84 좌표 객체 { lng: 경도, lat: 위도 }
 * @description 좌표 변환 실패 시 기본 좌표(서울 시청)를 반환합니다.
 */
export function katecToWgs84(
  mapx: string,
  mapy: string
): { lng: number; lat: number } {
  const defaultCoords = { lat: 37.5665, lng: 126.9780 }; // 서울 시청

  // 입력값 검증
  if (!mapx || !mapy) {
    console.warn(`좌표 값이 없습니다: mapx=${mapx}, mapy=${mapy}. 기본 좌표를 사용합니다.`);
    return defaultCoords;
  }

  const lngNum = parseFloat(mapx);
  const latNum = parseFloat(mapy);

  // 숫자 변환 실패 또는 0인 경우
  if (isNaN(lngNum) || isNaN(latNum) || lngNum === 0 || latNum === 0) {
    console.warn(`유효하지 않은 좌표 값입니다: mapx=${mapx}, mapy=${mapy}. 기본 좌표를 사용합니다.`);
    return defaultCoords;
  }

  const lng = lngNum / 10000000;
  const lat = latNum / 10000000;

  // 변환된 좌표 유효성 검증 (한국 영역: 경도 124~132, 위도 33~43)
  if (lng < 124 || lng > 132 || lat < 33 || lat > 43) {
    console.warn(`한국 영역을 벗어난 좌표입니다: lat=${lat}, lng=${lng}. 기본 좌표를 사용합니다.`);
    return defaultCoords;
  }

  return { lng, lat };
}

