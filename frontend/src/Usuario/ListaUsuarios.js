import React ,{useEffect, useState} from "react";
import axios from "axios"
import { Link } from "react-router-dom";


function ListaUsuarios(){
    const [usuarios, setUsuarios] = useState([]);
    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/usuarios/');
                setUsuarios(response.data);
            } catch (error) {
                console.log(error);
            }
        }; 
        fetchUsuarios(); 
    },[]);

    return(
        <div className="container">
            <h1>Lista de Usuarios</h1>
            <hr></hr>
            <div className="mb-3">
                <a href="/usuarios/add" className="btn btn-primary">Agregar Usuario</a>
            </div>
            <div className="card">
                <div className="card-header">Lista de Usuarios</div>
                <div className="card-body">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Id Usuario</th>
                                <th>Nombre Usuario</th>
                                <th>Rol</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map((usuario) => (
                                <tr key={usuario.id_usuario}>
                                    <td>{usuario.id_usuario}</td>
                                    <td>{usuario.nombre_usuario}</td>
                                    <td>{usuario.rol}</td>
                                    <td> <Link to={`/usuario/${usuario.id_usuario}/delete`} className="btn btn-danger">Eliminar</Link></td> 
                                    <td> <Link to={`/usuario/actualizar/${usuario.id_usuario}`} className="btn btn-warning">Actualizar</Link></td>
                                </tr>
                            ) ) }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
export default ListaUsuarios;