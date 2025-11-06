import React, {useState, useEffect} from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function ActualizarUsuario () {
    const [id_usuario, setIdUsuario] = useState("");
    const [nombre_usuario, setNombreUsuario] = useState("");
    const [rol, setRol] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    let {id} = useParams();

    const cargarDatosUsuario = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/usuarios/${id}/`);
            const usuario = response.data;
            setIdUsuario(usuario.id_usuario);
            setNombreUsuario(usuario.nombre_usuario);
            setRol(usuario.rol);
            setPassword(usuario.password);
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
                nombre_usuario,
                rol,
                password,
            }
            await axios.patch(`http://localhost:8000/api/usuarios/${id}/`, usuario);
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
                            <input type="number" className="form-control" value={id_usuario} disabled />
                            <label>Nombre Usuario</label>
                            <input type="text" className="form-control" value={nombre_usuario} onChange={(e) => setNombreUsuario(e.target.value)} required />
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
                            <label>Password</label>
                            <input type="text" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            <button type="submit" className="btn btn-primary me-2">Actualizar Usuario</button>
                            <button type="button" className="btn btn-secondary" onClick={volverAtras}>Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
export default ActualizarUsuario;