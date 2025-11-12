import React, {useState, useEffect} from "react";
import axiosInstance from "../utils/axiosInstance";
import { useParams, useNavigate } from "react-router-dom";


function EliminarProveedor(){
    const [proveedor, setProveedor] = useState([]);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    let {id} = useParams();

    const cargarDatosProveedor = async () => {
        try {
            const response = await axiosInstance.get(`proveedores/${id}/`)
            setProveedor(response.data);
        } catch (error) {
            console.log(error)
        }
    };

    useEffect(() => {
        cargarDatosProveedor();
    }, []);

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.delete(`proveedores/${id}/`);
            navigate("/proveedores")
        } catch (error) {
            console.log(error)
            if (error.response) {
                setError("Se ha producido un error: " + (error.response.data?.detail || error.response.statusText));
            }
        }
    }

    return(
        <div className="container">
            <h1>Eliminar Proveedor</h1>
            <hr></hr>
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}
            <div className="card">
                <div className="card-header">Confirme la eliminación del proveedor</div>
                <div className="card-body">
                    <h1>¿Desea eliminar a este proveedor?</h1>
                    <h2>{proveedor?.nombre_proveedor} <br/> ID: {proveedor?.id_proveedor}</h2>
                    <div className="mt-3">
                        <button type="submit" className="btn btn-danger me-2" onClick={onSubmit}>Eliminar proveedor</button>
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/proveedores')}>Cancelar</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default EliminarProveedor;