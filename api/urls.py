from django.urls import path, include
from rest_framework import routers  
from api import views

router = routers.DefaultRouter()
router.register(r'proveedores', views.ProveedorViewSet)
urlpatterns = [
    path('', include(router.urls)),
]

router.register(r'usuarios', views.UsuarioViewSet)
urlpatterns = [
    path('', include(router.urls)),
]

router.register(r'productos', views.ProductoViewSet)
urlpatterns = [
    path('', include(router.urls)),
]

router.register(r'compras', views.CompraViewSet)
urlpatterns = [
    path('', include(router.urls)),
]

router.register(r'ventas', views.VentaViewSet)
urlpatterns = [
    path('', include(router.urls)),
]

router.register(r'detalle compras', views.DetalleCompraViewSet)
urlpatterns = [
    path('', include(router.urls)),
]

router.register(r'detalle ventas', views.DetalleVentaViewSet)
urlpatterns = [
    path('', include(router.urls)),
]

router.register(r'Ajuste Stock', views.AjusteStockViewSet)
urlpatterns = [
    path('', include(router.urls)),
]
