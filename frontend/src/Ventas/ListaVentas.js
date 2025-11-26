import React ,{useEffect, useState} from "react";
import axiosInstance from "../utils/axiosInstance";
import { Link } from "react-router-dom";


function ListaVentas(){
    const [ventas, setVentas] = useState([]);
    const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVentas = async () => {
            try {
                const response = await axiosInstance.get('ventas/');
                // Ordenar por fecha descendente (las más nuevas primero)
                const ventasOrdenadas = response.data.sort((a, b) => new Date(b.fecha_hora) - Date(a.fecha_hora))
                setVentas(ventasOrdenadas);
            } catch (error) {
                console.log("Error cargando ventas",error);
            } finally {
                setLoading(false)
            }
        }; 
        fetchVentas(); 
    },[]);

    // Formateador de Moneda (Peso Chileno)
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
    };

    // Formateador de Fecha
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('es-CL', options);
    };

    // Funciones del Modal
    const abrirModal = (venta) => setVentaSeleccionada(venta);
    const cerrarModal = () => setVentaSeleccionada(null);

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1>Historial de Ventas</h1>
                <Link to="/caja" className="btn btn-success">
                    <i className="bi bi-cart-plus"></i> Nueva Venta
                </Link>
            </div>
            <hr />

            <div className="card shadow-sm">
                <div className="card-body">
                    {loading ? (
                        <div className="text-center">Cargando ventas...</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th># ID</th>
                                        <th>Fecha y Hora</th>
                                        <th>Cajero</th>
                                        <th>Método Pago</th>
                                        <th>Total</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ventas.map((venta) => (
                                        <tr key={venta.id_venta}>
                                            <td><strong>{venta.id_venta}</strong></td>
                                            <td>{formatDate(venta.fecha_hora)}</td>
                                            <td>
                                                <span className="badge bg-secondary">
                                                    {venta.id_usuario ? venta.id_usuario.username : 'Desconocido'}
                                                </span>
                                            </td>
                                            <td>
                                                {venta.metodo_pago === 'Efectivo' ? (
                                                    <span className="badge bg-success">Efectivo</span>
                                                ) : (
                                                    <span className="badge bg-primary">Débito</span>
                                                )}
                                            </td>
                                            <td className="fw-bold text-success">{formatCurrency(venta.total_venta)}</td>
                                            <td>
                                                <button 
                                                    className="btn btn-outline-primary btn-sm me-2"
                                                    onClick={() => abrirModal(venta)}
                                                >
                                                    Ver Detalles
                                                </button>
                                                {/* Enlace para descargar boleta si lo deseas implementar aquí también */}
                                                {/* <a href={`...`} className="btn btn-outline-secondary btn-sm">Boleta</a> */}
                                            </td>
                                        </tr>
                                    ))}
                                    {ventas.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="text-center py-4">No se han registrado ventas aún.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* --- MODAL DE DETALLES --- */}
            {ventaSeleccionada && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">Detalle de Venta #{ventaSeleccionada.id_venta}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={cerrarModal}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <p><strong>Fecha:</strong> {formatDate(ventaSeleccionada.fecha_hora)}</p>
                                        <p><strong>Cajero:</strong> {ventaSeleccionada.id_usuario?.username}</p>
                                    </div>
                                    <div className="col-md-6 text-end">
                                        <p><strong>Método de Pago:</strong> {ventaSeleccionada.metodo_pago}</p>
                                        <h4 className="text-success">Total: {formatCurrency(ventaSeleccionada.total_venta)}</h4>
                                    </div>
                                </div>

                                <h6 className="border-bottom pb-2">Productos Vendidos</h6>
                                <div className="table-responsive">
                                    <table className="table table-sm table-bordered">
                                        <thead className="table-light">
                                            <tr>
                                                <th>SKU</th>
                                                <th>Producto</th>
                                                <th className="text-center">Cant.</th>
                                                <th className="text-end">Precio Unit.</th>
                                                <th className="text-end">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ventaSeleccionada.detalles && ventaSeleccionada.detalles.map((detalle, index) => (
                                                <tr key={index}>
                                                    <td>{detalle.sku}</td>
                                                    <td>{detalle.producto}</td>
                                                    <td className="text-center">{detalle.cantidad}</td>
                                                    <td className="text-end">{formatCurrency(detalle.precio_unitario_venta)}</td>
                                                    <td className="text-end">
                                                        {formatCurrency(detalle.cantidad * detalle.precio_unitario_venta)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={cerrarModal}>Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
export default ListaVentas;