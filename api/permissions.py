from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAdmin(BasePermission):
    """Permite acceso solo a usuarios con rol Admin."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.rol == 'Admin')

class IsBodeguero(BasePermission):
    """Permite acceso solo a usuarios con rol Bodeguero."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.rol == 'Bodeguero')

class IsCajero(BasePermission):
    """Permite acceso solo a usuarios con rol Cajero."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.rol == 'Cajero')