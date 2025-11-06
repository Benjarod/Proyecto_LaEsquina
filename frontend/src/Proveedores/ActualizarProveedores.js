import React, {useState, useEffect} from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function ActualizarProveedor () {
    const [id_proveedor, setIdProveedor] = useState("");
    const [rut, setRutProveedor] = useState("");
    const [nombre_proveedor, setNombreProveedor] = useState("");
    const [contacto, setContactoProveedor] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    let {id} = useParams();

    const cargarDatosProveedor = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/proveedores/${id}/`);
            const proveedor = response.data;
            setIdProveedor(proveedor.id_proveedor);
            setRutProveedor(proveedor.rut);
            setNombreProveedor(proveedor.nombre_proveedor);
            setContactoProveedor(proveedor.contacto);
        } catch (error) {
            console.error("Error al cargar proveedor:", error);
            setError("Error al cargar los datos del proveedor");
        }
    };

    const volverAtras = () => {
        navigate(-1);
    };

    useEffect(() => {
        cargarDatosProveedor();
    },[]);

    

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const proveedor = {
                rut,
                nombre_proveedor,
                contacto,
            }
            await axios.patch(`http://localhost:8000/api/proveedores/${id}/`, proveedor);
            navigate("/proveedores/");
        } catch (error) {
            console.error("Error al actualizar:", error);
            if (error.response?.data) {
                setError("Error: " + JSON.stringify(error.response.data));
            } else {
                setError("Error al actualizar el proveedor");
            }
        }
    }

    return(
        <div className="container">
            <h1>Actualizar Proveedor</h1>
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
                            <label>ID Proveedor</label>
                            <input type="number" className="form-control" value={id_proveedor} disabled />
                            <label>Rut Proveedor</label>
                            <input type="text" className="form-control" value={rut} onChange={(e) => setRutProveedor(e.target.value)} required />
                            <label>Nombre Proveedor</label>
                            <input type="text" className="form-control" value={nombre_proveedor} onChange={(e) => setNombreProveedor(e.target.value)} required />
                            <label>Contacto</label>
                            <input type="text" className="form-control" value={contacto} onChange={(e) => setContactoProveedor(e.target.value)} required />
                            <button type="submit" className="btn btn-primary me-2">Actualizar Proveedor</button>
                            <button type="button" className="btn btn-secondary" onClick={volverAtras}>Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
export default ActualizarProveedor;