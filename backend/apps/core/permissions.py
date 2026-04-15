from rest_framework.permissions import BasePermission


class IsAdminRole(BasePermission):
    """Staff or explicit admin role."""

    def has_permission(self, request, view):
        u = request.user
        return bool(
            u and u.is_authenticated and (getattr(u, "is_staff", False) or getattr(u, "role", "") == "admin")
        )
