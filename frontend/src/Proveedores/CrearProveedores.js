import React, { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

function CrearProveedor() {
    const [id_proveedor, setIdProveedor] = useState("");
    const [rut, setRutProveedor] = useState("");
    const [nombre_proveedor, setNombreProveedor] = useState("");
    const [contacto, setContactoProveedor] = useState("");
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
            await axiosInstance.post('proveedores/', {
                id_proveedor,
                rut,
                nombre_proveedor,
                contacto,
            });
            navigate("/proveedores/");
        } catch (error) {
            console.error(error);
            if (error.response) {
                setError("Se ha producido un error:" || error.response.statusText);
            }
        }
    };

    return (
        <div className="container">
            <h1>Agregar Proveedor</h1>
            <hr></hr>
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}
            <div className="card">
                <div className="card-header">Complete los datos del nuevo proveedor</div>
                <div className="card-body">
                    <form onSubmit={onSubmit}>
                        <div className="form-group">
                            <label>Rut</label>
                            <input type="text" className="form-control" value={rut} onChange={(e) => setRutProveedor(e.target.value)} required />
                            <label>Nombre Proveedor</label>
                            <input type="text" className="form-control" value={nombre_proveedor} onChange={(e) => setNombreProveedor(e.target.value)} required />
                            <label>Contacto</label>
                            <input type="text" className="form-control" value={contacto} onChange={(e) => setContactoProveedor(e.target.value)} required />
                            <button type="submit" className="btn btn-primary me-2 mt-4">Crear Proveedor</button>
                            <button type="button" className="btn btn-secondary ms-2 mt-4" onClick={handleCancelarClick}>Cancelar</button>
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

export default CrearProveedor;
