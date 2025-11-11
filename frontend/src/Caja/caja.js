import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Caja() {
    const [productos, setProductos] = useState([]);
    const [carrito, setCarrito] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [idUsuario, setIdUsuario] = useState("");
    const [usuarios, setUsuarios] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Cargar usuarios al montar el componente
    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/usuarios/');
                setUsuarios(response.data.filter(u => u.rol === 'Cajero' || u.rol === 'Admin'));
            } catch (error) {
                console.error("Error al cargar usuarios:", error);
            }
        };
        fetchUsuarios();
    }, []);

    // Buscar productos
    const buscarProductos = async () => {
        if (!busqueda.trim()) {
            setProductos([]);
            return;
        }
        
        try {
            const response = await axios.get(
                `http://localhost:8000/api/productos/buscar/?q=${busqueda}`
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

    // Procesar venta
    const procesarVenta = async () => {
        if (!idUsuario) {
            setError("Debe seleccionar un usuario");
            return;
        }

        if (carrito.length === 0) {
            setError("El carrito está vacío");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const items = carrito.map(item => ({
                id_producto: item.id_producto,
                cantidad: item.cantidad
            }));

            const response = await axios.post(
                'http://localhost:8000/api/ventas/procesar_venta/',
                {
                    id_usuario: idUsuario,
                    items: items
                }
            );

            setSuccess(`¡Venta procesada exitosamente! Total: $${response.data.total}`);
            setCarrito([]);
            setBusqueda("");
            setProductos([]);
            
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

            <div className="row">
                {/* Panel de búsqueda */}
                <div className="col-md-6">
                    <div className="card mb-3">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">Buscar Producto</h5>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <label className="form-label">Usuario (Cajero)</label>
                                <select 
                                    className="form-select" 
                                    value={idUsuario} 
                                    onChange={(e) => setIdUsuario(e.target.value)}
                                >
                                    <option value="">-- Seleccione cajero --</option>
                                    {usuarios.map(u => (
                                        <option key={u.id_usuario} value={u.id_usuario}>
                                            {u.nombre_usuario} ({u.rol})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="input-group">
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

                            {/* Resultados de búsqueda */}
                            {productos.length > 0 && (
                                <div className="list-group mt-3" style={{maxHeight: '300px', overflowY: 'auto'}}>
                                    {productos.map(producto => (
                                        <button
                                            key={producto.id_producto}
                                            className="list-group-item list-group-item-action"
                                            onClick={() => agregarAlCarrito(producto)}
                                        >
                                            <div className="d-flex justify-content-between">
                                                <div>
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
                                            onClick={procesarVenta}
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