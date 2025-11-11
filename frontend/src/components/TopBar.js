import React from "react";
function TopBar(){
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
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <a className="nav-link" href="/usuario">Usuarios</a>
                            </li>
                        </ul>
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <a className="nav-link" href="/proveedores">Proveedores</a>
                            </li>
                        </ul>
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <a className="nav-link" href="/productos">Productos</a>
                            </li>
                        </ul>
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <a className="nav-link" href="/ventas">Ventas</a>
                            </li>
                        </ul>
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <a className="nav-link" href="/caja">Caja</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    )
}
export default TopBar;