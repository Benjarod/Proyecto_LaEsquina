from django.shortcuts import render
from rest_framework import viewsets, status
from .serializer import ProveedorSerializer, UsuarioSerializer, ProductoSerializer, CompraSerializer, VentaSerializer, DetalleCompraSerializer, DetalleVentaSerializer, AjusteStockSerializer
from .models import proveedor,usuario, producto, compra, venta, detalle_compra, detalle_venta, ajuste_stock
from django.db import transaction
from rest_framework.decorators import action
from rest_framework.response import Response

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
    @action(detail=False, methods=['get'])
    def buscar(self, request):
        """Buscar productos por SKU o nombre"""
        query = request.query_params.get('q', '')
        if query:
            productos = producto.objects.filter(
                nombre_producto__icontains=query
            ) | producto.objects.filter(
                sku__icontains=query
            )
            serializer = self.get_serializer(productos, many=True)
            return Response(serializer.data)
        return Response([])

class CompraViewSet(viewsets.ModelViewSet):
    queryset = compra.objects.all()
    serializer_class = CompraSerializer

class VentaViewSet(viewsets.ModelViewSet):
    queryset = venta.objects.all()
    serializer_class = VentaSerializer

    @action(detail=False, methods=['post'])
    def procesar_venta(self, request):
        """
        Procesar una venta completa con sus detalles
        Espera:
        {
            "id_usuario": 1,
            "items": [
                {"id_producto": 1, "cantidad": 2},
                {"id_producto": 2, "cantidad": 1}
            ]
        }
        """
        try:
            with transaction.atomic():
                id_usuario = request.data.get('id_usuario')
                items = request.data.get('items', [])
                
                if not id_usuario or not items:
                    return Response(
                        {'error': 'Faltan datos requeridos'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Obtener usuario
                try:
                    user = usuario.objects.get(id_usuario=id_usuario)
                except usuario.DoesNotExist:
                    return Response(
                        {'error': 'Usuario no encontrado'},
                        status=status.HTTP_404_NOT_FOUND
                    )
                
                # Calcular total y validar stock
                total_venta = 0
                productos_venta = []
                
                for item in items:
                    try:
                        prod = producto.objects.get(id_producto=item['id_producto'])
                        cantidad = item['cantidad']
                        
                        # Verificar stock
                        if prod.stock_actual < cantidad:
                            return Response(
                                {'error': f'Stock insuficiente para {prod.nombre_producto}. Disponible: {prod.stock_actual}'},
                                status=status.HTTP_400_BAD_REQUEST
                            )
                        
                        subtotal = prod.precio_venta * cantidad
                        total_venta += subtotal
                        
                        productos_venta.append({
                            'producto': prod,
                            'cantidad': cantidad,
                            'precio_unitario': prod.precio_venta
                        })
                        
                    except producto.DoesNotExist:
                        return Response(
                            {'error': f'Producto con ID {item["id_producto"]} no encontrado'},
                            status=status.HTTP_404_NOT_FOUND
                        )
                
                # Crear venta
                nueva_venta = venta.objects.create(
                    total_venta=total_venta,
                    id_usuario=user
                )
                
                # Crear detalles y actualizar stock
                for item_venta in productos_venta:
                    detalle_venta.objects.create(
                        id_venta=nueva_venta,
                        id_producto=item_venta['producto'],
                        cantidad=item_venta['cantidad'],
                        precio_unitario_venta=item_venta['precio_unitario']
                    )
                    
                    # Actualizar stock
                    prod = item_venta['producto']
                    prod.stock_actual -= item_venta['cantidad']
                    prod.save()
                
                # Serializar respuesta
                venta_serializer = VentaSerializer(nueva_venta)
                
                return Response({
                    'message': 'Venta procesada exitosamente',
                    'venta': venta_serializer.data,
                    'total': total_venta
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DetalleCompraViewSet(viewsets.ModelViewSet):
    queryset = detalle_compra.objects.all()
    serializer_class = DetalleCompraSerializer

class DetalleVentaViewSet(viewsets.ModelViewSet):
    queryset = detalle_venta.objects.all()
    serializer_class = DetalleVentaSerializer

class AjusteStockViewSet(viewsets.ModelViewSet):
    queryset = ajuste_stock.objects.all()
    serializer_class = AjusteStockSerializer

