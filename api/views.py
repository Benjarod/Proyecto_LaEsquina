from django.shortcuts import render
from rest_framework import viewsets, status
from .serializer import ProveedorSerializer, UsuarioSerializer, ProductoSerializer, CompraSerializer, VentaSerializer, DetalleCompraSerializer, DetalleVentaSerializer, AjusteStockSerializer
from .models import proveedor,usuario, producto, compra, venta, detalle_compra, detalle_venta, ajuste_stock
from django.db import transaction
from rest_framework.decorators import action
from rest_framework.response import Response

from rest_framework.permissions import IsAuthenticated
from .permissions import IsAdmin, IsBodeguero, IsCajero

from django.http import HttpResponse
from reportlab.lib.pagesizes import A4
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
from io import BytesIO
from datetime import datetime,timedelta

from django.db.models import Sum, F, Count
from django.utils import timezone
from rest_framework.views import APIView

# Create your views here.
class ProveedorViewSet(viewsets.ModelViewSet):
    queryset = proveedor.objects.all()
    serializer_class = ProveedorSerializer
    permission_classes = [IsAuthenticated, IsAdmin | IsBodeguero]

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = producto.objects.all()
    serializer_class = ProductoSerializer
    permission_classes = [IsAuthenticated, IsAdmin | IsBodeguero | IsCajero]

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
    permission_classes = [IsAuthenticated, IsAdmin | IsBodeguero] 

    @action(detail=False, methods=['post'])
    def procesar_compra(self, request):
        try:
            with transaction.atomic():
                user = request.user
                items = request.data.get('items', []) # Solo recibimos items, no proveedor global
                
                if not items:
                    return Response({'error': 'No hay productos en la lista'}, status=status.HTTP_400_BAD_REQUEST)

                # --- PASO 1: Agrupar productos por su ID de Proveedor ---
                # Estructura final: { id_proveedor_1: [itemA, itemB], id_proveedor_2: [itemC] }
                grupos_por_proveedor = {}
                
                for item in items:
                    prod_id = item['id_producto']
                    try:
                        prod_obj = producto.objects.get(id_producto=prod_id)
                    except producto.DoesNotExist:
                        raise Exception(f"Producto ID {prod_id} no encontrado")
                    
                    # Obtenemos el proveedor asociado a este producto
                    prov_id = prod_obj.id_proveedor.id_proveedor
                    
                    if prov_id not in grupos_por_proveedor:
                        grupos_por_proveedor[prov_id] = []
                    
                    # Guardamos el objeto producto en el item para usarlo luego
                    item['producto_obj'] = prod_obj 
                    grupos_por_proveedor[prov_id].append(item)

                compras_creadas = 0

                # --- PASO 2: Crear una Compra distinta por cada grupo ---
                for prov_id, lista_items in grupos_por_proveedor.items():
                    
                    # Calcular el total solo de ESTE proveedor
                    total_grupo = sum(float(i['costo_unitario']) * int(i['cantidad']) for i in lista_items)
                    
                    nueva_compra = compra.objects.create(
                        id_usuario=user,
                        id_proveedor_id=prov_id, # Asignamos el proveedor detectado
                        total_compra=total_grupo
                    )

                    # Crear los detalles para esta compra
                    for i in lista_items:
                        prod = i['producto_obj']
                        cantidad = int(i['cantidad'])
                        costo = float(i['costo_unitario'])

                        detalle_compra.objects.create(
                            id_compra=nueva_compra,
                            id_producto=prod,
                            cantidad=cantidad,
                            costo_unitario_compra=costo
                        )

                        # Actualizar stock y precio costo
                        prod.stock_actual += cantidad
                        prod.precio_costo = costo
                        prod.save()
                    
                    compras_creadas += 1

                return Response({
                    'message': f'Se registraron exitosamente {compras_creadas} compras distintas agrupadas por proveedor.'
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VentaViewSet(viewsets.ModelViewSet):
    queryset = venta.objects.all()
    serializer_class = VentaSerializer
    permission_classes = [IsAuthenticated, IsAdmin | IsCajero]

    
    @action(detail=False, methods=['post'])
    def procesar_venta(self, request):
        try:
            with transaction.atomic():
                user = request.user
                metodo_pago = request.data.get('metodo_pago', 'Efectivo')
                items = request.data.get('items', [])
                
                if not items:
                    return Response(
                        {'error': 'Faltan datos requeridos'},
                        status=status.HTTP_400_BAD_REQUEST
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
                            'precio_unitario': prod.precio_venta,
                            'subtotal': subtotal
                        })
                        
                    except producto.DoesNotExist:
                        return Response(
                            {'error': f'Producto con ID {item["id_producto"]} no encontrado'},
                            status=status.HTTP_404_NOT_FOUND
                        )
                
                # Crear venta
                nueva_venta = venta.objects.create(
                    total_venta=total_venta,
                    id_usuario=user,
                    metodo_pago=metodo_pago
                )
                
                # Crear detalles y actualizar stock
                detalles_creados = []
                for item_venta in productos_venta:
                    detalle = detalle_venta.objects.create(
                        id_venta=nueva_venta,
                        id_producto=item_venta['producto'],
                        cantidad=item_venta['cantidad'],
                        precio_unitario_venta=item_venta['precio_unitario']
                    )
                    detalles_creados.append(detalle)
                    
                    # Actualizar stock
                    prod = item_venta['producto']
                    prod.stock_actual -= item_venta['cantidad']
                    prod.save()
                
                # Serializar respuesta
                venta_serializer = VentaSerializer(nueva_venta)
                
                return Response({
                    'message': 'Venta procesada exitosamente',
                    'venta': venta_serializer.data,
                    'total': total_venta,
                    'id_venta': nueva_venta.id_venta
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'])
    def generar_boleta(self, request, pk=None):
        """Generar boleta en PDF para una venta"""
        try:
            venta_obj = venta.objects.get(pk=pk)
            detalles = detalle_venta.objects.filter(id_venta=venta_obj)
            
            # Crear PDF en memoria
            buffer = BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter)
            elements = []
            
            # Estilos
            styles = getSampleStyleSheet()
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=24,
                textColor=colors.HexColor('#2c3e50'),
                spaceAfter=30,
                alignment=TA_CENTER
            )
            
            # Título
            titulo = Paragraph("MINIMARKET LA ESQUINA", title_style)
            elements.append(titulo)
            elements.append(Spacer(1, 0.3*inch))
            
            # Información de la venta
            info_style = ParagraphStyle(
                'Info',
                parent=styles['Normal'],
                fontSize=10,
                spaceAfter=6
            )
            
            fecha_formateada = venta_obj.fecha_hora.strftime('%d/%m/%Y %H:%M:%S')
            
            info_data = [
                f"<b>Boleta N°:</b> {venta_obj.id_venta}",
                f"<b>Fecha:</b> {fecha_formateada}",
                f"<b>Cajero:</b> {venta_obj.id_usuario.username}",
                f"<b>Método de Pago:</b> {venta_obj.metodo_pago}",
            ]
            
            for info in info_data:
                elements.append(Paragraph(info, info_style))
            
            elements.append(Spacer(1, 0.3*inch))
            
            # Tabla de productos
            data = [['Producto', 'Cant.', 'Precio Unit.', 'Subtotal']]
            
            for detalle in detalles:
                data.append([
                    detalle.id_producto.nombre_producto,
                    str(detalle.cantidad),
                    f"${detalle.precio_unitario_venta:,.0f}",
                    f"${(detalle.cantidad * detalle.precio_unitario_venta):,.0f}"
                ])
            
            # Crear tabla
            tabla = Table(data, colWidths=[3*inch, 0.8*inch, 1.2*inch, 1.2*inch])
            tabla.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3498db')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 1), (-1, -1), 10),
                ('ALIGN', (1, 1), (-1, -1), 'CENTER'),
            ]))
            
            elements.append(tabla)
            elements.append(Spacer(1, 0.3*inch))
            
            # Total
            total_style = ParagraphStyle(
                'Total',
                parent=styles['Normal'],
                fontSize=16,
                textColor=colors.HexColor('#27ae60'),
                alignment=TA_RIGHT,
                spaceAfter=12
            )
            
            total_text = f"<b>TOTAL: ${venta_obj.total_venta:,.0f}</b>"
            elements.append(Paragraph(total_text, total_style))
            
            elements.append(Spacer(1, 0.5*inch))
            
            # Pie de página
            footer_style = ParagraphStyle(
                'Footer',
                parent=styles['Normal'],
                fontSize=9,
                textColor=colors.grey,
                alignment=TA_CENTER
            )
            
            footer = Paragraph("¡Gracias por su compra!<br/>Minimarket La Esquina", footer_style)
            elements.append(footer)
            
            # Construir PDF
            doc.build(elements)
            
            # Obtener PDF
            pdf = buffer.getvalue()
            buffer.close()
            
            # Retornar respuesta
            response = HttpResponse(content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="boleta_{venta_obj.id_venta}.pdf"'
            response.write(pdf)
            
            return response
            
        except venta.DoesNotExist:
            return Response(
                {'error': 'Venta no encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DetalleCompraViewSet(viewsets.ModelViewSet):
    queryset = detalle_compra.objects.all()
    serializer_class = DetalleCompraSerializer
    permission_classes = [IsAuthenticated, IsAdmin | IsBodeguero]

class DetalleVentaViewSet(viewsets.ModelViewSet):
    queryset = detalle_venta.objects.all()
    serializer_class = DetalleVentaSerializer
    permission_classes = [IsAuthenticated, IsAdmin | IsCajero]

class AjusteStockViewSet(viewsets.ModelViewSet):
    queryset = ajuste_stock.objects.all()
    serializer_class = AjusteStockSerializer
    permission_classes = [IsAuthenticated, IsAdmin | IsBodeguero]

class DashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        hoy = timezone.now()
        inicio_mes = hoy.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # 1. Ingresos totales del mes actual
        ingresos_mes = venta.objects.filter(fecha_hora__gte=inicio_mes).aggregate(total=Sum('total_venta'))['total'] or 0
        
        # 2. Cantidad de ventas hoy
        inicio_dia = hoy.replace(hour=0, minute=0, second=0, microsecond=0)
        ventas_hoy = venta.objects.filter(fecha_hora__gte=inicio_dia).count()

        ingresos_hoy = venta.objects.filter(fecha_hora__gte=inicio_dia).aggregate(total=Sum('total_venta'))['total'] or 0

        # 3. Productos más vendidos (Top 5 histórico)
        # Usamos detalle_venta para sumar las cantidades por producto
        productos_mas_vendidos = detalle_venta.objects.values('id_producto__nombre_producto') \
            .annotate(total_vendido=Sum('cantidad')) \
            .order_by('-total_vendido')[:5]

        # 4. Productos con stock crítico (Stock actual <= Stock mínimo)
        productos_bajo_stock = producto.objects.filter(stock_actual__lte=F('stock_minimo')).values(
            'nombre_producto', 'stock_actual', 'stock_minimo'
        )

        data = {
            'ingresos_mes': ingresos_mes,
            'ventas_hoy': ventas_hoy,
            'productos_top': list(productos_mas_vendidos),
            'alertas_stock': list(productos_bajo_stock),
            'ingresos_hoy': ingresos_hoy
        }

        return Response(data)
