"""
Health check endpoint for production monitoring, load balancers, and uptime probes.
"""

from django.db import connection
from django.core.cache import cache
from django.http import JsonResponse
from django.utils import timezone
import time

START_TIME = time.time()

def health_check_view(request):
    """
    Comprehensive system health probe.
    Checks:
      - Database connectivity
      - Cache read/write
      - System uptime
    Returns HTTP 200 if all components are healthy, 503 if any probe fails.
    """
    diagnostics = {
        "status": "healthy",
        "timestamp": timezone.now().isoformat(),
        "uptime_seconds": round(time.time() - START_TIME, 2),
        "version": "2.0.26",
        "components": {}
    }
    healthy = True

    # 1. Database probe
    try:
        db_start = time.perf_counter()
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        db_latency = round((time.perf_counter() - db_start) * 1000, 2)
        diagnostics["components"]["database"] = {
            "status": "connected",
            "latency_ms": db_latency,
        }
    except Exception as exc:
        healthy = False
        diagnostics["components"]["database"] = {
            "status": "unhealthy",
            "error": str(exc),
        }

    # 2. Cache probe
    try:
        cache_start = time.perf_counter()
        probe_key = "macfiesta:health:probe"
        cache.set(probe_key, "ok", timeout=10)
        cached_val = cache.get(probe_key)
        cache_latency = round((time.perf_counter() - cache_start) * 1000, 2)
        if cached_val == "ok":
            diagnostics["components"]["cache"] = {
                "status": "operational",
                "latency_ms": cache_latency,
            }
        else:
            healthy = False
            diagnostics["components"]["cache"] = {
                "status": "unhealthy",
                "error": "Cache write-read mismatch",
            }
    except Exception as exc:
        healthy = False
        diagnostics["components"]["cache"] = {
            "status": "unhealthy",
            "error": str(exc),
        }

    if not healthy:
        diagnostics["status"] = "degraded"
        return JsonResponse(diagnostics, status=503)

    return JsonResponse(diagnostics, status=200)
