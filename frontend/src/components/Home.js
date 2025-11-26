import React from "react";
import { useAuth } from "../context/AuthContext";

function Home() {
    const { user } = useAuth();

    return (
        <div className="container mt-5">
            <div className="p-5 mb-4 bg-light rounded-3 shadow-sm border">
                <div className="container-fluid py-3">
                    <div className="row align-items-center">
                        <div className="col-md-8">
                            {/* Saludo personalizado */}
                            <h1 className="display-5 fw-bold text-primary">
                                ¡Hola, {user ? user.username : 'Usuario'}!
                            </h1>
                            
                            <p className="col-md-10 fs-4 text-secondary">
                                Bienvenido al sistema de gestión <strong>La Esquina</strong>.
                            </p>
                            
                            {/* Mostrar el Rol del usuario */}
                            {user && (
                                <div className="mb-4">
                                    <span className="text-muted me-2">Tu perfil actual es:</span>
                                    <span className="badge bg-success fs-6">
                                        {user.rol || 'Sin Rol Asignado'}
                                    </span>
                                </div>
                            )}

                            <hr className="my-4" />
                            
                            <p>
                                Utiliza la barra de navegación superior para acceder a las secciones disponibles según tus permisos.
                            </p>
                            
                            {/* Botón opcional de acción rápida */}
                            {/* <button className="btn btn-primary btn-lg" type="button">
                                Ir al Dashboard
                            </button> 
                            */}
                        </div>
                        
                        {/* Columna para la imagen/logo */}
                        <div className="col-md-4 text-center d-none d-md-block">
                            <img 
                                src="/logo_minimarket.png" 
                                alt="Logo La Esquina" 
                                className="img-fluid"
                                style={{ maxHeight: '250px', objectFit: 'contain' }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;