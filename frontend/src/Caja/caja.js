import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";

function Caja() {
    const [productos, setProductos] = useState([]);
    const [todosProductos, setTodosProductos] = useState([]);
    const [carrito, setCarrito] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [idUsuario, setIdUsuario] = useState("");
    const [usuarios, setUsuarios] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [mostrarCatalogo, setMostrarCatalogo] = useState(false);
    const [mostrarModalPago, setMostrarModalPago] = useState(false);
    const [metodoPago, setMetodoPago] = useState("");
    const { user } = useAuth();
    
    // Estados para paginación
    const [paginaActual, setPaginaActual] = useState(1);
    const productosPorPagina = 10;
    
    const navigate = useNavigate();

    // Cargar todos los productos para el catálogo
    useEffect(() => {
        const fetchTodosProductos = async () => {
            try {
                const response = await axiosInstance.get('productos/');
                setTodosProductos(response.data);
            } catch (error) {
                console.error("Error al cargar productos:", error);
            }
        };
        fetchTodosProductos();
    }, []);

    // Buscar productos
    const buscarProductos = async () => {
        if (!busqueda.trim()) {
            setProductos([]);
            return;
        }
        
        try {
            const response = await axiosInstance.get(
                `productos/buscar/?q=${busqueda}`
            );
            setProductos(response.data);
        } catch (error) {
            console.error("Error al buscar productos:", error);
            setError("Error al buscar productos");
        }
    };

    // Agregar producto al carrito
    const agregarAlCarrito = (producto) => {
        const productoExistente = carrito.find(
            item => item.id_producto === producto.id_producto
        );

        if (productoExistente) {
            if (productoExistente.cantidad < producto.stock_actual) {
                setCarrito(carrito.map(item =>
                    item.id_producto === producto.id_producto
                        ? { ...item, cantidad: item.cantidad + 1 }
                        : item
                ));
            } else {
                setError(`Stock máximo alcanzado para ${producto.nombre_producto}`);
                setTimeout(() => setError(""), 3000);
            }
        } else {
            setCarrito([...carrito, { 
                ...producto, 
                cantidad: 1 
            }]);
        }
        
        setBusqueda("");
        setProductos([]);
    };

    // Modificar cantidad del carrito
    const modificarCantidad = (id_producto, nuevaCantidad) => {
        const producto = carrito.find(item => item.id_producto === id_producto);
        
        if (nuevaCantidad <= 0) {
            eliminarDelCarrito(id_producto);
            return;
        }

        if (nuevaCantidad > producto.stock_actual) {
            setError(`Stock insuficiente. Disponible: ${producto.stock_actual}`);
            setTimeout(() => setError(""), 3000);
            return;
        }

        setCarrito(carrito.map(item =>
            item.id_producto === id_producto
                ? { ...item, cantidad: parseInt(nuevaCantidad) }
                : item
        ));
    };

    // Eliminar del carrito
    const eliminarDelCarrito = (id_producto) => {
        setCarrito(carrito.filter(item => item.id_producto !== id_producto));
    };

    // Calcular total
    const calcularTotal = () => {
        return carrito.reduce(
            (total, item) => total + (item.precio_venta * item.cantidad), 
            0
        );
    };

    // Abrir modal de pago
    const abrirModalPago = () => {

        if (carrito.length === 0) {
            setError("El carrito está vacío");
            return;
        }

        setMostrarModalPago(true);
    };

    // Procesar venta con método de pago
    const procesarVentaConPago = async () => {
        if (!metodoPago) {
            setError("Debe seleccionar un método de pago");
            return;
        }

        setLoading(true);
        setError("");
        setMostrarModalPago(false);

        try {
            const items = carrito.map(item => ({
                id_producto: item.id_producto,
                cantidad: item.cantidad
            }));

            const response = await axiosInstance.post(
                'ventas/procesar_venta/',
                {
                    metodo_pago: metodoPago,
                    items: items
                }
            );

            const idVenta = response.data.id_venta;

            // Descargar boleta PDF
            const pdfResponse = await axiosInstance.get(
                `ventas/${idVenta}/generar_boleta/`,
                { responseType: 'blob' }
            );

            // Crear enlace de descarga
            const url = window.URL.createObjectURL(new Blob([pdfResponse.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `boleta_${idVenta}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            setSuccess(`¡Venta procesada exitosamente! Total: $${response.data.total}. Boleta descargada.`);
            setCarrito([]);
            setBusqueda("");
            setProductos([]);
            setMetodoPago("");
            
            // Recargar productos para actualizar stock
            const respProductos = await axiosInstance.get('productos/');
            setTodosProductos(respProductos.data);
            
            setTimeout(() => {
                setSuccess("");
            }, 5000);

        } catch (error) {
            console.error("Error al procesar venta:", error);
            setError(
                error.response?.data?.error || 
                "Error al procesar la venta"
            );
        } finally {
            setLoading(false);
        }
    };

    // Cancelar venta
    const cancelarVenta = () => {
        setCarrito([]);
        setBusqueda("");
        setProductos([]);
        setError("");
    };

    // Lógica de paginación
    const indiceUltimoProducto = paginaActual * productosPorPagina;
    const indicePrimerProducto = indiceUltimoProducto - productosPorPagina;
    const productosActuales = todosProductos.slice(indicePrimerProducto, indiceUltimoProducto);
    const totalPaginas = Math.ceil(todosProductos.length / productosPorPagina);

    const cambiarPagina = (numeroPagina) => {
        setPaginaActual(numeroPagina);
    };

    return (
        <div className="container mt-4">
            <h1>Caja - LaEsquina</h1>
            <hr />

            {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError("")}></button>
                </div>
            )}

            {success && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                    {success}
                    <button type="button" className="btn-close" onClick={() => setSuccess("")}></button>
                </div>
            )}

            {/* Modal de método de pago */}
            {mostrarModalPago && (
                <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Seleccione Método de Pago</h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => setMostrarModalPago(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="d-grid gap-3">
                                    <button 
                                        className={`btn btn-lg ${metodoPago === 'Efectivo' ? 'btn-success' : 'btn-outline-success'}`}
                                        onClick={() => setMetodoPago('Efectivo')}
                                    >
                                        💵 Efectivo
                                    </button>
                                    <button 
                                        className={`btn btn-lg ${metodoPago === 'Debito' ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => setMetodoPago('Debito')}
                                    >
                                        💳 Débito
                                    </button>
                                </div>
                                <div className="mt-4 text-center">
                                    <h4>Total a pagar: <span className="text-success">${calcularTotal().toFixed(2)}</span></h4>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={() => {
                                        setMostrarModalPago(false);
                                        setMetodoPago("");
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-success" 
                                    onClick={procesarVentaConPago}
                                    disabled={!metodoPago}
                                >
                                    Confirmar y Generar Boleta
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="row">
                {/* Panel de búsqueda */}
                <div className="col-md-6">
                    <div className="card mb-3">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">Buscar Producto</h5>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <span className="form-control-plaintext">
                                    <strong>Cajero:</strong> {user.username}
                                </span>
                            </div>

                            <div className="input-group mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Buscar por nombre o SKU..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && buscarProductos()}
                                />
                                <button 
                                    className="btn btn-primary" 
                                    onClick={buscarProductos}
                                >
                                    Buscar
                                </button>
                            </div>

                            {/* Botón para mostrar/ocultar catálogo */}
                            <button 
                                className="btn btn-info w-100 mb-3" 
                                onClick={() => setMostrarCatalogo(!mostrarCatalogo)}
                            >
                                {mostrarCatalogo ? 'Ocultar Catálogo' : 'Ver Catálogo Completo'}
                            </button>

                            {/* Resultados de búsqueda */}
                            {productos.length > 0 && (
                                <div className="list-group mb-3" style={{maxHeight: '300px', overflowY: 'auto'}}>
                                    {productos.map(producto => (
                                        <button
                                            key={producto.id_producto}
                                            className="list-group-item list-group-item-action"
                                            onClick={() => agregarAlCarrito(producto)}
                                        >
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div className="flex-grow-1">
                                                    <strong>{producto.nombre_producto}</strong>
                                                    <br />
                                                    <small className="text-muted">SKU: {producto.sku}</small>
                                                    <br />
                                                    <small className="text-muted">Stock: {producto.stock_actual}</small>
                                                </div>
                                                <div className="text-end">
                                                    <strong className="text-success">${producto.precio_venta}</strong>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Catálogo completo con paginación */}
                            {mostrarCatalogo && (
                                <div>
                                    <h6 className="mb-2">Catálogo de Productos</h6>
                                    <div className="list-group" style={{maxHeight: '400px', overflowY: 'auto'}}>
                                        {productosActuales.map(producto => (
                                            <button
                                                key={producto.id_producto}
                                                className="list-group-item list-group-item-action"
                                                onClick={() => agregarAlCarrito(producto)}
                                                disabled={producto.stock_actual === 0}
                                            >
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div className="flex-grow-1">
                                                        <div className="d-flex align-items-center">
                                                            {producto.imagen && (
                                                                <img 
                                                                    src={producto.imagen} 
                                                                    alt={producto.nombre_producto}
                                                                    style={{
                                                                        width: '50px', 
                                                                        height: '50px', 
                                                                        objectFit: 'cover',
                                                                        borderRadius: '5px',
                                                                        marginRight: '10px'
                                                                    }}
                                                                />
                                                            )}
                                                            <div>
                                                                <strong>{producto.nombre_producto}</strong>
                                                                <br />
                                                                <small className="text-muted">SKU: {producto.sku}</small>
                                                                <br />
                                                                <small className={producto.stock_actual <= producto.stock_minimo ? 'text-danger' : 'text-muted'}>
                                                                    Stock: {producto.stock_actual}
                                                                    {producto.stock_actual === 0 && ' (Agotado)'}
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-end">
                                                        <strong className="text-success">${producto.precio_venta}</strong>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Paginación */}
                                    {totalPaginas > 1 && (
                                        <nav className="mt-3">
                                            <ul className="pagination pagination-sm justify-content-center">
                                                <li className={`page-item ${paginaActual === 1 ? 'disabled' : ''}`}>
                                                    <button 
                                                        className="page-link" 
                                                        onClick={() => cambiarPagina(paginaActual - 1)}
                                                        disabled={paginaActual === 1}
                                                    >
                                                        Anterior
                                                    </button>
                                                </li>
                                                
                                                {[...Array(totalPaginas)].map((_, index) => (
                                                    <li 
                                                        key={index + 1} 
                                                        className={`page-item ${paginaActual === index + 1 ? 'active' : ''}`}
                                                    >
                                                        <button 
                                                            className="page-link" 
                                                            onClick={() => cambiarPagina(index + 1)}
                                                        >
                                                            {index + 1}
                                                        </button>
                                                    </li>
                                                ))}
                                                
                                                <li className={`page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`}>
                                                    <button 
                                                        className="page-link" 
                                                        onClick={() => cambiarPagina(paginaActual + 1)}
                                                        disabled={paginaActual === totalPaginas}
                                                    >
                                                        Siguiente
                                                    </button>
                                                </li>
                                            </ul>
                                        </nav>
                                    )}

                                    <div className="text-center mt-2">
                                        <small className="text-muted">
                                            Mostrando {indicePrimerProducto + 1} - {Math.min(indiceUltimoProducto, todosProductos.length)} de {todosProductos.length} productos
                                        </small>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Carrito */}
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header bg-success text-white">
                            <h5 className="mb-0">Carrito de Compra</h5>
                        </div>
                        <div className="card-body">
                            {carrito.length === 0 ? (
                                <p className="text-muted text-center">El carrito está vacío</p>
                            ) : (
                                <>
                                    <div style={{maxHeight: '400px', overflowY: 'auto'}}>
                                        <table className="table table-sm">
                                            <thead>
                                                <tr>
                                                    <th>Producto</th>
                                                    <th>Precio</th>
                                                    <th>Cant.</th>
                                                    <th>Subtotal</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {carrito.map(item => (
                                                    <tr key={item.id_producto}>
                                                        <td>
                                                            <small>{item.nombre_producto}</small>
                                                        </td>
                                                        <td>${item.precio_venta}</td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                className="form-control form-control-sm"
                                                                style={{width: '60px'}}
                                                                min="1"
                                                                max={item.stock_actual}
                                                                value={item.cantidad}
                                                                onChange={(e) => 
                                                                    modificarCantidad(
                                                                        item.id_producto, 
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                        <td>
                                                            <strong>${(item.precio_venta * item.cantidad).toFixed(2)}</strong>
                                                        </td>
                                                        <td>
                                                            <button
                                                                className="btn btn-danger btn-sm"
                                                                onClick={() => eliminarDelCarrito(item.id_producto)}
                                                            >
                                                                ✕
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <hr />
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h4>Total:</h4>
                                        <h3 className="text-success">${calcularTotal().toFixed(2)}</h3>
                                    </div>

                                    <div className="d-grid gap-2">
                                        <button
                                            className="btn btn-success btn-lg"
                                            onClick={abrirModalPago}
                                            disabled={loading}
                                        >
                                            {loading ? 'Procesando...' : 'Procesar Venta'}
                                        </button>
                                        <button
                                            className="btn btn-outline-danger"
                                            onClick={cancelarVenta}
                                            disabled={loading}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Caja;