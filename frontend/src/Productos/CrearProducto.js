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
    const navigate = useNavigate();

    const volverAtras = () => {
        navigate(-1);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            // 👇 Usamos FormData porque hay una imagen
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

    // Cargar proveedores desde el backend para poblar el select
    useEffect(() => {
        const fetchProveedores = async () => {
            try {
                const resp = await axiosInstance.get('proveedores/');
                setProveedores(resp.data);
            } catch (err) {
                console.error('Error cargando proveedores:', err);
                // No bloquear el formulario si falla la carga
            }
        };
        fetchProveedores();
    }, []);

    return (
        <div className="container">
            <h1>Agregar Producto</h1>
            <hr></hr>
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}
            <div className="card">
                <div className="card-header">Complete los datos del nuevo producto</div>
                <div className="card-body">
                    <form onSubmit={onSubmit} encType="multipart/form-data">
                        <div className="form-group">
                            <label>SKU</label>
                            <input type="text" className="form-control" value={sku} onChange={(e) => setSkuProducto(e.target.value)} required />
                            <label>Nombre Producto</label>
                            <input type="text" className="form-control" value={nombre_producto} onChange={(e) => setNombreProducto(e.target.value)} required />
                            <label>Descripción</label>
                            <input type="text" className="form-control" value={descripcion} onChange={(e) => setDescripcionProducto(e.target.value)} required />
                            <label>Imagen</label>
                            <input type="file" className="form-control" accept="image/*" onChange={(e) => setImagenProducto(e.target.files[0])} />
                            <label>Precio Costo</label>
                            <input type="number" className="form-control" value={precio_costo} onChange={(e) => setPrecioCostoProducto(e.target.value)} required />
                            <label>Precio Venta</label>
                            <input type="number" className="form-control" value={precio_venta} onChange={(e) => setPrecioVentaProducto(e.target.value)} required />
                            <label>Stock Actual</label>
                            <input type="number" className="form-control" value={stock_actual} onChange={(e) => setStockActualProducto(e.target.value)} required />
                            <label>Stock Mínimo</label>
                            <input type="number" className="form-control" value={stock_minimo} onChange={(e) => setStockMinimoProducto(e.target.value)} required />
                            <label>ID Proveedor</label>
                            {proveedores.length > 0 ? (
                                <select className="form-control" value={id_proveedor} onChange={(e) => setIdProveedorProducto(e.target.value)} required>
                                    <option value="" className="">-- Seleccione proveedor --</option>
                                    {proveedores.map((p) => (
                                        <option key={p.id_proveedor} value={p.id_proveedor}>
                                            {p.nombre_proveedor} ({p.rut})
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input type="number" className="form-control" value={id_proveedor} onChange={(e) => setIdProveedorProducto(e.target.value)} required />
                            )}
                            <button type="submit" className="btn btn-primary me-2 mt-5">Crear Producto</button>
                            <button type="button" className="btn btn-secondary mt-5" onClick={volverAtras}>Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CrearProducto;
