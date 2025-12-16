import React, { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

function CrearUsuario() {
    const [username, setNombreUsuario] = useState("");
    const [rol, setRol] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [mostrarModalCancelar, setMostrarModalCancelar] = useState(false);

    const volverAtras = () => {
        navigate(-1);
    };

    // --- LOGICA MODAL PARA CANCELAR ---
    const handleCancelarClick = () => {
        // En lugar de salir directamente, mostramos el modal
        setMostrarModalCancelar(true);
    };

    const confirmarSalida = () => {
        // Aquí sí navegamos hacia atrás
        setMostrarModalCancelar(false);
        navigate(-1);
    };

    const cerrarModalCancelar = () => {
        setMostrarModalCancelar(false);
    };


    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('usuarios/', {
                username: username,
                rol: rol,
                password: password,
            });
            navigate("/usuario/");
        } catch (error) {
            console.error(error);
            if (error.response) {
                setError("Se ha producido un error: " + (JSON.stringify(error.response.data) || error.response.statusText));
            } else {
                setError("Se ha producido un error al conectar con el servidor.");
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
                            <label>Password</label>
                            <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <div className="mt-4">
                                <button type="submit" className="btn btn-primary me-2">Crear Usuario</button>
                                <button type="button" className="btn btn-secondary" onClick={handleCancelarClick}>Cancelar</button>
                            </div>
                        </div>
                    </form>
                    {/* MODAL DE CONFIRMACIÓN DE CANCELAR */}
                    {mostrarModalCancelar && (
                        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
                            <div className="modal-dialog modal-dialog-centered">
                                <div className="modal-content">
                                    <div className="modal-header bg-warning">
                                        <h5 className="modal-title">¿Seguro que quieres salir?</h5>
                                        <button type="button" className="btn-close" onClick={cerrarModalCancelar}></button>
                                    </div>
                                    <div className="modal-body">
                                        <p>Si sales ahora, se perderán los datos ingresados en el formulario.</p>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={cerrarModalCancelar}>
                                            No, continuar editando
                                        </button>
                                        <button type="button" className="btn btn-danger" onClick={confirmarSalida}>
                                            Sí, salir
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CrearUsuario;
