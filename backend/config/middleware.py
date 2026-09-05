"""
MacFiesta Pro — custom middleware.

SecurityHeadersMiddleware
    Injects hardened HTTP response headers on every response to prevent:
    - Server fingerprinting (removes Server header)
    - Sensitive data caching (no-store on /api/ routes)
    - MIME-type sniffing attacks
    - Clickjacking
    - Referrer leakage
    - Cross-origin resource access beyond what CORS allows
"""


class SecurityHeadersMiddleware:
    """Add security headers to every HTTP response."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # ── Remove server fingerprinting headers ───────────────────────────
        # Never tell the browser what server / version is running.
        response.headers.pop("Server", None)
        response.headers.pop("X-Powered-By", None)
        response["Server"] = "MacFiesta"          # generic replacement

        # ── Content sniffing protection ────────────────────────────────────
        response["X-Content-Type-Options"] = "nosniff"

        # ── Clickjacking protection ────────────────────────────────────────
        response["X-Frame-Options"] = "DENY"

        # ── Legacy XSS protection (IE / old browsers) ──────────────────────
        response["X-XSS-Protection"] = "1; mode=block"

        # ── Referrer policy: never leak full URL to third parties ──────────
        response["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # ── Permissions policy: disable dangerous browser features ─────────
        response["Permissions-Policy"] = (
            "camera=(), microphone=(), geolocation=(), "
            "payment=(), usb=(), interest-cohort=()"
        )

        # ── Cache control: only anonymous, read-only public data is cacheable
        path = request.path_info
        if path.startswith("/api/"):
            public_prefixes = (
                "/api/events/",
                "/api/results/",
                "/api/gallery/",
                "/api/announcements/",
                "/api/public/",
                "/api/cms/",
            )
            is_public_read = (
                request.method == "GET"
                and not request.headers.get("Authorization")
                and path.startswith(public_prefixes)
            )
            if is_public_read and response.status_code == 200:
                response["Cache-Control"] = "public, max-age=30, stale-while-revalidate=120"
            else:
                response["Cache-Control"] = "no-store, no-cache, must-revalidate, private"
                response["Pragma"] = "no-cache"
                response["Expires"] = "0"

        return response
