import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';

function Dashboard() {
    const [metrics, setMetrics] = useState({
        ingresos_mes: 0,
        ventas_hoy: 0,
        ingresos_hoy: 0,
        productos_top: [],
        alertas_stock: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await axiosInstance.get('dashboard/');
                setMetrics(response.data);
            } catch (error) {
                console.error("Error cargando dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, []);

    if (loading) return <div className="container mt-4">Cargando métricas...</div>;

    return (
        <div className="container mt-4">
            <h1>La Esquina - Dashboard</h1>
            <hr />

            {/* Tarjetas de Resumen */}
            <div className="row mb-4">
                <div className="col-md-6 col-xl-3 mb-3">
                    <div className="card bg-primary text-white h-100">
                        <div className="card-body">
                            <h5 className="card-title">Ingresos (Mes Actual)</h5>
                            <h2 className="display-6 fw-bold">${metrics.ingresos_mes.toLocaleString()}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 col-xl-3 mb-3">
                    <div className="card bg-success text-white h-100">
                        <div className="card-body">
                            <h5 className="card-title">Ventas Hoy</h5>
                            <h2 className="display-6 fw-bold">{metrics.ventas_hoy} | ${metrics.ingresos_hoy.toLocaleString()}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 col-xl-3 mb-3">
                    <div className="card bg-warning text-dark h-100">
                        <div className="card-body">
                            <h5 className="card-title">Prod. Bajo Stock</h5>
                            <h2 className="display-6 fw-bold">{metrics.alertas_stock.length}</h2>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                {/* Tabla de Productos más vendidos */}
                <div className="col-md-6 mb-4">
                    <div className="card shadow-sm">
                        <div className="card-header bg-light">
                            <h5 className="mb-0">🏆 Productos Más Vendidos</h5>
                        </div>
                        <div className="card-body">
                            {metrics.productos_top.length > 0 ? (
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th className="text-end">Unidades Vendidas</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {metrics.productos_top.map((prod, index) => (
                                            <tr key={index}>
                                                <td>{prod.id_producto__nombre_producto}</td>
                                                <td className="text-end fw-bold">{prod.total_vendido}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-muted">No hay datos de ventas aún.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabla de Alertas de Stock */}
                <div className="col-md-6 mb-4">
                    <div className="card shadow-sm border-danger">
                        <div className="card-header bg-danger text-white">
                            <h5 className="mb-0">⚠️ Alertas de Stock Bajo</h5>
                        </div>
                        <div className="card-body">
                            {metrics.alertas_stock.length > 0 ? (
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th className="text-center">Actual</th>
                                            <th className="text-center">Mínimo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {metrics.alertas_stock.map((alert, index) => (
                                            <tr key={index}>
                                                <td>{alert.nombre_producto}</td>
                                                <td className="text-center text-danger fw-bold">{alert.stock_actual}</td>
                                                <td className="text-center text-muted">{alert.stock_minimo}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="alert alert-success m-0">Inventario Suficiente</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;