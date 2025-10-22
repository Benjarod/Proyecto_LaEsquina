import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CrearUsuario() {
    const [id_usuario, setIdUsuario] = useState("");
    const [nombre_usuario, setNombreUsuario] = useState("");
    const [rol, setRol] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const volverAtras = () => {
        navigate(-1);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8000/api/usuarios/', {
                id_usuario,
                nombre_usuario,
                rol,
                password
            });
            navigate("/usuario/");
        } catch (error) {
            console.error(error);
            if (error.response) {
                setError("Se ha producido un error:" || error.response.statusText);
            }
        }
    };

    return (
        <div className="container">
            <h1>Agregar Usuario</h1>
            <hr></hr>
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}
            <div className="card">
                <div className="card-header">Complete los datos del nuevo usuario</div>
                <div className="card-body">
                    <form onSubmit={onSubmit}>
                        <div className="form-group">
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
                            <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            <button type="submit" className="btn btn-primary me-2">Crear Usuario</button>
                            <button type="button" className="btn btn-secondary" onClick={volverAtras}>Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CrearUsuario;
