import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Inicio from './pages/Inicio';
import Login from './pages/Login';
import Clientes from './pages/Clientes';
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

        <Route path="/*" element={
          <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
            <nav style={{ width: '250px', backgroundColor: '#1a1a1a', padding: '20px', borderRight: '2px solid #4CAF50' }}>
              <h2 style={{ color: '#4CAF50', textAlign: 'center', marginBottom: '40px' }}>🐾 Panel Interno</h2>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ margin: '20px 0' }}>
                  <Link to="/recepcion" style={{ color: 'white', textDecoration: 'none', fontSize: '18px', display: 'block', padding: '10px', backgroundColor: '#012b81', borderRadius: '5px', fontWeight: 'bold' }}>📅 Agenda y Caja</Link>
                </li>
                <li style={{ margin: '20px 0' }}>
                  <Link to="/clientes" style={{ color: 'white', textDecoration: 'none', fontSize: '18px', display: 'block', padding: '10px', backgroundColor: '#333', borderRadius: '5px' }}>👥 Dueños</Link>
                </li>
                <li style={{ margin: '20px 0' }}>
                  <Link to="/mis-mascotas" style={{ color: 'white', textDecoration: 'none', fontSize: '18px', display: 'block', padding: '10px', backgroundColor: '#333', borderRadius: '5px' }}>🐕 Mascotas</Link>
                </li>
                <li style={{ margin: '20px 0' }}>
                  <Link to="/citas" style={{ color: 'white', textDecoration: 'none', fontSize: '18px', display: 'block', padding: '10px', backgroundColor: '#333', borderRadius: '5px' }}>📅 Agenda</Link>
                </li>
                <li style={{ marginTop: '50px' }}>
                  <Link to="/" style={{ color: '#aaa', textDecoration: 'none', fontSize: '15px', display: 'block', padding: '10px', border: '1px solid #555', borderRadius: '5px', textAlign: 'center' }}>⬅ Volver al Inicio</Link>
                </li>
              </ul>
            </nav>

            <main style={{ flex: 1, backgroundColor: '#242424', height: '100vh', overflowY: 'auto' }}>
              <Routes>
                <Route path="/recepcion" element={<Recepcion />} />
                <Route path="/clientes" element={<Clientes />} />
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
