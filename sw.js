/* ============================================================
   AURORA // SERVICE WORKER
============================================================ */

const CACHE_VERSION =
    "aurora-bachelor-v4";

const STATIC_CACHE =
    `${CACHE_VERSION}-static`;

const AURORA_CACHE_PREFIX =
    "aurora-bachelor-";


/* ============================================================
   CORE FILES
============================================================ */

const CORE_FILES = [
    "./",
    "./index.html",
    "./script.js",
    "./manifest.json",
    "./style_v3.css"
];


/* ============================================================
   INSTALL
============================================================ */

self.addEventListener(
    "install",
    event => {

        event.waitUntil(
            caches
                .open(
                    STATIC_CACHE
                )
                .then(
                    cache =>
                        cache.addAll(
                            CORE_FILES
                        )
                )
        );

        /*
          IMPORTANT:
          Do NOT call self.skipWaiting() here.
    
          Aurora Update System will send
          AURORA_SKIP_WAITING when the user
          presses UPDATE NOW.
        */

        self.skipWaiting();

    }
);


/* ============================================================
   ACTIVATE
============================================================ */

self.addEventListener(
    "activate",
    event => {

        event.waitUntil(
            caches
                .keys()
                .then(
                    keys =>
                        Promise.all(
                            keys
                                .filter(
                                    key =>
                                        key.startsWith(
                                            AURORA_CACHE_PREFIX
                                        ) &&
                                        key !==
                                        STATIC_CACHE
                                )
                                .map(
                                    key =>
                                        caches.delete(
                                            key
                                        )
                                )
                        )
                )
                .then(
                    () =>
                        self.clients.claim()
                )
        );

    }
);


/* ============================================================
   FETCH
============================================================ */

self.addEventListener(
    "fetch",
    event => {

        const request =
            event.request;


        if (
            request.method !==
            "GET"
        ) {
            return;
        }


        const url =
            new URL(
                request.url
            );


        /*
          Do not intercept Supabase,
          Google login, CDN or any other
          external network request.
        */

        if (
            url.origin !==
            self.location.origin
        ) {
            return;
        }


        /* ========================================================
           PAGE NAVIGATION
           Network first → cached app fallback
        ======================================================== */

        if (
            request.mode ===
            "navigate"
        ) {

            event.respondWith(

                fetch(
                    request
                )
                    .then(
                        async response => {

                            /*
                              Save latest index.html
                              only when network response
                              is successful.
                            */

                            if (
                                response &&
                                response.ok
                            ) {

                                const cache =
                                    await caches.open(
                                        STATIC_CACHE
                                    );


                                await cache.put(
                                    "./index.html",
                                    response.clone()
                                );

                            }


                            return response;

                        }
                    )
                    .catch(
                        async () => {

                            const cachedPage =
                                await caches.match(
                                    "./index.html"
                                );


                            return cachedPage ||
                                caches.match(
                                    "./"
                                );

                        }
                    )

            );


            return;

        }


        /* ========================================================
           STATIC ASSETS
           Cache first → network → update cache
        ======================================================== */

        event.respondWith(

            caches
                .match(
                    request
                )
                .then(
                    async cached => {

                        if (cached) {
                            return cached;
                        }


                        try {

                            const response =
                                await fetch(
                                    request
                                );


                            if (
                                !response ||
                                !response.ok
                            ) {

                                return response;

                            }


                            const cache =
                                await caches.open(
                                    STATIC_CACHE
                                );


                            await cache.put(
                                request,
                                response.clone()
                            );


                            return response;

                        }

                        catch (error) {

                            console.warn(
                                "Aurora SW fetch failed:",
                                request.url,
                                error
                            );


                            throw error;

                        }

                    }
                )

        );

    }
);


/* ============================================================
   AURORA // UPDATE COMMAND CHANNEL
============================================================ */

self.addEventListener(
    "message",
    event => {

        const type =
            event.data?.type;


        /* --------------------------------------------------------
           USER PRESSED UPDATE NOW
        -------------------------------------------------------- */

        if (
            type ===
            "AURORA_SKIP_WAITING"
        ) {

            self.skipWaiting();

            return;

        }


        /* --------------------------------------------------------
           CLEAR ONLY AURORA CACHE
        -------------------------------------------------------- */

        if (
            type ===
            "AURORA_CLEAR_CACHE"
        ) {

            event.waitUntil(

                caches
                    .keys()
                    .then(
                        keys =>
                            Promise.all(

                                keys
                                    .filter(
                                        key =>
                                            key.startsWith(
                                                AURORA_CACHE_PREFIX
                                            )
                                    )
                                    .map(
                                        key =>
                                            caches.delete(
                                                key
                                            )
                                    )

                            )
                    )

            );

        }

    }
);