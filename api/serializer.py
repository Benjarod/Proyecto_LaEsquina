from rest_framework import serializers
from .models import proveedor, usuario, producto, compra, venta, detalle_compra, detalle_venta, ajuste_stock

class ProveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = proveedor
        fields = '__all__'

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = usuario
        fields = '__all__'

class ProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = producto
        fields = '__all__'

class CompraSerializer(serializers.ModelSerializer):
    class Meta:
        model = compra
        fields = '__all__'

class VentaSerializer(serializers.ModelSerializer):
    class Meta:
        model = venta
        fields = '__all__'

class DetalleCompraSerializer(serializers.ModelSerializer):
    class Meta:
        model = detalle_compra
        fields = '__all__'

class DetalleVentaSerializer(serializers.ModelSerializer):
    class Meta:
        model = detalle_venta
        fields = '__all__'

class AjusteStockSerializer(serializers.ModelSerializer):
    class Meta:
        model = ajuste_stock
        fields = '__all__'