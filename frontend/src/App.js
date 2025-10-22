import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import TopBar from './components/TopBar';
import Home from './components/Home';
import ListaUsuarios from './Usuario/ListaUsuarios';
import CrearUsuario from './Usuario/CrearUsuario';
import EliminarUsuario from './Usuario/EliminarUsuario';

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

        </Routes>
      </div>
    </Router>
  );
}

export default App;