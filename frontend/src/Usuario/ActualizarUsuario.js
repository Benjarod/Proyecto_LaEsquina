import React, {useState, useEffect} from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function ActualizarCliente () {
    const [id_cliente, setIdCliente] = useState("");
    const [edad, setEdad] = useState("");
    const [genero, setGenero] = useState("");
    const [saldo, setSaldo] = useState("");
    const [estado_actividad, setEstadoActividad] = useState("");
    const [nivel_satisfaccion, setNivelSatisfaccion] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    let {id} = useParams();

    const cargarDatosClientes = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/clientes/${id_cliente}`);
            const cliente = response.data[0];
            setIdCliente(cliente.id_cliente);
            setEdad(cliente.edad);
            setGenero(cliente.genero);
            setSaldo(cliente.saldo);
            setEstadoActividad(cliente.estado_actividad);
            setNivelSatisfaccion(cliente.nivel_satisfaccion);
        } catch (error) {
            console.log(error)
        }
    };

    const volverAtras = () => {
        navigate(-1);
    };

    useEffect(() => {
        cargarDatosClientes();
    },[]);

    

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const cliente = {
                edad,
                genero,
                saldo,
                estado_actividad,
                nivel_satisfaccion
            }
            await axios.patch(`http://localhost:8000/api/clientes/${id_cliente}`,cliente);
            navigate("/clientes")
        } catch (error) {
            console.log(error)
            if (error.response) {
                setError("Se ha producido un error:" || error.response.statusText);
            }
        }
    }

    return(
        <div className="container">
            <h1>Actualizar Cliente</h1>
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
                            <label>Id_Cliente</label>
                            <input type="number" className="form-control" value={id_cliente} disabled />
                            <label>Edad</label>
                            <input type="number" className="form-control" value={edad} onChange={(e) => setEdad(e.target.value)} />
                            <label>Genero</label>
                            <input type="text" className="form-control" value={genero} onChange={(e) => setGenero(e.target.value)} />
                            <label>Saldo</label>
                            <input type="number" className="form-control" value={saldo} onChange={(e) => setSaldo(e.target.value)} />
                            <label>Estado actividad</label>
                            <input type="number" className="form-control" value={estado_actividad} onChange={(e) => setEstadoActividad(e.target.value)} />
                            <label>Nivel de satisfaccion</label>
                            <input type="number" className="form-control" value={nivel_satisfaccion} onChange={(e) => setNivelSatisfaccion(e.target.value)} />
                            <button type="submit" className="btn btn-primary">Actualizar Cliente</button>
                            <button type="button" className="btn btn-secondary" onClick={volverAtras}>Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
export default ActualizarCliente;