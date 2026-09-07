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


def HasModule(*module_names):
    """Factory: permission_classes = [HasModule("registrations")] or [HasModule("finance", "registrations")]"""

    class _HasModule(BasePermission):
        def has_permission(self, request, view=None):
            user = request.user
            if not user or not user.is_authenticated:
                return False
            if not (user.is_staff or user.is_superuser):
                return False
            if user.is_superuser:
                return True
            return any(user_has_module(user, m) for m in module_names)

    _HasModule.__name__ = f"HasModule_{'_'.join(module_names)}"
    return _HasModule


HasAnyModule = HasModule


class HasStaffModule(BasePermission):
    """Staff-only endpoint gated by view.required_module."""

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if not (user.is_staff or user.is_superuser):
            return False
        if user.is_superuser:
            return True
        module = getattr(view, "required_module", None)
        if not module:
            return True
        return user_has_module(user, module)


# Re-export helpers for views
__all__ = [
    "IsAdminOrReadOnly",
    "HasStaffModule",
    "HasModule",
    "HasAnyModule",
    "IsAdminUser",
    "user_has_module",
    "user_modules",
]
