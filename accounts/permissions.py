from rest_framework.permissions import BasePermission
from accounts.models import User

class IsAdminUserRole(BasePermission):
    """
    Permission check for ADMIN role users.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == User.Role.ADMIN or request.user.is_superuser)
        )

class IsApprovedAnalyst(BasePermission):
    """
    Permission check for approved/active FRAUD_ANALYST role users.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == User.Role.FRAUD_ANALYST and
            request.user.status in [User.Status.APPROVED, User.Status.ACTIVE]
        )

class IsAdminOrApprovedAnalyst(BasePermission):
    """
    Permission check for either ADMIN or APPROVED/ACTIVE FRAUD_ANALYST.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.role == User.Role.ADMIN or request.user.is_superuser:
            return True
        return (
            request.user.role == User.Role.FRAUD_ANALYST and
            request.user.status in [User.Status.APPROVED, User.Status.ACTIVE]
        )
