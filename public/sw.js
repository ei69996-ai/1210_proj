/**
 * @file sw.js
 * @description Service Worker
 *
 * 오프라인 지원 및 캐싱 기능을 제공하는 Service Worker입니다.
 * 
 * 캐싱 전략:
 * - 정적 자산 (CSS, JS): Cache First
 * - API 응답: Network First (오프라인 시 Cache Fallback)
 * - 이미지: Cache First (오프라인 시 기본 이미지)
 */

const CACHE_NAME = "my-trip-v1";
const STATIC_CACHE = "my-trip-static-v1";
const API_CACHE = "my-trip-api-v1";
const IMAGE_CACHE = "my-trip-images-v1";

// 설치 이벤트
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...");
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log("[Service Worker] Caching static assets");
      return cache.addAll([
        "/",
        "/offline",
        // 필요한 정적 자산들을 여기에 추가
      ]);
    })
  );
  self.skipWaiting();
});

// 활성화 이벤트
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // 오래된 캐시 삭제
            return (
              cacheName.startsWith("my-trip-") &&
              cacheName !== STATIC_CACHE &&
              cacheName !== API_CACHE &&
              cacheName !== IMAGE_CACHE
            );
          })
          .map((cacheName) => {
            console.log("[Service Worker] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  self.clients.claim();
});

// fetch 이벤트
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 같은 origin 요청만 처리
  if (url.origin !== location.origin) {
    return;
  }

  // API 요청: Network First
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 성공 시 캐시에 저장 (최대 1시간)
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // 네트워크 실패 시 캐시에서 반환
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // 캐시에도 없으면 오프라인 응답
            return new Response(
              JSON.stringify({ error: "오프라인 상태입니다." }),
              {
                status: 503,
                headers: { "Content-Type": "application/json" },
              }
            );
          });
        })
    );
    return;
  }

  // 이미지 요청: Cache First
  if (
    request.destination === "image" ||
    url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request)
          .then((response) => {
            if (response.ok) {
              const responseClone = response.clone();
              caches.open(IMAGE_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            // 이미지 로드 실패 시 기본 이미지 반환
            return new Response("", { status: 404 });
          });
      })
    );
    return;
  }

  // 정적 자산: Cache First
  if (
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "font" ||
    url.pathname.match(/\.(css|js|woff|woff2|ttf|eot)$/i)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // 기타 요청: Network First
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // 오프라인 페이지로 리다이렉트
          if (request.mode === "navigate") {
            return caches.match("/offline");
          }
          return new Response("오프라인 상태입니다.", {
            status: 503,
            headers: { "Content-Type": "text/plain" },
          });
        });
      })
  );
});

