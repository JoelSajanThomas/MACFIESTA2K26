import hashlib
from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend
from django.db.models import Q


class EmailOrUsernameBackend(ModelBackend):
    """Authenticate using either username or email address.
    
    Seamlessly handles both:
    1. Client-side SHA-256 hashed passwords (sent by React frontend)
    2. Direct plaintext passwords (sent by Django Admin form or API tools)
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        UserModel = get_user_model()
        if username is None:
            username = kwargs.get(UserModel.USERNAME_FIELD)
        if not username or not password:
            return None
        try:
            user = UserModel.objects.filter(
                Q(username__iexact=username) | Q(email__iexact=username)
            ).order_by("id").first()
            if not user or not self.user_can_authenticate(user):
                return None

            # 1. Direct match (standard plaintext password matching stored PBKDF2 hash)
            if user.check_password(password):
                return user

            # 2. Legacy check: plaintext input checked against SHA-256 stored hash from past frontend signups
            try:
                hashed_input = hashlib.sha256(password.encode("utf-8")).hexdigest()
                if user.check_password(hashed_input):
                    # Silently upgrade user's stored password to standard PBKDF2
                    try:
                        user.set_password(password)
                        user.save(update_fields=["password"])
                    except Exception:
                        pass
                    return user
            except Exception:
                pass

            # 3. Fallback for raw_password if legacy clients send it
            raw_password = kwargs.get("raw_password")
            if not raw_password and request is not None:
                try:
                    raw_password = getattr(request, "data", {}).get("raw_password")
                except Exception:
                    pass
            if raw_password and user.check_password(raw_password):
                return user

            return None
        except Exception:
            return None
        return None

