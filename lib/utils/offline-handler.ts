/**
 * @file offline-handler.ts
 * @description 오프라인 상태 처리 유틸리티
 *
 * 네트워크 연결 상태를 감지하고 오프라인 이벤트를 처리하는 유틸리티 함수입니다.
 */

/**
 * 오프라인 상태 감지
 * @returns 오프라인 여부
 */
export function isOffline(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return !navigator.onLine;
}

/**
 * 오프라인 이벤트 리스너 등록
 * @param onOffline 오프라인 상태일 때 호출할 콜백
 * @param onOnline 온라인 상태일 때 호출할 콜백
 * @returns 리스너 제거 함수
 */
export function watchOfflineStatus(
  onOffline: () => void,
  onOnline: () => void
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleOffline = () => {
    console.log("[Offline Handler] 오프라인 상태로 전환됨");
    onOffline();
  };

  const handleOnline = () => {
    console.log("[Offline Handler] 온라인 상태로 전환됨");
    onOnline();
  };

  window.addEventListener("offline", handleOffline);
  window.addEventListener("online", handleOnline);

  return () => {
    window.removeEventListener("offline", handleOffline);
    window.removeEventListener("online", handleOnline);
  };
}

/**
 * 네트워크 상태 확인
 * @returns 네트워크 상태 정보
 */
export function getNetworkStatus(): {
  online: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
} {
  if (typeof window === "undefined" || !("navigator" in window)) {
    return { online: false };
  }

  const connection =
    (navigator as any).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection;

  return {
    online: navigator.onLine,
    effectiveType: connection?.effectiveType,
    downlink: connection?.downlink,
    rtt: connection?.rtt,
  };
}

