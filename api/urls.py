# api/urls.py
from django.urls import path, include
from rest_framework import routers  
from api import views
# Importar vistas de SimpleJWT y nuestro serializer custom
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .serializer import CustomTokenObtainPairSerializer # <-- Importar

# Vista custom para obtener token
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

router = routers.DefaultRouter()
router.register(r'proveedores', views.ProveedorViewSet)
router.register(r'usuarios', views.UsuarioViewSet)
router.register(r'productos', views.ProductoViewSet)
router.register(r'compras', views.CompraViewSet)
router.register(r'ventas', views.VentaViewSet)
router.register(r'detalle_compras', views.DetalleCompraViewSet) # Corregido (sin espacio)
router.register(r'detalle_ventas', views.DetalleVentaViewSet) # Corregido (sin espacio)
router.register(r'ajuste_stock', views.AjusteStockViewSet) # Corregido (sin espacio)

urlpatterns = [
    path('', include(router.urls)),

    # Endpoints de Autenticación JWT
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]