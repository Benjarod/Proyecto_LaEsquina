import React, { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function CrearProducto() {
    const [id_producto, setIdProducto] = useState("");
    const [sku, setSkuProducto] = useState("");
    const [nombre_producto, setNombreProducto] = useState("");
    const [descripcion, setDescripcionProducto] = useState("");
    const [imagen, setImagenProducto] = useState(null);
    const [precio_costo, setPrecioCostoProducto] = useState("");
    const [precio_venta, setPrecioVentaProducto] = useState("");
    const [stock_actual, setStockActualProducto] = useState("");
    const [stock_minimo, setStockMinimoProducto] = useState("");
    const [id_proveedor, setIdProveedorProducto] = useState("");
    const [error, setError] = useState("");
    const [proveedores, setProveedores] = useState([]);

    const [mostrarModalCancelar, setMostrarModalCancelar] = useState(false);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [nuevoProveedor, setNuevoProveedor] = useState({
        nombre_proveedor: '',
        rut:'',
        contacto:''
    })

    const navigate = useNavigate();

    const volverAtras = () => {
        navigate(-1);
    };

    // Cargar proveedores desde el backend para poblar el select
    useEffect(() => {
        const fetchProveedores = async () => {
            try {
                const resp = await axiosInstance.get('proveedores/');
                setProveedores(resp.data);
            } catch (err) {
                console.error('Error cargando proveedores:', err);
            }
        };
        fetchProveedores();
    }, []);

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("sku", sku);
            formData.append("nombre_producto", nombre_producto);
            formData.append("descripcion", descripcion);
            if (imagen) formData.append("imagen", imagen); // importante: archivo
            formData.append("precio_costo", precio_costo);
            formData.append("precio_venta", precio_venta);
            formData.append("stock_actual", stock_actual);
            formData.append("stock_minimo", stock_minimo);
            formData.append("id_proveedor", id_proveedor);

            await axiosInstance.post("productos/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            alert('Producto creado correctamente')
            navigate("/productos/");
        } catch (error) {
            console.error(error);
            if (error.response && error.response.data) {
                setError("Error: " + JSON.stringify(error.response.data));
            } else {
                setError("Error al crear el producto");
            }
        }
    };


    // --- LOGICA MODIFICADA PARA CANCELAR ---
    const handleCancelarClick = () => {
        // En lugar de salir directamente, mostramos el modal
        setMostrarModalCancelar(true);
    };

    const confirmarSalida = () => {
        // Aquí sí navegamos hacia atrás
        setMostrarModalCancelar(false);
        navigate(-1);
    };

    const cerrarModalCancelar = () => {
        setMostrarModalCancelar(false);
    };


    // modal para crear un proveedor
    const handleInputProveedor = (e) => {
        setNuevoProveedor({
            ...nuevoProveedor,
            [e.target.name]: e.target.value
        });
    };

    const guardarProveedorRapido = async () => {
        if (!nuevoProveedor.nombre_proveedor || !nuevoProveedor.rut) {
            alert("El nombre y el RUT del proveedor son obligatorios");
            return;
        }

        try {
            const response = await axiosInstance.post('proveedores/', nuevoProveedor);
            const proveedorCreado = response.data;
            // 1. Agregar el nuevo proveedor a la lista localmente

            setProveedores([...proveedores, proveedorCreado]);
            
            // 2. Seleccionarlo automáticamente en el formulario de producto
            setIdProveedorProducto(proveedorCreado.id_proveedor);

            // 3. Limpiar y cerrar modal
            setNuevoProveedor({ nombre_proveedor: '', rut: '', contacto: '' });
            setMostrarModal(false);
            alert("Proveedor agregado y seleccionado correctamente.");

        } catch (error) {
            console.error("Error al crear proveedor:", error);
            alert("No se pudo crear el proveedor. Revise los datos.");
        }
    };

    return (
        <div className="container mt-4">
            <h2>Crear Nuevo Producto</h2>
            <form onSubmit={onSubmit} className="mt-3">
                <div className="row">
                    {/* Columna Izquierda */}
                    <div className="col-md-6">
                        <div className="mb-3">
                            <label className="form-label">SKU</label>
                            <input type="text" className="form-control" value={sku} onChange={(e) => setSkuProducto(e.target.value)} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Nombre Producto</label>
                            <input type="text" className="form-control" value={nombre_producto} onChange={(e) => setNombreProducto(e.target.value)} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Descripción</label>
                            <textarea className="form-control" rows="3" value={descripcion} onChange={(e) => setDescripcionProducto(e.target.value)}></textarea>
                        </div>
                    </div>

                    {/* Columna Derecha */}
                    <div className="col-md-6">
                        <div className="mb-3">
                            <label className="form-label">Precio Costo</label>
                            <input type="number" className="form-control" value={precio_costo} onChange={(e) => setPrecioCostoProducto(e.target.value)} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Precio Venta</label>
                            <input type="number" className="form-control" value={precio_venta} onChange={(e) => setPrecioVentaProducto(e.target.value)} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Stock Actual</label>
                            <input type="number" className="form-control" value={stock_actual} onChange={(e) => setStockActualProducto(e.target.value)} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Stock Mínimo (Alerta)</label>
                            <input type="number" className="form-control" value={stock_minimo} onChange={(e) => setStockMinimoProducto(e.target.value)} required />
                        </div>
                        
                        {/* SELECCION DE PROVEEDOR CON BOTON DE AGREGAR */}
                        <div className="mb-3">
                            <label className="form-label">Proveedor</label>
                            <div className="input-group">
                                <select 
                                    className="form-select" 
                                    value={id_proveedor} 
                                    onChange={(e) => setIdProveedorProducto(e.target.value)} 
                                    required
                                >
                                    <option value="">Seleccione un proveedor...</option>
                                    {proveedores.map((p) => (
                                        <option key={p.id_proveedor} value={p.id_proveedor}>
                                            {p.nombre_proveedor}
                                        </option>
                                    ))}
                                </select>
                                <button 
                                    className="btn btn-outline-success" 
                                    type="button"
                                    onClick={() => setMostrarModal(true)}
                                    title="Agregar Nuevo Proveedor"
                                >
                                    <i className="bi bi-plus-lg"></i> Nuevo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-3">
                    <label>Imagen</label>
                    <input type="file" className="form-control" accept="image/*" onChange={(e) => setImagenProducto(e.target.files[0])} />
                </div>

                <button type="submit" className="btn btn-primary mt-3">Guardar Producto</button>
                <button type="button" className="btn btn-secondary ms-2 mt-3" onClick={handleCancelarClick}>Cancelar</button>
            </form>

            {/* --- MODAL PARA AGREGAR PROVEEDOR RAPIDO --- */}
            {mostrarModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header bg-success text-white">
                                <h5 className="modal-title">Agregar Nuevo Proveedor</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setMostrarModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form>
                                    <div className="mb-2">
                                        <label className="form-label">Nombre *</label>
                                        <input type="text" name="nombre_proveedor" className="form-control" value={nuevoProveedor.nombre_proveedor} onChange={handleInputProveedor} />
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label">RUT *</label>
                                        <input type="text" name="rut" className="form-control" value={nuevoProveedor.rut} onChange={handleInputProveedor} />
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label">Contacto</label>
                                        <input type="text" name="contacto" className="form-control" value={nuevoProveedor.contacto} onChange={handleInputProveedor} />
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setMostrarModal(false)}>Cancelar</button>
                                <button type="button" className="btn btn-success" onClick={guardarProveedorRapido}>Guardar y Seleccionar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* MODAL DE CONFIRMACIÓN DE CANCELAR */}
            {mostrarModalCancelar && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header bg-warning">
                                <h5 className="modal-title">¿Seguro que quieres salir?</h5>
                                <button type="button" className="btn-close" onClick={cerrarModalCancelar}></button>
                            </div>
                            <div className="modal-body">
                                <p>Si sales ahora, se perderán los datos ingresados en el formulario.</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={cerrarModalCancelar}>
                                    No, continuar editando
                                </button>
                                <button type="button" className="btn btn-danger" onClick={confirmarSalida}>
                                    Sí, salir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CrearProducto;
