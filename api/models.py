from django.db import models
import os

# Create your models here.
class proveedor(models.Model):
    id_proveedor = models.AutoField(primary_key=True)
    rut = models.CharField(max_length=12)
    nombre_proveedor = models.CharField(max_length=100)
    contacto = models.CharField(max_length=100)
    def __str__(self):
        return f"{self.nombre_proveedor} ({self.rut})"

class usuario(models.Model):
    id_usuario = models.AutoField(primary_key=True)
    nombre_usuario = models.CharField(max_length=100)
    password = models.CharField(max_length=100)
    ### Elecciones ara campo 'rol'
    class Rol(models.TextChoices):
        ADMINISTRADOR = 'Admin'
        BODEGUERO ='Bodeguero'
        CAJERO = 'Cajero'
    rol = models.CharField(
        max_length=30,
        choices=Rol.choices,
    )
    def __str__(self):
        return f"{self.nombre_usuario} ({self.rol})"

class producto(models.Model):
    id_producto = models.AutoField(primary_key=True)
    sku = models.CharField(max_length=50)
    nombre_producto = models.CharField(max_length=100)
    descripcion = models.TextField(max_length=500)
    precio_costo = models.FloatField()
    precio_venta = models.FloatField()
    stock_actual = models.IntegerField()
    stock_minimo = models.IntegerField()
    id_proveedor = models.ForeignKey(proveedor, on_delete=models.CASCADE)
    imagen = models.ImageField(upload_to='productos', null=True, blank=True)
    def __str__(self):
        return f"{self.nombre_producto} (SKU: {self.sku})"
    
    def delete(self, *args, **kwargs):
        # Si el producto tiene imagen, la borramos del sistema de archivos
        if self.imagen and os.path.isfile(self.imagen.path):
            os.remove(self.imagen.path)
        super().delete(*args, **kwargs)
    
class compra(models.Model):
    id_compra = models.AutoField(primary_key=True)
    fecha_hora = models.DateTimeField(auto_now_add=True)
    total_compra = models.FloatField()
    id_usuario = models.ForeignKey(usuario, on_delete=models.CASCADE)
    id_proveedor = models.ForeignKey(proveedor, on_delete=models.CASCADE)
    def __str__(self):
        return f"Compra {self.id_compra} - Total: {self.total_compra}"
    
class venta(models.Model):
    id_venta = models.AutoField(primary_key=True)
    fecha_hora = models.DateTimeField(auto_now_add=True)
    total_venta = models.FloatField()
    id_usuario = models.ForeignKey(usuario, on_delete=models.CASCADE)
    # Nuevo campo para método de pago
    class MetodoPago(models.TextChoices):
        EFECTIVO = 'Efectivo'
        DEBITO = 'Debito'
    
    metodo_pago = models.CharField(max_length=20, choices=MetodoPago.choices, default='Efectivo')
    def __str__(self):
        return f"Venta {self.id_venta} - Total: {self.total_venta}"

class detalle_compra(models.Model):
    id_detalle_compra = models.AutoField(primary_key=True)
    id_compra = models.ForeignKey(compra, on_delete=models.CASCADE)
    id_producto = models.ForeignKey(producto, on_delete=models.CASCADE)
    cantidad = models.IntegerField()
    costo_unitario_compra = models.FloatField()
    def __str__(self):
        return f"DetalleCompra {self.id_detalle_compra} - Producto: {self.id_producto.nombre_producto} - Cantidad: {self.cantidad} "

class detalle_venta(models.Model):
    id_detalle_venta = models.AutoField(primary_key=True)
    id_venta = models.ForeignKey(venta, on_delete=models.CASCADE)
    id_producto = models.ForeignKey(producto, on_delete=models.CASCADE)
    cantidad = models.IntegerField()
    precio_unitario_venta = models.FloatField()
    def __str__(self):
        return f"DetalleVenta {self.id_detalle_venta} - Producto: {self.id_producto.nombre_producto} - Cantidad: {self.cantidad} "

class ajuste_stock(models.Model):
    id_ajuste_stock = models.AutoField(primary_key=True)
    fecha_hora = models.DateTimeField(auto_now_add=True)
    class ajuste(models.TextChoices):
        AUMENTO = 'Aumento'
        DISMINUCION ='Disminucion'
    tipo_ajuste = models.CharField(
        max_length=30,
        choices=ajuste.choices,)
    cantidad_ajustada = models.IntegerField()
    motivo = models.TextField(max_length=300)
    id_producto = models.ForeignKey(producto, on_delete=models.CASCADE)
    id_usuario = models.ForeignKey(usuario, on_delete=models.CASCADE)
    def __str__(self):
        return f"AjusteStock {self.id_ajuste_stock} - Producto: {self.id_producto.nombre_producto} - Cantidad Ajustada: {self.cantidad_ajustada} "