from django.shortcuts import render
from rest_framework import viewsets
from .serializer import ProveedorSerializer, UsuarioSerializer, ProductoSerializer, CompraSerializer, VentaSerializer, DetalleCompraSerializer, DetalleVentaSerializer, AjusteStockSerializer
from .models import proveedor,usuario, producto, compra, venta, detalle_compra, detalle_venta, ajuste_stock

# Create your views here.
class ProveedorViewSet(viewsets.ModelViewSet):
    queryset = proveedor.objects.all()
    serializer_class = ProveedorSerializer

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = usuario.objects.all()
    serializer_class = UsuarioSerializer

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = producto.objects.all()
    serializer_class = ProductoSerializer

class CompraViewSet(viewsets.ModelViewSet):
    queryset = compra.objects.all()
    serializer_class = CompraSerializer

class VentaViewSet(viewsets.ModelViewSet):
    queryset = venta.objects.all()
    serializer_class = VentaSerializer

class DetalleCompraViewSet(viewsets.ModelViewSet):
    queryset = detalle_compra.objects.all()
    serializer_class = DetalleCompraSerializer

class DetalleVentaViewSet(viewsets.ModelViewSet):
    queryset = detalle_venta.objects.all()
    serializer_class = DetalleVentaSerializer

class AjusteStockViewSet(viewsets.ModelViewSet):
    queryset = ajuste_stock.objects.all()
    serializer_class = AjusteStockSerializer
