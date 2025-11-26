import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useParams, useNavigate } from "react-router-dom";

function ActualizarProducto() {
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
    const [mostrarModal, setMostrarModal] = useState(false);
    const [nuevoProveedor, setNuevoProveedor] = useState({
        nombre_proveedor: "",
        rut: "",
        contacto: "",
    });

    const navigate = useNavigate();
    let { id } = useParams();

    // Carga producto
    const cargarDatosProductos = async () => {
        try {
            const response = await axiosInstance.get(`productos/${id}/`);
            const producto = response.data;
            setIdProducto(producto.id_producto);
            setSkuProducto(producto.sku);
            setNombreProducto(producto.nombre_producto);
            setDescripcionProducto(producto.descripcion);
            setPrecioCostoProducto(producto.precio_costo);
            setPrecioVentaProducto(producto.precio_venta);
            setStockActualProducto(producto.stock_actual);
            setStockMinimoProducto(producto.stock_minimo);
            setImagenProducto(producto.imagen || null);
            if (producto.id_proveedor && typeof producto.id_proveedor === "object") {
                setIdProveedorProducto(producto.id_proveedor.id_proveedor || producto.id_proveedor.id || "");
            } else {
                setIdProveedorProducto(producto.id_proveedor || "");
            }
        } catch (err) {
            console.error("Error al cargar producto:", err);
            setError("Error al cargar los datos del producto");
        }
    };

    // Cargar proveedores
    useEffect(() => {
        const fetchProveedores = async () => {
            try {
                const resp = await axiosInstance.get("proveedores/");
                setProveedores(resp.data);
            } catch (err) {
                console.error("Error cargando proveedores:", err);
            }
        };
        fetchProveedores();
    }, []);

    useEffect(() => {
        cargarDatosProductos();
    }, []);

    const volverAtras = () => navigate(-1);

    // manejar modal y creación rápida de proveedor
    const handleInputProveedor = (e) => {
        setNuevoProveedor({
            ...nuevoProveedor,
            [e.target.name]: e.target.value,
        });
    };

    const guardarProveedorRapido = async () => {
        if (!nuevoProveedor.nombre_proveedor || !nuevoProveedor.rut) {
            alert("El nombre y el RUT del proveedor son obligatorios");
            return;
        }
        try {
            const response = await axiosInstance.post("proveedores/", nuevoProveedor);
            const proveedorCreado = response.data;
            setProveedores([...proveedores, proveedorCreado]);
            setIdProveedorProducto(proveedorCreado.id_proveedor);
            setNuevoProveedor({ nombre_proveedor: "", rut: "", contacto: "" });
            setMostrarModal(false);
            alert("Proveedor agregado y seleccionado correctamente.");
        } catch (err) {
            console.error("Error al crear proveedor:", err);
            alert("No se pudo crear el proveedor. Revise los datos.");
        }
    };

    // actualizar producto
    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("sku", sku);
            formData.append("nombre_producto", nombre_producto);
            formData.append("descripcion", descripcion);
            formData.append("precio_costo", precio_costo);
            formData.append("precio_venta", precio_venta);
            formData.append("stock_actual", stock_actual);
            formData.append("stock_minimo", stock_minimo);
            formData.append("id_proveedor", id_proveedor);
            if (imagen instanceof File) formData.append("imagen", imagen);

            await axiosInstance.patch(`productos/${id}/`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            navigate("/productos/");
        } catch (err) {
            console.error("Error al actualizar:", err);
            setError(
                err.response?.data ? "Error: " + JSON.stringify(err.response.data) : "Error al actualizar el producto"
            );
        }
    };

    return (
        <div className="container mt-4">
            <h2>Actualizar Producto</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={onSubmit} className="mt-3">
                <div className="row">
                    {/* Columna Izquierda */}
                    <div className="col-md-6">
                        <div className="mb-3">
                            <label className="form-label">ID Producto</label>
                            <input type="number" className="form-control" value={id_producto} disabled />
                        </div>
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
                            <textarea className="form-control" rows="3" value={descripcion} onChange={(e) => setDescripcionProducto(e.target.value)} />
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
                                            {p.nombre_proveedor} {p.rut ? `(${p.rut})` : ""}
                                        </option>
                                    ))}
                                </select>
                                <button className="btn btn-outline-success" type="button" onClick={() => setMostrarModal(true)} title="Agregar Nuevo Proveedor">
                                    <i className="bi bi-plus-lg"></i> Nuevo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label">Imagen</label>
                    {/* mostrar imagen actual si existe */}
                    {imagen && !(imagen instanceof File) && (
                        <div className="mb-2">
                            <img
                                src={imagen}
                                alt=""
                                style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "8px" }}
                            />
                        </div>
                    )}
                    <input type="file" className="form-control" accept="image/*" onChange={(e) => setImagenProducto(e.target.files[0])} />
                </div>

                <button type="submit" className="btn btn-primary mt-3">Actualizar Producto</button>
                <button type="button" className="btn btn-secondary ms-2 mt-3" onClick={volverAtras}>Cancelar</button>
            </form>

            {/* Modal para agregar proveedor rápido */}
            {mostrarModal && (
                <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
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
        </div>
    );
}

export default ActualizarProducto;