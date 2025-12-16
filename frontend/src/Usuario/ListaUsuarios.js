import React ,{useEffect, useState} from "react";
import axiosInstance from "../utils/axiosInstance";
import { Link } from "react-router-dom";


function ListaUsuarios(){
    const [usuarios, setUsuarios] = useState([]);
    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const response = await axiosInstance.get('usuarios/');
                setUsuarios(response.data);
            } catch (error) {
                console.log(error);
            }
        }; 
        fetchUsuarios(); 
    },[]);

    const handleDelete = async (id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
            try {
                await axiosInstance.delete(`usuarios/${id}/`);
                setUsuarios(usuarios.filter((usua) => usua.id !== id));
            } catch (error) {
                console.error("Error al eliminar:", error);
                alert("No se pudo eliminar el usuario.");
            }
        }
    };

    return(
        <div className="container">
            <h1>Lista de Usuarios</h1>
            <hr></hr>
            <div className="mb-3">
                <a href="/usuarios/add" className="btn btn-primary">Agregar Usuario</a>
            </div>
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                            {usuarios.map((usuario) => (
                                <div className="col" key={usuario.id}>
                                    <div className="card h-100 shadow-sm border-0">
                                        {/* --- ICONO USUARIO --- */}
                                        <div style={{ height: "150px", overflow: "hidden" }} className="d-flex align-items-center justify-content-center rounded-top">
                                            <i className="fas fa-user fa-4x text-muted" aria-hidden="true"></i>
                                        </div>
            
                                        {/* --- INFORMACIÓN --- */}
                                        <div className="card-body d-flex flex-column">
                                            <h5 className="card-title text-truncate" title={usuario.username}>
                                                {usuario.username}
                                            </h5>
                                            <h6 className="card-subtitle mb-2 text-muted">Rol: {usuario.rol}</h6>
                                        </div>
            
                                        {/* --- ACCIONES --- */}
                                        <div className="card-footer bg-white border-top-0 d-flex justify-content-between pb-3">
                                            <Link 
                                                to={`/usuario/${usuario.id}/change`} 
                                                className="btn btn-outline-primary btn-sm flex-grow-1 me-2"
                                            >
                                                <i className="bi bi-pencil"></i> Editar
                                            </Link>
                                            <button 
                                                onClick={() => handleDelete(usuario.id)} 
                                                className="btn btn-outline-danger btn-sm"
                                            >
                                                <i className="bi bi-trash"></i> Eliminar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
        </div>
    )
}
export default ListaUsuarios;