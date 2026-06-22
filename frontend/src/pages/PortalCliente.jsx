import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { CartContext } from '../tienda/CartContext';
import './PortalCliente.css';

function PortalCliente() {
  const [usuarioNombre, setUsuarioNombre] = useState('');
  const [usuarioId, setUsuarioId] = useState(null); 
  const [cargando, setCargando] = useState(true);
  
  // Nuevos estados para los KPIs
  const [totalMascotas, setTotalMascotas] = useState(0);
  const [citasPendientes, setCitasPendientes] = useState(0);
  
  // 👇 Usamos exclusivamente 'carrito' y 'vaciarCarrito' del contexto
  const { carrito, vaciarCarrito } = useContext(CartContext);
  
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [errorPago, setErrorPago] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    obtenerSesion();
  }, []);

  const obtenerSesion = async () => {
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError || !session) return navigate('/login');

      setUsuarioId(session.user.id); 

      const { data: cliente, error } = await supabase
        .from('clientes')
        .select('id_cliente, nombre_completo') 
        .eq('correo', session.user.email)
        .single();

      if (error) throw error;
      if (cliente) {
        setUsuarioNombre(cliente.nombre_completo);
        fetchEstadisticasCliente(cliente.id_cliente);
      }
    } catch (error) {
      console.error("Error al obtener sesión:", error.message);
    } finally {
      setCargando(false);
    }
  };

  const fetchEstadisticasCliente = async (idClienteNum) => {
    try {
      // --- 1. Consulta de Mascotas ---
      const { data: mascotasData, error: errMascotas } = await supabase
        .from('mascotas')
        .select('id_mascota') 
        .eq('id_cliente', idClienteNum); 

      if (errMascotas) {
        console.error("❌ Falla en tabla 'mascotas':", errMascotas);
        return; 
      }

      setTotalMascotas(mascotasData ? mascotasData.length : 0);

      // --- 2. Consulta de Citas ---
      if (mascotasData && mascotasData.length > 0) {
        const idsMascotas = mascotasData.map(m => m.id_mascota);

        const { count: citasCount, error: errCitas } = await supabase
          .from('citas')
          .select('*', { count: 'exact', head: true })
          .in('id_mascota', idsMascotas) 
          .neq('estado', 'Cancelada')
          .neq('estado', 'Completada');
          
        if (errCitas) {
          console.error("❌ Falla en tabla 'citas':", errCitas);
        } else if (citasCount !== null) {
          setCitasPendientes(citasCount);
        }
      } else {
        setCitasPendientes(0);
      }
    } catch (error) {
      console.error("Error general en estadísticas:", error.message);
    }
  };

  const calcularTotal = () => {
    if (!carrito) return 0; 
    return carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  };

  const handleConfirmarPago = async () => {
    // 👇 Cambiamos 'cart' por 'carrito'
    if (carrito.length === 0) return;
    
    setProcesandoPago(true);
    setErrorPago(null);

    try {
      // 👇 Cambiamos 'cart' por 'carrito'
      const itemsPayload = carrito.map(item => ({
        id: Number(item.id), 
        cantidad: item.cantidad,
        precio: item.precio
      }));

      const { error: rpcError } = await supabase.rpc('procesar_compra', {
        p_usuario_id: usuarioId,
        p_total: calcularTotal(),
        p_items: itemsPayload
      });

      if (rpcError) throw rpcError;

      // 👇 Usamos la función en español para vaciar
      vaciarCarrito();
      alert('¡Compra realizada con éxito! 🐾 Tu pedido ha sido registrado.');
      
    } catch (err) {
      console.error('Error al procesar la compra:', err);
      setErrorPago(err.message || 'Ocurrió un error al procesar el pago.');
    } finally {
      setProcesandoPago(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (cargando) return <p style={{ color: 'gray', padding: '20px', textAlign: 'center' }}>Cargando tu portal...</p>;

  return (
    <div className="portal-wrapper">
      <aside className="portal-sidebar">
        <h2>Patitas<span>Sanas</span></h2>
        <ul className="portal-nav-menu">
          <li><Link to="/portal-cliente" className="active">🏠 Inicio</Link></li>
          <li><Link to="/mis-mascotas">🐾 Mis Mascotas</Link></li>
          <li><Link to="/mis-citas">📅 Mis Citas</Link></li>
          <li><Link to="/mis-compras">🛍️ Mis Compras</Link></li>
          <li><Link to="/agendar-cita">➕ Agendar Cita</Link></li>
        </ul>
      </aside>

      <main className="portal-main-content">
        
        <div className="portal-header-main">
          <div>
            <h1>¡Hola, {usuarioNombre}! 🐾</h1>
            <p>¿Qué haremos hoy por tus mejores amigos?</p>
          </div>
          <button onClick={handleLogout} className="btn-logout">Cerrar Sesión</button>
        </div>

        <div className="portal-stats-grid">
          <div className="stat-card blue">
            <h4>MIS MASCOTAS</h4>
            <div className="value">{totalMascotas}</div>
          </div>
          <div className="stat-card orange">
            <h4>CITAS PENDIENTES</h4>
            <div className="value">{citasPendientes}</div>
          </div>
          <div className="stat-card green">
            <h4>TOTAL EN CARRITO</h4>
            <div className="value">${calcularTotal().toFixed(2)}</div>
          </div>
          <div className="stat-card">
            <h4>ARTÍCULOS</h4>
            {/* 👇 Cambiamos 'cart' por 'carrito' */}
            <div className="value">{carrito ? carrito.length : 0}</div>
          </div>
        </div>

        {/* 👇 Cambiamos 'cart' por 'carrito' para la validación */}
        {carrito && carrito.length > 0 && (
          <section className="cart-summary">
            <h2>Resumen de tu Compra 🛒</h2>
            <ul className="cart-list">
              {/* 👇 Cambiamos 'cart' por 'carrito' en el map */}
              {carrito.map((item) => (
                <li key={item.id}>
                  <span>{item.nombre} <small>(x{item.cantidad})</small></span>
                  <span>${(item.precio * item.cantidad).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="cart-total">
              <span>Total a pagar:</span>
              <span>${calcularTotal().toFixed(2)}</span>
            </div>

            {errorPago && <div className="error-box">Error: {errorPago}</div>}

            <button 
              className="btn-primario btn-full" 
              onClick={handleConfirmarPago}
              disabled={procesandoPago}
            >
              {procesandoPago ? 'Procesando pago...' : 'Confirmar y Pagar'}
            </button>
          </section>
        )}

        {/* === NUEVA SECCIÓN DE SUGERENCIAS DE CUIDADO === */}
        <section className="pet-care-tips">
          <h2>7 cuidados que debes tener con las mascotas y los niños 🐾👧👦</h2>
          
          <div className="tips-grid">
            <div className="tip-card">
              <span className="tip-icon">👀</span>
              <p><strong>Supervísalos siempre.</strong> De forma permanente, no los dejes solos.</p>
            </div>
            
            <div className="tip-card">
              <span className="tip-icon">🤝</span>
              <p><strong>Enséñales el respeto mutuo.</strong></p>
            </div>
            
            <div className="tip-card">
              <span className="tip-icon">🧼</span>
              <p><strong>Higiene ante todo.</strong> Evita que los niños besen a las mascotas o ingieran alimentos después de tocarlas sin lavarse las manos.</p>
            </div>
            
            <div className="tip-card">
              <span className="tip-icon">✂️</span>
              <p><strong>Cuidados necesarios.</strong> Bríndale a tu mascota los cuidados que requiere para mantenerse sana; así también proteges a los niños.</p>
            </div>
            
            <div className="tip-card">
              <span className="tip-icon">🐿️</span>
              <p><strong>No tengas animales silvestres.</strong> Está prohibido y es un gran riesgo tanto para los niños como para las mascotas.</p>
            </div>
            
            <div className="tip-card">
              <span className="tip-icon">🚧</span>
              <p><strong>Pon límites.</strong> Cada uno debe tener su espacio establecido para dormir, comer, etc.</p>
            </div>
            
            <div className="tip-card">
              <span className="tip-icon">❤️</span>
              <p><strong>No son juguetes.</strong> Muéstrales a los niños que las mascotas sienten y merecen respeto.</p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}

export default PortalCliente;