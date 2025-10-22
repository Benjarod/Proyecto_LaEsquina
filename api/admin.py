from django.contrib import admin
from .models import proveedor, usuario, producto, compra, venta, detalle_compra, detalle_venta, ajuste_stock
# Register your models here.
admin.site.register(proveedor)
admin.site.register(usuario)
admin.site.register(producto)
admin.site.register(compra)
admin.site.register(venta)
admin.site.register(detalle_compra)
admin.site.register(detalle_venta)
admin.site.register(ajuste_stock)

