import React, {useState, useEffect} from "react";
import axiosInstance from "../utils/axiosInstance";
import { useParams, useNavigate } from "react-router-dom";

function ActualizarProducto () {
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
    let {id} = useParams();

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
            // producto.id_proveedor puede venir como id (number) o como objeto { id_proveedor: .. }
            if (producto.id_proveedor && typeof producto.id_proveedor === 'object') {
                setIdProveedorProducto(producto.id_proveedor.id_proveedor || producto.id_proveedor.id || "");
            } else {
                setIdProveedorProducto(producto.id_proveedor || "");
            }
            
        } catch (error) {
            console.error("Error al cargar producto:", error);
            setError("Error al cargar los datos del producto");
        }
    };

    const volverAtras = () => {
        navigate(-1);
    };

    useEffect(() => {
        cargarDatosProductos();
    },[]);

    // Cargar proveedores para mostrar en el select y mostrar el nombre del proveedor asignado
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

    

    // Actualizar producto
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

        if (imagen instanceof File) {
        formData.append("imagen", imagen);
      }

        await axiosInstance.patch(`productos/${id}/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        navigate("/productos/");
      } catch (error) {
        console.error("Error al actualizar:", error);
        setError(
          error.response?.data
            ? "Error: " + JSON.stringify(error.response.data)
            : "Error al actualizar el producto"
        );
      }
    };


    return(
        <div className="container">
            <h1>Actualizar Producto</h1>
            <hr></hr>
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}
            <div className="card">
                <div className="card-header">Complete los datos para actulizar</div>
                <div className="card-body">
                <form onSubmit={onSubmit}>
                        <div className="form-group">
                            <label>ID Producto</label>
                            <input type="number" className="form-control" value={id_producto} disabled />
                            <label>SKU</label>
                            <input type="text" className="form-control" value={sku} onChange={(e) => setSkuProducto(e.target.value)} required />
                            <label>Nombre Producto</label>
                            <input type="text" className="form-control" value={nombre_producto} onChange={(e) => setNombreProducto(e.target.value)} required />
                            <label>Descripción</label>
                            <input type="text" className="form-control" value={descripcion} onChange={(e) => setDescripcionProducto(e.target.value)} required />
                            <label>Precio Costo</label>
                            <input type="number" className="form-control" value={precio_costo} onChange={(e) => setPrecioCostoProducto(e.target.value)} required />
                            <label>Precio Venta</label>
                            <input type="number" className="form-control" value={precio_venta} onChange={(e) => setPrecioVentaProducto(e.target.value)} required />
                            <label>Stock Actual</label>
                            <input type="number" className="form-control" value={stock_actual} onChange={(e) => setStockActualProducto(e.target.value)} required />
                            <label>Stock Mínimo</label>
                            <input type="number" className="form-control" value={stock_minimo} onChange={(e) => setStockMinimoProducto(e.target.value)} required />
                            <label>Proveedor</label>
                            {proveedores.length > 0 ? (
                                <select className="form-control" value={id_proveedor} onChange={(e) => setIdProveedorProducto(e.target.value)} required>
                                    <option value="">-- Seleccione proveedor --</option>
                                    {proveedores.map((p) => (
                                        <option key={p.id_proveedor} value={p.id_proveedor}>
                                            {p.nombre_proveedor} ({p.rut})
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input type="number" className="form-control" value={id_proveedor} onChange={(e) => setIdProveedorProducto(e.target.value)} required />
                            )}
                            <label className="mt-3">Imagen</label>
                            {/* Mostrar imagen actual si existe */}
                            {imagen && !(imagen instanceof File) && (
                            <div className="mb-2">
                                <img
                                    src={imagen}
                                    alt=""
                                    style={{
                                        width: "120px",
                                        height: "120px",
                                        objectFit: "cover",
                                        borderRadius: "8px",
                                    }}
                                />
                            </div>
                            )}
                            <input
                                type="file"
                                className="form-control"
                                accept="image/*"
                                onChange={(e) => setImagenProducto(e.target.files[0])}
                            />
                            <button type="submit" className="btn btn-primary me-2">Actualizar Producto</button>
                            <button type="button" className="btn btn-secondary" onClick={volverAtras}>Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
export default ActualizarProducto;