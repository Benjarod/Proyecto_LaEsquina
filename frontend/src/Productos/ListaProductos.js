import React ,{useEffect, useState} from "react";
import axiosInstance from "../utils/axiosInstance";
import { Link } from "react-router-dom";


function ListaProductos(){
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const Default_Image = "https://via.placeholder.com/300x200?text=Sin+Imagen";
    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const response = await axiosInstance.get('productos/');
                setProductos(response.data);
            } catch (error) {
                console.error('Error al obtener los productos:', error);
            } finally {
                setLoading(false);
            }
        }; 
        fetchProductos(); 
    },[]);

    const handleDelete = async (id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
            try {
                await axiosInstance.delete(`productos/${id}/`);
                setProductos(productos.filter((prod) => prod.id_producto !== id));
            } catch (error) {
                console.error("Error al eliminar:", error);
                alert("No se pudo eliminar el producto.");
            }
        }
    };

    // Formatear precio a CLP
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
    };

    if (loading) return <div className="text-center mt-5">Cargando productos...</div>;

   return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Catálogo de Productos</h1>
                <Link to="/producto/add" className="btn btn-primary">
                    <i className="bi bi-plus-lg"></i> Agregar Producto
                </Link>
            </div>
            <hr />

            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                {productos.map((producto) => (
                    <div className="col" key={producto.id_producto}>
                        <div className="card h-100 shadow-sm border-0">
                            {/* --- IMAGEN DEL PRODUCTO --- */}
                            <div style={{ height: "200px", overflow: "hidden" }} className="d-flex align-items-center justify-content-center rounded-top">
                                <img
                                    src={producto.imagen || "/logo_minimarket.png"}
                                    className="card-img-top p-3"
                                    alt={producto.nombre_producto}
                                    style={{ 
                                        maxHeight: "100%", 
                                        maxWidth: "100%", 
                                        objectFit: "contain" // Esto evita que la imagen se estire feo
                                    }}
                                />
                            </div>

                            {/* --- INFORMACIÓN --- */}
                            <div className="card-body d-flex flex-column">
                                <h5 className="card-title text-truncate" title={producto.nombre_producto}>
                                    {producto.nombre_producto}
                                </h5>
                                <h6 className="card-subtitle mb-2 text-muted">SKU: {producto.sku}</h6>
                                
                                <div className="mt-auto">
                                    <h4 className="text-primary fw-bold my-2">
                                        {formatCurrency(producto.precio_venta)}
                                    </h4>
                                    
                                    {/* Indicador de Stock */}
                                    <div className="d-flex justify-content-between align-items-center">
                                        <small className="text-muted">Stock:</small>
                                        <span className={`badge ${producto.stock_actual <= producto.stock_minimo ? 'bg-danger' : 'bg-success'}`}>
                                            {producto.stock_actual} un.
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* --- ACCIONES --- */}
                            <div className="card-footer bg-white border-top-0 d-flex justify-content-between pb-3">
                                <Link 
                                    to={`/producto/${producto.id_producto}/change`} 
                                    className="btn btn-outline-primary btn-sm flex-grow-1 me-2"
                                >
                                    <i className="bi bi-pencil"></i> Editar
                                </Link>
                                <button 
                                    onClick={() => handleDelete(producto.id_producto)} 
                                    className="btn btn-outline-danger btn-sm"
                                >
                                    <i className="bi bi-trash"></i> Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {productos.length === 0 && (
                <div className="alert alert-info text-center mt-4">
                    No hay productos registrados. ¡Agrega uno nuevo!
                </div>
            )}
        </div>
    );
}
export default ListaProductos;