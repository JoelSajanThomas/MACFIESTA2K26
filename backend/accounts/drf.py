from rest_framework.permissions import BasePermission, SAFE_METHODS, IsAdminUser

from .permissions import user_has_module, user_modules


class IsAdminOrReadOnly(BasePermission):
    """Public read; writes require staff + optional committee module."""

    module = None  # set on view: required_module = "events"

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if not (user.is_staff or user.is_superuser):
            return False
        module = getattr(view, "required_module", None) or self.module
        if not module:
            return True
        return user_has_module(user, module)


def HasModule(module_name):
    """Factory: permission_classes = [HasModule("registrations")]"""

    class _HasModule(BasePermission):
        def has_permission(self, request, view):
            user = request.user
            if not user or not user.is_authenticated:
                return False
            if not (user.is_staff or user.is_superuser):
                return False
            return user_has_module(user, module_name)

    _HasModule.__name__ = f"HasModule_{module_name}"
    return _HasModule


class HasStaffModule(BasePermission):
    """Staff-only endpoint gated by view.required_module."""

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if not (user.is_staff or user.is_superuser):
            return False
        module = getattr(view, "required_module", None)
        if not module:
            return True
        return user_has_module(user, module)


# Re-export helpers for views
__all__ = [
    "IsAdminOrReadOnly",
    "HasStaffModule",
    "HasModule",
    "IsAdminUser",
    "user_has_module",
    "user_modules",
]
