import React ,{useEffect, useState} from "react";
import axiosInstance from "../utils/axiosInstance";
import { Link } from "react-router-dom";


function ListaVentas(){
    const [ventas, setVentas] = useState([]);
    useEffect(() => {
        const fetchVentas = async () => {
            try {
                const response = await axiosInstance.get('ventas/');
                setVentas(response.data);
            } catch (error) {
                console.log(error);
            }
        }; 
        fetchVentas(); 
    },[]);

    return(
        <div className="container">
            <h1>Lista de Ventas</h1>
            <hr></hr>
            <div className="mb-3">
                <a href="/caja" className="btn btn-primary">Agregar Venta</a>
            </div>
            <div className="card">
                <div className="card-header">Lista de Ventas</div>
                <div className="card-body">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Fecha</th>
                                <th>Total Venta</th>
                                <th>Usuario</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ventas.map((venta) => (
                                <tr key={venta.id_venta}>
                                    <td>{venta.id_venta}</td>
                                    <td>{venta.fecha_hora}</td>
                                    <td>{venta.total_venta}</td>
                                    <td>{venta.id_usuario.nombre_usuario}</td>
                                    {/* <td>{venta.nombre_producto}</td>
                                    <td>{producto.precio_costo}</td>
                                    <td>{producto.precio_venta}</td>
                                    <td>{producto.stock_actual}</td> */}
                                    {/* <td> <Link to={`/producto/${producto.id_producto}/delete`} className="btn btn-danger">Eliminar</Link></td>  */}
                                    {/* <td> <Link to={`/producto/${producto.id_producto}/change`} className="btn btn-warning">Actualizar</Link></td> */}
                                </tr>
                            ) ) }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
export default ListaVentas;