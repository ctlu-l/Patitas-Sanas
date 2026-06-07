import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import './DashRec.css'; 

export const Admin = () => {
  const navigate = useNavigate();
  const [seccionActiva, setSeccionActiva] = useState('pacientes'); // Iniciamos en pacientes para probar
  
  // Estados para Personal
  const [veterinarios, setVeterinarios] = useState([]);
  const [recepcionistas, setRecepcionistas] = useState([]);
  const [cargandoPersonal, setCargandoPersonal] = useState(false);

  // Estados para Pacientes
  const [pacientes, setPacientes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cargandoPacientes, setCargandoPacientes] = useState(false);

  // Estados para el Modal
  const [modalActivo, setModalActivo] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    especialidad: '',
    correo: '',
    telefono: ''
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  useEffect(() => {
    // Si cambiamos de sección, cargamos lo necesario
    if (seccionActiva === 'personal') fetchPersonal();
    if (seccionActiva === 'pacientes') fetchPacientes();
  }, [seccionActiva]);

  // --- FUNCIONES DE PERSONAL ---
  const fetchPersonal = async () => {
    setCargandoPersonal(true);
    try {
      const [vetRes, recRes] = await Promise.all([
        supabase.from('veterinarios').select('*').order('id_veterinario', { ascending: true }),
        supabase.from('recepcionistas').select('*').order('id_recepcionista', { ascending: true })
      ]);

      if (vetRes.error) throw vetRes.error;
      if (recRes.error) throw recRes.error;

      setVeterinarios(vetRes.data || []);
      setRecepcionistas(recRes.data || []);
    } catch (error) {
      console.error("Error al cargar personal:", error.message);
    } finally {
      setCargandoPersonal(false);
    }
  };

  const handleDarDeBaja = async (id, tipo) => {
    const confirmacion = window.confirm("¿Estás seguro de que deseas dar de baja a este empleado? Esta acción no se puede deshacer.");
    if (!confirmacion) return;

    try {
      const tabla = tipo === 'veterinario' ? 'veterinarios' : 'recepcionistas';
      const columnaId = tipo === 'veterinario' ? 'id_veterinario' : 'id_recepcionista';
      
      const { error } = await supabase.from(tabla).delete().eq(columnaId, id);
      
      if (error) throw error;
      
      alert('Empleado dado de baja correctamente.');
      fetchPersonal(); 
    } catch (error) {
      alert(`Error al eliminar: ${error.message}`);
    }
  };

  const abrirModal = (tipo) => {
    setModalActivo(tipo);
    setFormData({ nombre: '', especialidad: '', correo: '', telefono: '' });
  };

  const cerrarModal = () => {
    setModalActivo(null);
  };

  const handleGuardarPersonal = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      if (modalActivo === 'veterinario') {
        const { error } = await supabase.from('veterinarios').insert([
          { nombre_completo: formData.nombre, especialidad: formData.especialidad || 'General' }
        ]);
        if (error) throw error;
        alert('👨‍⚕️ Veterinario agregado con éxito.');
      } else if (modalActivo === 'recepcionista') {
        const { error } = await supabase.from('recepcionistas').insert([
          { nombre_completo: formData.nombre, correo: formData.correo, telefono: formData.telefono }
        ]);
        if (error) throw error;
        alert('👩‍💻 Recepcionista agregada con éxito.');
      }

      cerrarModal();
      fetchPersonal();
    } catch (error) {
      alert(`Error al guardar: ${error.message}`);
    } finally {
      setGuardando(false);
    }
  };

  // --- FUNCIONES DE PACIENTES ---
  const fetchPacientes = async () => {
    setCargandoPacientes(true);
    const { data, error } = await supabase
      .from('mascotas')
      .select('*, clientes(nombre_completo, telefono, correo)'); // Join con clientes
    
    if (!error) setPacientes(data || []);
    setCargandoPacientes(false);
  };

  // Filtro de búsqueda en tiempo real
  const pacientesFiltrados = pacientes.filter(p => 
    p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.clientes?.nombre_completo?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- RENDERIZADO CONDICIONAL DE SECCIONES ---
  const renderContenido = () => {
    switch (seccionActiva) {
      case 'dashboard':
        return (
          <div>
            <h2 style={{ color: 'var(--primary)', marginBottom: '20px' }}>Visión General (Dashboard)</h2>
            <div className="stats-grid">
              <div className="stat-card green"><h4>INGRESOS DEL MES</h4><div className="value">$ 45,200.00</div></div>
              <div className="stat-card"><h4>CITAS ESTE MES</h4><div className="value">128</div></div>
              <div className="stat-card orange"><h4>NUEVOS PACIENTES</h4><div className="value">15</div></div>
              <div className="stat-card red"><h4>ALERTAS DE STOCK</h4><div className="value">5</div></div>
            </div>
          </div>
        );

      case 'personal':
        return (
          <div className="panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: 'var(--primary)', margin: 0 }}>Gestión de Personal</h2>
              <div>
                <button className="btn-action btn-add" style={{ marginRight: '10px' }} onClick={() => abrirModal('veterinario')}>+ Nuevo Veterinario</button>
                <button className="btn-action btn-pay" onClick={() => abrirModal('recepcionista')}>+ Nueva Recepcionista</button>
              </div>
            </div>

            {cargandoPersonal ? (
              <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Cargando base de datos...</p>
            ) : (
              <>
                <h3 style={{ color: '#444', borderBottom: '2px solid #eee', paddingBottom: '10px', marginTop: '10px' }}>Médicos Veterinarios</h3>
                <div style={{ overflowX: 'auto', marginBottom: '30px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f4f6f9', textAlign: 'left' }}>
                        <th style={{ padding: '12px', borderBottom: '2px solid #ddd', color: '#555' }}>ID</th>
                        <th style={{ padding: '12px', borderBottom: '2px solid #ddd', color: '#555' }}>Nombre Completo</th>
                        <th style={{ padding: '12px', borderBottom: '2px solid #ddd', color: '#555' }}>Especialidad</th>
                        <th style={{ padding: '12px', borderBottom: '2px solid #ddd', color: '#555' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {veterinarios.map(vet => (
                        <tr key={vet.id_veterinario} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '12px', color: '#666' }}>#{vet.id_veterinario}</td>
                          <td style={{ padding: '12px', fontWeight: 'bold', color: 'var(--primary)' }}>{vet.nombre_completo}</td>
                          <td style={{ padding: '12px', color: '#555' }}>{vet.especialidad || 'General'}</td>
                          <td style={{ padding: '12px' }}>
                            <button 
                                onClick={() => handleDarDeBaja(vet.id_veterinario, 'veterinario')}
                                style={{ background: '#dc3545', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>
                                Dar de Baja
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h3 style={{ color: '#444', borderBottom: '2px solid #eee', paddingBottom: '10px', marginTop: '20px' }}>Equipo de Recepción</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f4f6f9', textAlign: 'left' }}>
                        <th style={{ padding: '12px', borderBottom: '2px solid #ddd', color: '#555' }}>ID</th>
                        <th style={{ padding: '12px', borderBottom: '2px solid #ddd', color: '#555' }}>Nombre</th>
                        <th style={{ padding: '12px', borderBottom: '2px solid #ddd', color: '#555' }}>Email</th>
                        <th style={{ padding: '12px', borderBottom: '2px solid #ddd', color: '#555' }}>Teléfono</th>
                        <th style={{ padding: '12px', borderBottom: '2px solid #ddd', color: '#555' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recepcionistas.map(rec => (
                        <tr key={rec.id_recepcionista} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '12px', color: '#666' }}>#{rec.id_recepcionista}</td>
                          <td style={{ padding: '12px', fontWeight: 'bold', color: 'var(--primary)' }}>{rec.nombre_completo || rec.nombre}</td>
                          <td style={{ padding: '12px', color: '#555' }}>{rec.email || rec.correo || 'N/A'}</td>
                          <td style={{ padding: '12px', color: '#555' }}>{rec.telefono || 'N/A'}</td>
                          <td style={{ padding: '12px' }}>
                            <button 
                                onClick={() => handleDarDeBaja(rec.id_recepcionista, 'recepcionista')}
                                style={{ background: '#dc3545', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>
                                Dar de Baja
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        );

      case 'pacientes':
        return (
          <div className="panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: 'var(--primary)', margin: 0 }}>Directorio de Pacientes</h2>
              <input 
                type="text" 
                placeholder="🔍 Buscar por nombre de mascota o dueño..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: '10px', width: '300px', borderRadius: '5px', border: '1px solid #ccc' }}
              />
            </div>
            {cargandoPacientes ? <p>Cargando pacientes...</p> : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f4f6f9' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Mascota</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Especie</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Dueño</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Contacto</th>
                  </tr>
                </thead>
                <tbody>
                  {pacientesFiltrados.map(p => (
                    <tr key={p.id_mascota} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>{p.nombre}</td>
                      <td style={{ padding: '12px' }}>{p.especie}</td>
                      <td style={{ padding: '12px' }}>{p.clientes?.nombre_completo || 'Sin dueño'}</td>
                      <td style={{ padding: '12px', fontSize: '0.9rem' }}>{p.clientes?.telefono || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );

      case 'servicios':
        return <div className="panel"><h2 style={{ color: 'var(--primary)' }}>Catálogo de Servicios y Precios</h2></div>;
      
      default:
        return null;
    }
  };

  return (
    <div className="rec-wrapper">
      <aside className="rec-sidebar" style={{ backgroundColor: '#0B192C' }}> 
        <h2>Patitas<span>Sanas</span></h2>
        <p style={{ color: '#8892b0', fontSize: '0.75rem', textAlign: 'center', marginTop: '-30px', marginBottom: '30px', letterSpacing: '1px' }}>ADMINISTRADOR</p>
        <ul className="rec-nav-menu">
          <li><a href="#" className={seccionActiva === 'dashboard' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setSeccionActiva('dashboard'); }}>📊 Dashboard</a></li>
          <li><a href="#" className={seccionActiva === 'personal' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setSeccionActiva('personal'); }}>👥 Personal</a></li>
          <li><a href="#" className={seccionActiva === 'pacientes' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setSeccionActiva('pacientes'); }}>🐕 Pacientes y Dueños</a></li>
          <li><a href="#" className={seccionActiva === 'servicios' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setSeccionActiva('servicios'); }}>⚙️ Servicios y Precios</a></li>
        </ul>
      </aside>

      <main className="rec-main-content">
        <div className="rec-header-main">
          <div>
            <h1>Centro de Control</h1>
            <p style={{ color: '#666' }}>Visión global y configuraciones del sistema</p>
          </div>
          <button onClick={handleLogout} className="btn-logout">Cerrar Sesión</button>
        </div>
        {renderContenido()}
      </main>

      {/* --- MODAL PARA REGISTRO DE PERSONAL --- */}
      {modalActivo && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h2 style={{ color: 'var(--primary)', marginTop: 0 }}>
              {modalActivo === 'veterinario' ? '👨‍⚕️ Registrar Veterinario' : '👩‍💻 Registrar Recepcionista'}
            </h2>
            <form onSubmit={handleGuardarPersonal} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', color: '#555' }}>Nombre Completo</label>
                <input type="text" required value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} placeholder="Ej. Juan Pérez" />
              </div>
              {modalActivo === 'veterinario' ? (
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', color: '#555' }}>Especialidad</label>
                  <input type="text" value={formData.especialidad} onChange={(e) => setFormData({...formData, especialidad: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} placeholder="Ej. Cirugía (Opcional)" />
                </div>
              ) : (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', color: '#555' }}>Correo Electrónico</label>
                    <input type="email" required value={formData.correo} onChange={(e) => setFormData({...formData, correo: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} placeholder="correo@patitassanas.com" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', color: '#555' }}>Teléfono</label>
                    <input type="tel" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} placeholder="55 0000 0000" />
                  </div>
                </>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={cerrarModal} style={{ padding: '10px 15px', border: '1px solid #ccc', backgroundColor: 'transparent', borderRadius: '5px', cursor: 'pointer', color: '#666' }}>Cancelar</button>
                <button type="submit" disabled={guardando} style={{ padding: '10px 15px', border: 'none', backgroundColor: 'var(--success)', color: 'white', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {guardando ? 'Guardando...' : 'Confirmar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;