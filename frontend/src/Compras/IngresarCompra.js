import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

function IngresarCompra() {
    const [proveedores, setProveedores] = useState([]);
    const [productos, setProductos] = useState([]);
    
    // Inputs del formulario de Compra principal
    const [productoSeleccionado, setProductoSeleccionado] = useState(''); 
    const [cantidad, setCantidad] = useState(1);
    const [costoUnitario, setCostoUnitario] = useState(0);
    
    // Carrito de ingreso
    const [carrito, setCarrito] = useState([]);
    
    // --- ESTADOS PARA MODAL DE PRODUCTO NUEVO ---
    const [showModal, setShowModal] = useState(false);
    const [nuevoProd, setNuevoProd] = useState({
        sku: '',
        nombre_producto: '',
        descripcion: '',
        precio_costo: '',
        precio_venta: '',
        stock_minimo: '',
        id_proveedor: ''
    });

    // --- ESTADOS PARA MODAL DE PROVEEDOR NUEVO (El "Nieto") ---
    const [showModalProv, setShowModalProv] = useState(false);
    const [nuevoProv, setNuevoProv] = useState({
        nombre_proveedor: '',
        rut: '',
        contacto: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [provRes, prodRes] = await Promise.all([
                axiosInstance.get('proveedores/'),
                axiosInstance.get('productos/')
            ]);
            setProveedores(provRes.data);
            setProductos(prodRes.data);
        } catch (error) {
            console.error("Error cargando datos:", error);
        }
    };

    // Al elegir producto existente, sugerir precio
    useEffect(() => {
        if (productoSeleccionado) {
            const prod = productos.find(p => p.id_producto == productoSeleccionado);
            if (prod) setCostoUnitario(prod.precio_costo);
        }
    }, [productoSeleccionado]);

    // --- LÓGICA DEL CARRITO ---
    const agregarAlCarrito = () => {
        if (!productoSeleccionado || cantidad <= 0 || costoUnitario < 0) return;

        const prodObj = productos.find(p => p.id_producto == productoSeleccionado);
        
        const provObj = proveedores.find(p => p.id_proveedor === prodObj.id_proveedor);
        const nombreProveedor = provObj ? provObj.nombre_proveedor : 'Desconocido';

        const nuevoItem = {
            id_producto: prodObj.id_producto,
            nombre: prodObj.nombre_producto,
            sku: prodObj.sku,
            proveedor: nombreProveedor,
            cantidad: parseInt(cantidad),
            costo_unitario: parseFloat(costoUnitario),
            subtotal: parseInt(cantidad) * parseFloat(costoUnitario)
        };

        setCarrito([...carrito, nuevoItem]);
        setCantidad(1);
        setProductoSeleccionado('');
        setCostoUnitario(0);
    };

    const eliminarDelCarrito = (index) => {
        const nuevoCarrito = [...carrito];
        nuevoCarrito.splice(index, 1);
        setCarrito(nuevoCarrito);
    };

    const confirmarCompra = async () => {
        if (carrito.length === 0) {
            alert("Agregue productos a la lista antes de confirmar.");
            return;
        }

        try {
            const payload = { items: carrito };
            const response = await axiosInstance.post('compras/procesar_compra/', payload);
            alert(response.data.message); 
            navigate('/compras'); 
        } catch (error) {
            console.error("Error al procesar:", error);
            alert("Ocurrió un error al registrar el ingreso.");
        }
    };

    // --- LÓGICA DE PRODUCTO NUEVO (MODAL 1) ---
    const handleNuevoProdChange = (e) => {
        setNuevoProd({ ...nuevoProd, [e.target.name]: e.target.value });
    };

    const guardarProductoRapido = async () => {
        if (!nuevoProd.sku || !nuevoProd.nombre_producto || !nuevoProd.id_proveedor || !nuevoProd.precio_costo) {
            alert("Por favor complete SKU, Nombre, Proveedor y Precio Costo.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("sku", nuevoProd.sku);
            formData.append("nombre_producto", nuevoProd.nombre_producto);
            formData.append("descripcion", nuevoProd.descripcion || "Sin descripción");
            formData.append("precio_costo", nuevoProd.precio_costo);
            formData.append("precio_venta", nuevoProd.precio_venta || 0);
            formData.append("stock_actual", 0); 
            formData.append("stock_minimo", nuevoProd.stock_minimo || 5);
            formData.append("id_proveedor", nuevoProd.id_proveedor);

            const response = await axiosInstance.post('productos/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            const prodCreado = response.data;

            setProductos([...productos, prodCreado]);
            setProductoSeleccionado(prodCreado.id_producto);
            setCostoUnitario(prodCreado.precio_costo);

            setShowModal(false);
            setNuevoProd({ sku: '', nombre_producto: '', descripcion: '', precio_costo: '', precio_venta: '', stock_minimo: '', id_proveedor: '' });
            alert("Producto creado y seleccionado.");

        } catch (error) {
            console.error("Error creando producto:", error);
            alert("Error al crear el producto.");
        }
    };

    // --- LÓGICA DE PROVEEDOR NUEVO (MODAL 2) ---
    const handleNuevoProvChange = (e) => {
        setNuevoProv({ ...nuevoProv, [e.target.name]: e.target.value });
    };

    const guardarProveedorRapido = async () => {
        if (!nuevoProv.nombre_proveedor || !nuevoProv.rut) {
            alert("Nombre y RUT son obligatorios.");
            return;
        }
        try {
            const response = await axiosInstance.post('proveedores/', nuevoProv);
            const provCreado = response.data;
            
            // 1. Agregarlo a la lista
            setProveedores([...proveedores, provCreado]);

            // 2. Seleccionarlo automáticamente en el modal de PRODUCTO (que está abierto abajo)
            setNuevoProd({ ...nuevoProd, id_proveedor: provCreado.id_proveedor });

            // 3. Cerrar modal de proveedor
            setShowModalProv(false);
            setNuevoProv({ nombre_proveedor: '', rut: '', contacto: '' });

        } catch (error) {
            console.error(error);
            alert("Error al crear proveedor.");
        }
    };

    const totalGeneral = carrito.reduce((acc, item) => acc + item.subtotal, 0);

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Ingreso Masivo de Mercadería</h2>
            
            <div className="card mb-4 shadow-sm border-0 bg-light">
                <div className="card-body">
                    <div className="row align-items-end g-3">
                        {/* SELECTOR DE PRODUCTOS CON BOTÓN NUEVO */}
                        <div className="col-md-5">
                            <label className="form-label fw-bold">Buscar Producto</label>
                            <div className="input-group">
                                <select 
                                    className="form-select"
                                    value={productoSeleccionado}
                                    onChange={(e) => setProductoSeleccionado(e.target.value)}
                                >
                                    <option value="">-- Seleccione --</option>
                                    {productos.map(p => (
                                        <option key={p.id_producto} value={p.id_producto}>
                                            {p.sku} - {p.nombre_producto}
                                        </option>
                                    ))}
                                </select>
                                <button 
                                    className="btn btn-success"
                                    title="Crear Nuevo Producto"
                                    onClick={() => setShowModal(true)}
                                >
                                    <i className="bi bi-plus-lg"></i> Nuevo
                                </button>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <label className="form-label fw-bold">Costo Unit.</label>
                            <div className="input-group">
                                <span className="input-group-text">$</span>
                                <input 
                                    type="number" 
                                    className="form-control"
                                    value={costoUnitario}
                                    onChange={(e) => setCostoUnitario(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-bold">Cantidad</label>
                            <input 
                                type="number" 
                                className="form-control"
                                value={cantidad}
                                onChange={(e) => setCantidad(e.target.value)}
                            />
                        </div>
                        <div className="col-md-2">
                            <button className="btn btn-primary w-100" onClick={agregarAlCarrito}>
                                <i className="bi bi-plus-circle"></i> Agregar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* TABLA CARRITO */}
            <div className="card shadow-sm">
                <div className="card-header bg-white py-3">
                    <h5 className="m-0">📦 Lista de Ingreso</h5>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Producto</th>
                                <th>Proveedor</th>
                                <th className="text-center">Cant.</th>
                                <th className="text-end">Costo</th>
                                <th className="text-end">Subtotal</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {carrito.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <div className="fw-bold">{item.nombre}</div>
                                        <small className="text-muted">{item.sku}</small>
                                    </td>
                                    <td><span className="badge bg-info text-dark">{item.proveedor}</span></td>
                                    <td className="text-center">{item.cantidad}</td>
                                    <td className="text-end">${item.costo_unitario.toLocaleString()}</td>
                                    <td className="text-end fw-bold">${item.subtotal.toLocaleString()}</td>
                                    <td className="text-end">
                                        <button 
                                            className="btn btn-outline-danger btn-sm border-0"
                                            onClick={() => eliminarDelCarrito(index)}
                                        >
                                            <i className="bi bi-x-lg"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {carrito.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-muted">
                                        La lista está vacía. Agregue productos arriba.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="card-footer bg-white d-flex justify-content-between align-items-center py-3">
                    <h3 className="text-success m-0">Total: ${totalGeneral.toLocaleString()}</h3>
                    <button 
                        className="btn btn-success btn-lg px-5" 
                        onClick={confirmarCompra}
                        disabled={carrito.length === 0}
                    >
                        Confirmar Ingreso
                    </button>
                </div>
            </div>

            {/* --- MODAL 1: REGISTRAR PRODUCTO --- */}
            {showModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header bg-success text-white">
                                <h5 className="modal-title">Registrar Nuevo Producto</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">SKU (Código Barra)</label>
                                        <input type="text" name="sku" className="form-control" value={nuevoProd.sku} onChange={handleNuevoProdChange} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Nombre Producto</label>
                                        <input type="text" name="nombre_producto" className="form-control" value={nuevoProd.nombre_producto} onChange={handleNuevoProdChange} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Precio Costo</label>
                                        <input type="number" name="precio_costo" className="form-control" value={nuevoProd.precio_costo} onChange={handleNuevoProdChange} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Precio Venta</label>
                                        <input type="number" name="precio_venta" className="form-control" value={nuevoProd.precio_venta} onChange={handleNuevoProdChange} />
                                    </div>
                                    
                                    {/* SELECTOR DE PROVEEDOR CON BOTÓN + */}
                                    <div className="col-md-6">
                                        <label className="form-label">Proveedor</label>
                                        <div className="input-group">
                                            <select name="id_proveedor" className="form-select" value={nuevoProd.id_proveedor} onChange={handleNuevoProdChange}>
                                                <option value="">-- Seleccione --</option>
                                                {proveedores.map(p => (
                                                    <option key={p.id_proveedor} value={p.id_proveedor}>
                                                        {p.nombre_proveedor}
                                                    </option>
                                                ))}
                                            </select>
                                            <button 
                                                className="btn btn-outline-secondary" 
                                                type="button"
                                                onClick={() => setShowModalProv(true)} // ABRE EL SEGUNDO MODAL
                                            >
                                                <i className="bi bi-plus-lg"></i>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Stock Mínimo</label>
                                        <input type="number" name="stock_minimo" className="form-control" value={nuevoProd.stock_minimo} onChange={handleNuevoProdChange} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">Descripción</label>
                                        <textarea name="descripcion" className="form-control" rows="2" value={nuevoProd.descripcion} onChange={handleNuevoProdChange}></textarea>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="button" className="btn btn-success" onClick={guardarProductoRapido}>Guardar Producto</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL 2: REGISTRAR PROVEEDOR (ENCIMA DEL OTRO) --- */}
            {showModalProv && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content shadow-lg">
                            <div className="modal-header bg-dark text-white">
                                <h5 className="modal-title">Nuevo Proveedor</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModalProv(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Nombre proveedor *</label>
                                    <input type="text" name="nombre_proveedor" className="form-control" value={nuevoProv.nombre_proveedor} onChange={handleNuevoProvChange} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">RUT</label>
                                    <input type="text" name="rut" className="form-control" value={nuevoProv.rut} onChange={handleNuevoProvChange} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Contacto</label>
                                    <input type="text" name="contacto" className="form-control" value={nuevoProv.contacto} onChange={handleNuevoProvChange} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModalProv(false)}>Cancelar</button>
                                <button type="button" className="btn btn-primary" onClick={guardarProveedorRapido}>Guardar y Usar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default IngresarCompra;