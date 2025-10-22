import React, {useState, useEffect} from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";


function EliminarUsuario(){
    const [usuario, setUsuario] = useState([]);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    let {id} = useParams();

    const cargarDatosUsuario = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/usuarios/${id}/`)
            setUsuario(response.data);
        } catch (error) {
            console.log(error)
        }
    };

    useEffect(() => {
        cargarDatosUsuario();
    }, []);

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.delete(`http://localhost:8000/api/usuarios/${id}/`);
            navigate("/usuario")
        } catch (error) {
            console.log(error)
            if (error.response) {
                setError("Se ha producido un error: " + (error.response.data?.detail || error.response.statusText));
            }
        }
    }

    return(
        <div className="container">
            <h1>Eliminar Usuario</h1>
            <hr></hr>
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}
            <div className="card">
                <div className="card-header">Confirme la eliminación del usuario</div>
                <div className="card-body">
                    <h1>¿Desea eliminar a este usuario?</h1>
                    <h2>{usuario?.nombre_usuario} (ID: {usuario?.id_usuario})</h2>
                    <div className="mt-3">
                        <button type="submit" className="btn btn-danger me-2" onClick={onSubmit}>Eliminar usuario</button>
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/usuario')}>Cancelar</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default EliminarUsuario;