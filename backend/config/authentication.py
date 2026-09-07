"""
Custom authentication classes for MacFiesta Pro.
"""
from rest_framework_simplejwt.authentication import JWTAuthentication


class QueryParamJWTAuthentication(JWTAuthentication):
    """
    Extends SimpleJWT's JWTAuthentication to accept JWT access token from:
    1. Standard 'Authorization: Bearer <token>' header
    2. 'token' query parameter (for direct browser downloads: CSV exports, database backups, passes)
    """

    def authenticate(self, request):
        header = self.get_header(request)
        if header is None:
            raw_token = getattr(request, "query_params", {}).get("token") or request.GET.get("token")
            if raw_token:
                try:
                    validated_token = self.get_validated_token(raw_token)
                    return self.get_user(validated_token), validated_token
                except Exception:
                    return None
            return None
        return super().authenticate(request)
