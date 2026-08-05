"""Backward-compatible imports — prefer accounts.drf for new code. """
from accounts.drf import HasModule, HasStaffModule, IsAdminOrReadOnly, user_has_module, user_modules

# Backward-compatible alias
ReadOnlyOrAdmin = IsAdminOrReadOnly

__all__ = [
    "IsAdminOrReadOnly",
    "ReadOnlyOrAdmin",
    "HasStaffModule",
    "HasModule",
    "user_has_module",
    "user_modules",
]
