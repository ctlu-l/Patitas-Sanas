import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Inicio from './pages/Inicio';
import Login from './pages/Login';
import Mascotas from './pages/Mascotas';
import Citas from './pages/Citas';
import Recepcion from './pages/Recepcion'; 
import Medico from './pages/Medico'; 
import Admin from './pages/Admin';
import AgendarCita from './pages/AgendarCita'; 
import PortalCliente from './pages/PortalCliente';
import { DashVet } from './pages/DashVet';
import { DashRec } from './pages/DashRec';
import MisCitas from './pages/Citas';
import { Inventario } from './pages/Inventario'; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/portal-cliente" element={<PortalCliente />} />
        <Route path="/mis-citas" element={<MisCitas />} />
        <Route path="/mis-mascotas" element={<Mascotas />} />
        <Route path="/login" element={<Login />} />
        <Route path="/agendar-cita" element={<AgendarCita />} />
        <Route path="/panel-vet" element={<Medico />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/inventario" element={<Inventario />} />

        <Route path="/*" element={
          <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
            {}
            <main style={{ flex: 1, backgroundColor: '#242424', height: '100vh', overflowY: 'auto' }}>
              <Routes>
                <Route path="/recepcion" element={<Recepcion />} />
                <Route path="/citas" element={<Citas />} />
              </Routes>
            </main>
          </div>
        } />

        <Route path="/demo-veterinario" element={<DashVet />} />
        <Route path="/demo-recepcionista" element={<DashRec />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;