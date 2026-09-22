/* ============================================================
   AURORA // SERVICE WORKER
============================================================ */

const CACHE_VERSION =
    "aurora-bachelor-v1";


const STATIC_CACHE =
    `${CACHE_VERSION}-static`;


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
                        cache.addAll([
                            "./",
                            "./index.html",
                            "./style.css",
                            "./script.js",
                            "./manifest.json"
                        ])
                )

        );


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

        );


        self.clients.claim();

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
          Do NOT cache Supabase/API requests.
        */

        if (
            url.origin !==
            self.location.origin
        ) {
            return;
        }


        /* --------------------------------------------------------
           PAGE NAVIGATION
           Network first → cache fallback
        -------------------------------------------------------- */

        if (
            request.mode ===
            "navigate"
        ) {

            event.respondWith(

                fetch(
                    request
                )
                    .then(
                        response => {

                            const copy =
                                response.clone();


                            caches
                                .open(
                                    STATIC_CACHE
                                )
                                .then(
                                    cache =>
                                        cache.put(
                                            "./index.html",
                                            copy
                                        )
                                );


                            return response;

                        }
                    )
                    .catch(
                        () =>
                            caches.match(
                                "./index.html"
                            )
                    )

            );


            return;

        }


        /* --------------------------------------------------------
           STATIC FILES
           Cache first → network fallback
        -------------------------------------------------------- */

        event.respondWith(

            caches
                .match(
                    request
                )
                .then(
                    cached => {

                        if (cached) {

                            return cached;

                        }


                        return fetch(
                            request
                        )
                            .then(
                                response => {

                                    if (
                                        !response ||
                                        response.status !== 200
                                    ) {

                                        return response;

                                    }


                                    const copy =
                                        response.clone();


                                    caches
                                        .open(
                                            STATIC_CACHE
                                        )
                                        .then(
                                            cache =>
                                                cache.put(
                                                    request,
                                                    copy
                                                )
                                        );


                                    return response;

                                }
                            );

                    }
                )

        );

    }
);