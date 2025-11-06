import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CrearProveedor() {
    const [id_proveedor, setIdProveedor] = useState("");
    const [rut, setRutProveedor] = useState("");
    const [nombre_proveedor, setNombreProveedor] = useState("");
    const [contacto, setContactoProveedor] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const volverAtras = () => {
        navigate(-1);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8000/api/proveedores/', {
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
                            <button type="submit" className="btn btn-primary me-2">Crear Proveedor</button>
                            <button type="button" className="btn btn-secondary" onClick={volverAtras}>Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CrearProveedor;
