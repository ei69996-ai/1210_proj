/**
 * @file service-worker.ts
 * @description Service Worker 등록 유틸리티
 *
 * Service Worker를 등록하고 업데이트를 감지하는 유틸리티 함수입니다.
 */

/**
 * Service Worker 등록
 * @returns 등록 성공 여부
 */
export async function registerServiceWorker(): Promise<boolean> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    console.warn("[Service Worker] Service Worker를 지원하지 않는 브라우저입니다.");
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });

    console.log("[Service Worker] 등록 성공:", registration.scope);

    // 업데이트 감지
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener("statechange", () => {
        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
          // 새 버전이 설치되었지만 아직 활성화되지 않음
          console.log("[Service Worker] 새 버전이 설치되었습니다.");
          // 사용자에게 업데이트 알림을 표시할 수 있음
        }
      });
    });

    return true;
  } catch (error) {
    console.error("[Service Worker] 등록 실패:", error);
    return false;
  }
}

/**
 * Service Worker 업데이트 확인
 */
export async function checkForUpdate(): Promise<void> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    console.log("[Service Worker] 업데이트 확인 완료");
  } catch (error) {
    console.error("[Service Worker] 업데이트 확인 실패:", error);
  }
}

/**
 * Service Worker 해제
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const unregistered = await registration.unregister();
    console.log("[Service Worker] 해제 완료:", unregistered);
    return unregistered;
  } catch (error) {
    console.error("[Service Worker] 해제 실패:", error);
    return false;
  }
}

