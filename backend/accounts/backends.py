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

            # 1. Direct match (e.g. frontend hashed matching hashed in DB, or plain matching plain)
            if user.check_password(password):
                return user

            # 2. Plaintext input (e.g. from Django Admin form) checked against SHA-256 stored hash
            hashed_input = hashlib.sha256(password.encode("utf-8")).hexdigest()
            if user.check_password(hashed_input):
                return user

            return None
        except Exception:
            return None
        return None
