import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';


export const Inventario = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState('Todos');

  // NUEVO: Estados para manejar el formulario de nuevo producto
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    categoria: 'Medicamentos',
    cantidad: 0,
    unidad: '',
    stock_minimo: 5
  });

  useEffect(() => {
    fetchInventario();
  }, []);

  const fetchInventario = async () => {
    setCargando(true);
    try {
      const { data, error } = await supabase
        .from('inventario')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) throw error;
      if (data) setProductos(data);
    } catch (error) {
      console.error('Error al cargar el inventario:', error.message);
    } finally {
      setCargando(false);
    }
  };

  const handleModificarStock = async (id_producto, cantidadActual, cambio) => {
    const nuevaCantidad = cantidadActual + cambio;

    if (nuevaCantidad < 0) {
      alert("No puedes tener un stock menor a 0.");
      return;
    }

    try {
      const { error } = await supabase
        .from('inventario')
        .update({ cantidad: nuevaCantidad })
        .eq('id_producto', id_producto);

      if (error) throw error;

      setProductos(prevProductos =>
        prevProductos.map(prod =>
          prod.id_producto === id_producto ? { ...prod, cantidad: nuevaCantidad } : prod
        )
      );
    } catch (error) {
      alert(`Error al actualizar el stock: ${error.message}`);
    }
  };

  // NUEVO: Función para guardar un nuevo producto en Supabase
  const handleAgregarProducto = async (e) => {
    e.preventDefault(); // Evita que la página se recargue

    // Validación básica
    if (!nuevoProducto.nombre || !nuevoProducto.unidad) {
      alert("Por favor, llena el nombre y la unidad del producto.");
      return;
    }

    try {
      const { error } = await supabase
        .from('inventario')
        .insert([{
          nombre: nuevoProducto.nombre,
          categoria: nuevoProducto.categoria,
          cantidad: Number(nuevoProducto.cantidad),
          unidad: nuevoProducto.unidad,
          stock_minimo: Number(nuevoProducto.stock_minimo)
        }]);

      if (error) throw error;

      alert("Producto agregado exitosamente al inventario.");
      
      // Ocultar formulario, limpiar campos y recargar tabla
      setMostrarFormulario(false);
      setNuevoProducto({ nombre: '', categoria: 'Medicamentos', cantidad: 0, unidad: '', stock_minimo: 5 });
      fetchInventario(); 

    } catch (error) {
      alert(`Error al agregar el producto: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const productosFiltrados = productos.filter(prod => {
    if (filtroCategoria === 'Todos') return true;
    return prod.categoria === filtroCategoria;
  });

  const getStockBadge = (producto) => {
    if (producto.cantidad === 0) {
      return <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#dc3545', color: 'white', fontWeight: 'bold', fontSize: '0.85rem' }}>Agotado</span>;
    }
    if (producto.cantidad <= producto.stock_minimo) {
      return <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#ff9800', color: 'white', fontWeight: 'bold', fontSize: '0.85rem' }}>Stock Bajo</span>;
    }
    return <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#4caf50', color: 'white', fontWeight: 'bold', fontSize: '0.85rem' }}>Ok</span>;
  };

  return (
    <div className="rec-wrapper">
      <aside className="rec-sidebar">
        <h2>Patitas<span>Sanas</span></h2>
        <ul className="rec-nav-menu">
          <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/recepcion'); }}>📅 Agenda y Caja</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/agendar-cita', { state: { origen: 'recepcion' } }); }}>➕ Nueva Cita</a></li>
          <li><a href="#" className="active">📦 Inventario</a></li>
        </ul>
      </aside>

      <main className="rec-main-content">
        <div className="rec-header-main">
          <div>
            <h1>Gestión de Inventario Real</h1>
            <p>Visualización completa de existencias y control de stock</p>
          </div>
          <button onClick={handleLogout} className="btn-logout">Cerrar Sesión</button>
        </div>

        <div className="panels-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="panel">
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
              <h2 style={{ margin: 0 }}>Lista de Insumos</h2>
              
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div>
                  <label style={{ marginRight: '10px', fontWeight: 'bold', color: '#555' }}>Filtrar por:</label>
                  <select 
                    value={filtroCategoria} 
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '5px', border: '1px solid #ccc', fontWeight: 'bold', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="Todos">📦 Todos los productos</option>
                    <option value="Medicamentos">💊 Medicamentos</option>
                    <option value="Material de Curación">🩹 Material de Curación</option>
                  </select>
                </div>
                
                {/* NUEVO: Botón para abrir/cerrar el formulario */}
                <button 
                  onClick={() => setMostrarFormulario(!mostrarFormulario)}
                  style={{ background: mostrarFormulario ? '#dc3545' : 'var(--primary)', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  {mostrarFormulario ? '❌ Cancelar' : '➕ Nuevo Insumo'}
                </button>
              </div>
            </div>

            {/* NUEVO: Formulario desplegable */}
            {mostrarFormulario && (
              <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e9ecef' }}>
                <h3 style={{ marginTop: 0, marginBottom: '15px', color: 'var(--primary)' }}>Registrar Nuevo Producto</h3>
                <form onSubmit={handleAgregarProducto} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', alignItems: 'end' }}>
                  
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '5px' }}>Nombre</label>
                    <input type="text" placeholder="Ej. Antibiótico X" value={nuevoProducto.nombre} onChange={(e) => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} required />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '5px' }}>Categoría</label>
                    <select value={nuevoProducto.categoria} onChange={(e) => setNuevoProducto({...nuevoProducto, categoria: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                      <option value="Medicamentos">Medicamentos</option>
                      <option value="Material de Curación">Material de Curación</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '5px' }}>Cantidad Inicial</label>
                    <input type="number" min="0" value={nuevoProducto.cantidad} onChange={(e) => setNuevoProducto({...nuevoProducto, cantidad: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} required />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '5px' }}>Unidad</label>
                    <input type="text" placeholder="Ej. Frascos, Dosis..." value={nuevoProducto.unidad} onChange={(e) => setNuevoProducto({...nuevoProducto, unidad: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} required />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '5px' }}>Alerta (Mínimo)</label>
                    <input type="number" min="0" value={nuevoProducto.stock_minimo} onChange={(e) => setNuevoProducto({...nuevoProducto, stock_minimo: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} required />
                  </div>

                  <button type="submit" style={{ background: '#28a745', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', height: '100%' }}>
                    💾 Guardar
                  </button>
                </form>
              </div>
            )}

            {cargando ? (
              <p style={{ textAlign: 'center', padding: '40px', color: 'gray' }}>Cargando inventario desde Supabase...</p>
            ) : productosFiltrados.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '40px', color: 'gray' }}>No se encontraron productos en esta categoría.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '10px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #eee', background: '#f9f9f9' }}>
                      <th style={{ padding: '12px' }}>Producto</th>
                      <th style={{ padding: '12px' }}>Categoría</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Stock Actual</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Mínimo Requerido</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Estado</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosFiltrados.map((prod) => (
                      <tr key={prod.id_producto} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px', fontWeight: '600' }}>{prod.nombre}</td>
                        <td style={{ padding: '12px', color: '#666' }}>{prod.categoria}</td>
                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: 'var(--primary)' }}>
                          {prod.cantidad} {prod.unidad}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', color: '#888' }}>
                          {prod.stock_minimo} {prod.unidad}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          {getStockBadge(prod)}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            <button 
                              onClick={() => handleModificarStock(prod.id_producto, prod.cantidad, -1)}
                              style={{ width: '28px', height: '28px', border: '1px solid #ccc', background: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              title="Restar 1 unidad"
                            >
                              -
                            </button>
                            <button 
                              onClick={() => handleModificarStock(prod.id_producto, prod.cantidad, 1)}
                              style={{ width: '28px', height: '28px', border: '1px solid #ccc', background: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              title="Sumar 1 unidad"
                            >
                              +
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <button 
              style={{ width: '100%', maxWidth: '350px', marginTop: '30px', background: 'var(--primary)', color: 'white', border: 'none', padding: '12px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} 
              onClick={() => window.alert('Esta función se conectará a la orden de compra automática pronto.')}
            >
              Generar Pedido de Surtido
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Inventario;