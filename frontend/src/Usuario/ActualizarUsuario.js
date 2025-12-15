import React, {useState, useEffect} from "react";
import axiosInstance from "../utils/axiosInstance";
import { useParams, useNavigate } from "react-router-dom";

function ActualizarUsuario () {
    const [id_usuario, setIdUsuario] = useState("");
    const [username, setNombreUsuario] = useState("");
    const [rol, setRol] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    let {id} = useParams();

    const cargarDatosUsuario = async () => {
        try {
            const response = await axiosInstance.get(`usuarios/${id}/`);
            const usuario = response.data;
            setIdUsuario(usuario.id);
            setNombreUsuario(usuario.username);
            setRol(usuario.rol);
        } catch (error) {
            console.error("Error al cargar usuario:", error);
            setError("Error al cargar los datos del usuario");
        }
    };

    const volverAtras = () => {
        navigate(-1);
    };

    useEffect(() => {
        cargarDatosUsuario();
    },[]);

    

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const usuario = {   
                username,
                rol,
            }
            if (password) {
                usuario.password = password;
            }
            await axiosInstance.patch(`http://localhost:8000/api/usuarios/${id}/`, usuario);
            navigate("/usuario/");
        } catch (error) {
            console.error("Error al actualizar:", error);
            if (error.response?.data) {
                setError("Error: " + JSON.stringify(error.response.data));
            } else {
                setError("Error al actualizar el usuario");
            }
        }
    }

    return(
        <div className="container">
            <h1>Actualizar Usuario</h1>
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
                            <label>Id_Usuario</label>
                            <input type="number" className="form-control" value={id} disabled />
                            <label>Nombre Usuario</label>
                            <input type="text" className="form-control" value={username} onChange={(e) => setNombreUsuario(e.target.value)} required />
                            <label>Rol</label>
                            <select
                                className="form-control"
                                value={rol}
                                onChange={(e) => setRol(e.target.value)}
                                required
                            >
                                <option value="">-- Seleccione rol --</option>
                                <option value="Admin">Administrador</option>
                                <option value="Bodeguero">Bodeguero</option>
                                <option value="Cajero">Cajero</option>
                            </select>
                            <label>Nueva Contraseña</label>
                            <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Dejar en blanco para no cambiar" />
                            <div className="mt-4">
                                <button type="submit" className="btn btn-primary me-2">Actualizar Usuario</button>
                                <button type="button" className="btn btn-secondary" onClick={volverAtras}>Cancelar</button>
                            </div>
                            
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
export default ActualizarUsuario;