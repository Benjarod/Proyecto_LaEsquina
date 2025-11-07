import React, {useState, useEffect} from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";


function EliminarProducto(){
    const [producto, setProducto] = useState([]);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    let {id} = useParams();

    const cargarDatosProducto = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/productos/${id}/`)
            setProducto(response.data);
        } catch (error) {
            console.log(error)
        }
    };

    useEffect(() => {
        cargarDatosProducto();
    }, []);

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.delete(`http://localhost:8000/api/productos/${id}/`);
            navigate("/productos")
        } catch (error) {
            console.log(error)
            if (error.response) {
                setError("Se ha producido un error: " + (error.response.data?.detail || error.response.statusText));
            }
        }
    }

    return(
        <div className="container">
            <h1>Eliminar Producto</h1>
            <hr></hr>
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}
            <div className="card">
                <div className="card-header">Confirme la eliminación del producto</div>
                <div className="card-body">
                    <h1>¿Desea eliminar este producto?</h1>
                    <h2>{producto?.nombre_producto} <br/> Descripción: {producto?.descripcion}</h2>
                    <div className="mt-3">
                        <button type="submit" className="btn btn-danger me-2" onClick={onSubmit}>Eliminar producto</button>
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/productos')}>Cancelar</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default EliminarProducto;