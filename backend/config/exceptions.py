import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """
    Standardizes DRF exception output and gracefully handles 500 exceptions in production
    without leaking internal stack traces to the client.
    """
    response = exception_handler(exc, context)

    if response is not None:
        # Standardize payload structure if needed
        return response

    # Unhandled 500 exception
    view_name = context.get("view").__class__.__name__ if context.get("view") else "UnknownView"
    request = context.get("request")
    path = request.path if request else "unknown"
    method = request.method if request else "unknown"

    logger.error(
        "Unhandled exception in %s [%s %s]: %s",
        view_name,
        method,
        path,
        exc,
        exc_info=True,
    )

    if settings.DEBUG:
        # In debug mode, allow Django default debugging
        return None

    return Response(
        {
            "detail": "An internal server error occurred while processing your request. Please try again or contact festival support.",
            "status_code": 500,
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
