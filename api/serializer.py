from rest_framework import serializers
from .models import proveedor, usuario, producto, compra, venta, detalle_compra, detalle_venta, ajuste_stock
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class ProveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = proveedor
        fields = '__all__'

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Añadir campos custom al token
        token['username'] = user.username
        token['rol'] = user.rol
        # ... puedes añadir más campos si quieres

        return token

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = usuario
        fields = ['id', 'username', 'rol', 'email', 'password', 'first_name', 'last_name', 'is_staff']
        #    Nunca se enviará la contraseña hasheada en una respuesta GET
        extra_kwargs = {'password': {'write_only': True, 'required': True}}

        #    Esto asegura que la contraseña se HASHEA correctamente.
    def create(self, validated_data):
        user = usuario.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            rol=validated_data.get('rol', 'Cajero'), # Default a Cajero si no se provee
            email=validated_data.get('email', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user
    
    def update(self, instance, validated_data):
        # Esto se usa para PATCH (ActualizarUsuario)
        
        # Extraemos la contraseña de los datos a validar
        password = validated_data.pop('password', None)
        
        # Llamamos al método 'update' de la clase padre para actualizar el resto de campos
        instance = super().update(instance, validated_data)

        # Si el usuario incluyó una nueva contraseña (y no es un string vacío)
        if password:
            instance.set_password(password) # Usamos set_password para hashear
            instance.save() # Guardamos la instancia

        return instance

class ProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = producto
        fields = '__all__'

class CompraSerializer(serializers.ModelSerializer):
    class Meta:
        model = compra
        fields = '__all__'

class VentaSerializer(serializers.ModelSerializer):
    id_usuario = UsuarioSerializer(read_only=True)
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