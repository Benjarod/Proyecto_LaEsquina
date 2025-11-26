import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { Link } from "react-router-dom";

function ListaCompras() {
    const [compras, setCompras] = useState([]);
    const [compraSeleccionada, setCompraSeleccionada] = useState(null); // Para el Modal
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCompras = async () => {
            try {
                const response = await axiosInstance.get('compras/');
                // Ordenar por fecha (más reciente primero)
                const ordenadas = response.data.sort((a, b) => new Date(b.fecha_hora) - new Date(a.fecha_hora));
                setCompras(ordenadas);
            } catch (error) {
                console.error("Error cargando compras:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCompras();
    }, []);

    // Formateadores
    const formatCurrency = (amount) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-CL', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1>Historial de Compras</h1>
                <Link to="/ingresar-compra" className="btn btn-primary">
                    <i className="bi bi-plus-lg"></i> Ingresar Mercadería
                </Link>
            </div>
            <hr />

            <div className="card shadow-sm">
                <div className="card-body">
                    {loading ? (
                        <div className="text-center py-3">Cargando historial...</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th># ID</th>
                                        <th>Fecha</th>
                                        <th>Proveedor</th>
                                        <th>Registrado por</th>
                                        <th className="text-end">Total Compra</th>
                                        <th className="text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {compras.map((compra) => (
                                        <tr key={compra.id_compra}>
                                            <td><strong>{compra.id_compra}</strong></td>
                                            <td>{formatDate(compra.fecha_hora)}</td>
                                            <td>
                                                {compra.nombre_proveedor} <br/>
                                                <small className="text-muted">{compra.rut_proveedor}</small>
                                            </td>
                                            <td><span className="badge bg-secondary">{compra.nombre_usuario}</span></td>
                                            <td className="text-end fw-bold text-success">{formatCurrency(compra.total_compra)}</td>
                                            <td className="text-center">
                                                <button 
                                                    className="btn btn-outline-info btn-sm"
                                                    onClick={() => setCompraSeleccionada(compra)}
                                                >
                                                    <i className="bi bi-eye"></i> Ver Detalles
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {compras.length === 0 && (
                                        <tr><td colSpan="6" className="text-center">No hay compras registradas.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* --- MODAL DE DETALLES --- */}
            {compraSeleccionada && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">Detalle de Compra #{compraSeleccionada.id_compra}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setCompraSeleccionada(null)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row mb-3">
                                    <div className="col-6">
                                        <p><strong>Proveedor:</strong> {compraSeleccionada.nombre_proveedor}</p>
                                        <p><strong>Fecha:</strong> {formatDate(compraSeleccionada.fecha_hora)}</p>
                                    </div>
                                    <div className="col-6 text-end">
                                        <h4>Total: {formatCurrency(compraSeleccionada.total_compra)}</h4>
                                    </div>
                                </div>
                                
                                <h6>Productos Ingresados:</h6>
                                <table className="table table-sm table-bordered">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Producto</th>
                                            <th>SKU</th>
                                            <th className="text-center">Cant.</th>
                                            <th className="text-end">Costo Unit.</th>
                                            <th className="text-end">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {compraSeleccionada.detalles?.map((detalle, idx) => (
                                            <tr key={idx}>
                                                <td>{detalle.producto}</td>
                                                <td>{detalle.sku}</td>
                                                <td className="text-center">{detalle.cantidad}</td>
                                                <td className="text-end">{formatCurrency(detalle.costo_unitario_compra)}</td>
                                                <td className="text-end">{formatCurrency(detalle.cantidad * detalle.costo_unitario_compra)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setCompraSeleccionada(null)}>Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ListaCompras;