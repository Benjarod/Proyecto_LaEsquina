import React ,{useEffect, useState} from "react";
import axiosInstance from "../utils/axiosInstance";
import { Link } from "react-router-dom";


function ListaProductos(){
    const [productos, setProductos] = useState([]);
    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const response = await axiosInstance.get('productos/');
                setProductos(response.data);
            } catch (error) {
                console.log(error);
            }
        }; 
        fetchProductos(); 
    },[]);

    return(
        <div className="container">
            <h1>Lista de Productos</h1>
            <hr></hr>
            <div className="mb-3">
                <a href="/producto/add" className="btn btn-primary">Agregar Producto</a>
            </div>
            <div className="card">
                <div className="card-header">Lista de Productos</div>
                <div className="card-body">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>SKU</th>
                                <th>Producto</th>
                                <th>Imagen</th>
                                <th>Precio Costo</th>
                                <th>Precio Venta</th>
                                <th>Stock Actual</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productos.map((producto) => (
                                <tr key={producto.id_producto}>
                                    <td>{producto.sku}</td>
                                    <td>{producto.nombre_producto}</td>
                                    <td>
                                        {producto.imagen ? (
                                            <img src={producto.imagen} alt= "Nada" style={{width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px",}}/>
                                            ) : (
                                                <span>Sin imagen</span>
                                            )}
                                    </td>
                                    <td>{producto.precio_costo}</td>
                                    <td>{producto.precio_venta}</td>
                                    <td>{producto.stock_actual}</td>
                                    <td> <Link to={`/producto/${producto.id_producto}/delete`} className="btn btn-danger">Eliminar</Link></td> 
                                    <td> <Link to={`/producto/${producto.id_producto}/change`} className="btn btn-warning">Actualizar</Link></td>
                                </tr>
                            ) ) }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
export default ListaProductos;