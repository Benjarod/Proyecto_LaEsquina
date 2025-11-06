import React ,{useEffect, useState} from "react";
import axios from "axios"
import { Link } from "react-router-dom";


function ListaProveedores(){
    const [proveedores, setProveedores] = useState([]);
    useEffect(() => {
        const fetchProveedores = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/proveedores/');
                setProveedores(response.data);
            } catch (error) {
                console.log(error);
            }
        }; 
        fetchProveedores(); 
    },[]);

    return(
        <div className="container">
            <h1>Lista de Proveedores</h1>
            <hr></hr>
            <div className="mb-3">
                <a href="/proveedor/add" className="btn btn-primary">Agregar Proveedor</a>
            </div>
            <div className="card">
                <div className="card-header">Lista de Proveedores</div>
                <div className="card-body">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Rut Proveedor</th>
                                <th>Nombre Proveedor</th>
                                <th>Contacto</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proveedores.map((proveedor) => (
                                <tr key={proveedor.id_proveedor}>
                                    <td>{proveedor.rut}</td>
                                    <td>{proveedor.nombre_proveedor}</td>
                                    <td>{proveedor.contacto}</td>
                                    <td> <Link to={`/proveedor/${proveedor.id_proveedor}/delete`} className="btn btn-danger">Eliminar</Link></td> 
                                    <td> <Link to={`/proveedor/${proveedor.id_proveedor}/change`} className="btn btn-warning">Actualizar</Link></td>
                                </tr>
                            ) ) }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
export default ListaProveedores;