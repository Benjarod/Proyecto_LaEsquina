// src/App.js
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; // Importar AuthProvider
import { Navigate } from 'react-router-dom';

import TopBar from './components/TopBar';
import Home from './components/Home';
import ProtectedRoute from './components/ProtectedRoute'; // Importar ProtectedRoute
import LoginPage from './Login/LoginPage'; // Importar LoginPage

// ... (imports de las otras vistas)
import ListaUsuarios from './Usuario/ListaUsuarios';
import CrearUsuario from './Usuario/CrearUsuario';
import EliminarUsuario from './Usuario/EliminarUsuario';
import ActualizarUsuario from './Usuario/ActualizarUsuario';

import ListaProveedores from './Proveedores/ListaProveedores';
import CrearProveedor from './Proveedores/CrearProveedores';
import ActualizarProveedor from './Proveedores/ActualizarProveedores';
import EliminarProveedor from './Proveedores/EliminarProveedores';

import ListaProductos from './Productos/ListaProductos';
import CrearProducto from './Productos/CrearProducto';
import ActualizarProducto from './Productos/ActualizarProducto';
import EliminarProducto from './Productos/EliminarProducto';

import ListaVentas from './Ventas/ListaVentas';
import Caja from './Caja/caja';

// Roles
const ROLES = {
  Admin: 'Admin',
  Bodeguero: 'Bodeguero',
  Cajero: 'Cajero'
}

// Mover el Router a index.js y envolver App con AuthProvider
function App() {
  return (
    <Router>
      <AuthProvider> {/* Envolver todo con AuthProvider */}
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

// Creamos un componente interno para poder usar el hook useAuth
function AppContent() {
  const { user } = useAuth(); // Obtener el usuario del contexto

  return (
    <div>
      {/* Solo mostrar TopBar si el usuario está logueado */}
      {user && <TopBar />}
      
      <Routes>
        {/* Ruta de Login (Pública) */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas Protegidas */}
        <Route 
          path="/" 
          element={<ProtectedRoute element={<Home />} />} 
        />

        {/* --- Rutas de Admin --- */}
        <Route path="/usuario/" element={<ProtectedRoute element={<ListaUsuarios />} roles={[ROLES.Admin]} />} />
        <Route path="/usuarios/add" element={<ProtectedRoute element={<CrearUsuario />} roles={[ROLES.Admin]} />} />
        <Route path="/usuario/:id/delete" element={<ProtectedRoute element={<EliminarUsuario />} roles={[ROLES.Admin]} />} />
        <Route path="/usuario/:id/change" element={<ProtectedRoute element={<ActualizarUsuario />} roles={[ROLES.Admin]} />} />
        
        <Route path='/proveedores/' element={<ProtectedRoute element={<ListaProveedores />} roles={[ROLES.Admin]} />} />
        <Route path="/proveedor/add" element={<ProtectedRoute element={<CrearProveedor />} roles={[ROLES.Admin]} />} />
        <Route path="/proveedor/:id/delete" element={<ProtectedRoute element={<EliminarProveedor />} roles={[ROLES.Admin]} />} />
        <Route path="/proveedor/:id/change" element={<ProtectedRoute element={<ActualizarProveedor />} roles={[ROLES.Admin]} />} />

        {/* --- Rutas de Bodeguero --- */}
        <Route path='/productos/' element={<ProtectedRoute element={<ListaProductos />} roles={[ROLES.Admin, ROLES.Bodeguero]} />} />
        <Route path="/producto/add" element={<ProtectedRoute element={<CrearProducto />} roles={[ROLES.Admin, ROLES.Bodeguero]} />} />
        <Route path="/producto/:id/delete" element={<ProtectedRoute element={<EliminarProducto />} roles={[ROLES.Admin, ROLES.Bodeguero]} />} />
        <Route path="/producto/:id/change" element={<ProtectedRoute element={<ActualizarProducto />} roles={[ROLES.Admin, ROLES.Bodeguero]} />} />

        {/* --- Rutas de Cajero --- */}
        <Route path='/ventas/' element={<ProtectedRoute element={<ListaVentas />} roles={[ROLES.Admin, ROLES.Cajero]} />} />
        <Route path="/caja/" element={<ProtectedRoute element={<Caja />} roles={[ROLES.Admin, ROLES.Cajero]} />} />

        {/* Ruta "Catch-all" o 404 (opcional) */}
        <Route path="*" element={user ? <Navigate to="/" /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;