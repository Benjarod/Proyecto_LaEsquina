import React from "react";
import { useAuth } from "../context/AuthContext";

function TopBar(){
    const { user, logoutUser } = useAuth(); // Obtener usuario y función de logout

    const ROLES = {
      Admin: 'Admin',
      Bodeguero: 'Bodeguero',
      Cajero: 'Cajero'
    }

    return(
        <>
            <nav className="navbar nav-underline navbar-expand-lg bg-body-tertiary">
                <div className="container-fluid">
                    <a className="navbar-brand mb-2" href="/" >
                        <img src="/logo_minimarket.png" alt="Logo" width="40" height="40" className="d-inline-block align-text-top"/>
                    </a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav me-auto">
                            {/* --- Links de Admin --- */}
                            {(user.rol === ROLES.Admin) && (
                                <>
                                    <li className="nav-item">
                                        <a className="nav-link" href="/usuario">Usuarios</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" href="/proveedores">Proveedores</a>
                                    </li>
                                </>
                            )}
                            
                            {/* --- Links de Admin y Bodeguero --- */}
                            {(user.rol === ROLES.Admin || user.rol === ROLES.Bodeguero) && (
                                <li className="nav-item">
                                    <a className="nav-link" href="/productos">Productos</a>
                                </li>
                            )}

                            {/* --- Links de Admin y Cajero --- */}
                            {(user.rol === ROLES.Admin || user.rol === ROLES.Cajero) && (
                                <>
                                    <li className="nav-item">
                                        <a className="nav-link" href="/ventas">Ventas</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" href="/caja">Caja</a>
                                    </li>
                                </>
                            )}
                        </ul>
                        
                        {/* --- Info de Usuario y Logout --- */}
                        <ul className="navbar-nav">
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    {user.username} ({user.rol})
                                </a>
                                <ul className="dropdown-menu dropdown-menu-end">
                                    <li>
                                        <button className="dropdown-item" onClick={logoutUser}>
                                            Cerrar Sesión
                                        </button>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    )
}
export default TopBar;