const cacheName = "CryptoChat";

self.addEventListener("install", (e) => {
    e.waitUntil(
        caches.open(cacheName).then((cache) => {
            return cache.addAll([
                "/logo.svg",
                "/favicon.ico",
                "/manifest.json",
            ]);
        })
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches
            .open(cacheName)
            .then((cache) => cache.match(event.request, { ignoreSearch: true }))
            .then((response) => {
                return response || fetch(event.request);
            })
    );
});
