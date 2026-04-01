const STATIC_CACHE = "static-v1";
const DYNAMIC_CACHE = "dynamic-v1";

const STATIC_FILES = [
  "/",
  "/index.html",
  "/sobre.html",
  "/contato.html",
  "/offline.html",
  "/css/style.css",
  "/js/script.js",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// Instalação
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll(STATIC_FILES);
    })
  );
});

// Ativação (limpa cache antigo)
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Intercepta requisições
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return (
        response ||
        fetch(event.request)
          .then(res => {
            return caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(event.request, res.clone());
              return res;
            });
          })
          .catch(() => {
            if (event.request.headers.get("accept").includes("text/html")) {
              return caches.match("/offline.html");
            }
          })
      );
    })
  );
});