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
import { MisCompras } from './pages/MisCompras';
import { DashVet } from './pages/DashVet';
import MisCitas from './pages/Citas';
import { Inventario } from './pages/Inventario'; 
import { CartProvider } from './tienda/CartContext';
import Store from './tienda/Store';

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/portal-cliente" element={<PortalCliente />} />
          <Route path="/mis-citas" element={<MisCitas />} />
          <Route path="/mis-mascotas" element={<Mascotas />} />
          <Route path="/mis-compras" element={<MisCompras />} />
          <Route path="/login" element={<Login />} />
          <Route path="/agendar-cita" element={<AgendarCita />} />
          <Route path="/panel-vet" element={<Medico />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/tienda" element={<Store />} />

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
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App; 