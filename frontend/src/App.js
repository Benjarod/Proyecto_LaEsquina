import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import TopBar from './components/TopBar';
import Home from './components/Home';

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

function App() {
  return (
    <Router>
      <div>
        <TopBar/>
        <Routes>
          <Route path="/" element={<Home/>}/>

          <Route path="/usuario/" element={<ListaUsuarios/>}/>
          <Route path="/usuarios/add" element={<CrearUsuario/>} />
          <Route path="/usuario/:id/delete" element={<EliminarUsuario/>} />
          <Route path="/usuario/:id/change" element={<ActualizarUsuario/>} />

          <Route path='/proveedores/' element={<ListaProveedores/>}/>
          <Route path="/proveedor/add" element={<CrearProveedor/>} />
          <Route path="/proveedor/:id/delete" element={<EliminarProveedor/>} />
          <Route path="/proveedor/:id/change" element={<ActualizarProveedor/>} />

          <Route path='/productos/' element={<ListaProductos/>}/>
          <Route path="/producto/add" element={<CrearProducto/>} />
          <Route path="/producto/:id/delete" element={<EliminarProducto/>} />
          <Route path="/producto/:id/change" element={<ActualizarProducto/>} />

          <Route path='/ventas/' element={<ListaVentas/>}/>

          <Route path="/caja/" element={<Caja/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;