import { useState, useEffect } from 'react';

function Mascotas() {
  const [clientes, setClientes] = useState([]);
  const [mascotasDelCliente, setMascotasDelCliente] = useState([]); // Nuevo estado para la tabla

  const [idCliente, setIdCliente] = useState('');
  const [nombre, setNombre] = useState('');
  const [especie, setEspecie] = useState('');
  const [raza, setRaza] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [sexo, setSexo] = useState('');
  const [color, setColor] = useState('');

  // 1. Cargar la lista de dueños al inicio
  useEffect(() => {
    fetch('http://localhost:4000/api/clientes')
      .then((respuesta) => respuesta.json())
      .then((datos) => setClientes(datos))
      .catch((error) => console.error('Error al cargar dueños:', error));
  }, []);

  // 2. MAGIA REACTIVA: Cargar mascotas cada vez que se selecciona un dueño distinto
  const cargarMascotasDelDueño = (id) => {
    if (!id) {
      setMascotasDelCliente([]);
      return;
    }
    fetch(`http://localhost:4000/api/mascotas/cliente/${id}`)
      .then((respuesta) => respuesta.json())
      .then((datos) => setMascotasDelCliente(datos))
      .catch((error) => console.error('Error al cargar mascotas:', error));
  };

  // Escuchamos los cambios en el menú desplegable
  useEffect(() => {
    cargarMascotasDelDueño(idCliente);
  }, [idCliente]);

  const guardarMascota = async (evento) => {
    evento.preventDefault();

    const nuevaMascota = {
      id_cliente: idCliente,
      nombre: nombre,
      especie: especie,
      raza: raza,
      fecha_nacimiento: fechaNacimiento,
      sexo: sexo,
      color: color
    };

    try {
      const respuesta = await fetch('http://localhost:4000/api/mascotas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaMascota),
      });

      if (respuesta.ok) {
        alert('¡Paciente registrado con éxito!');
        // Limpiamos cajas pero dejamos el idCliente intacto
        setNombre('');
        setEspecie('');
        setRaza('');
        setFechaNacimiento('');
        setSexo('');
        setColor('');
        
        // Refrescamos la tabla para ver al nuevo paciente al instante
        cargarMascotasDelDueño(idCliente);
      }
    } catch (error) {
      console.error('Error al guardar mascota:', error);
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', maxWidth: '900px', margin: '0 auto', color: 'white' }}>
      <h2 style={{ color: '#4CAF50', borderBottom: '2px solid #4CAF50', paddingBottom: '10px' }}>
        🐕 Gestión de Mascotas
      </h2>

      {/* --- FORMULARIO --- */}
      <div style={{ backgroundColor: '#242424', padding: '25px', borderRadius: '10px', marginTop: '20px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
        <form onSubmit={guardarMascota} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <label style={{ fontWeight: 'bold' }}>Selecciona al dueño para registrar o ver sus mascotas:</label>
          <select
            value={idCliente}
            onChange={(e) => setIdCliente(e.target.value)}
            required
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#1a1a1a', color: 'white' }}
          >
            <option value="">-- Selecciona un dueño --</option>
            {clientes.map(cliente => (
              <option key={cliente.id_cliente} value={cliente.id_cliente}>
                {cliente.nombre_completo} (Tel: {cliente.telefono})
              </option>
            ))}
          </select>

          {/* Cajas colapsables: Solo se muestran si ya elegiste un dueño */}
          {idCliente && (
            <>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <input type="text" placeholder="Nombre de la Mascota" value={nombre} onChange={(e) => setNombre(e.target.value)} required style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#1a1a1a', color: 'white' }} />
                <input type="text" placeholder="Especie (Ej. Perro)" value={especie} onChange={(e) => setEspecie(e.target.value)} required style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#1a1a1a', color: 'white' }} />
                <input type="text" placeholder="Raza" value={raza} onChange={(e) => setRaza(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#1a1a1a', color: 'white' }} />
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" placeholder="Sexo" value={sexo} onChange={(e) => setSexo(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#1a1a1a', color: 'white' }} />
                <input type="text" placeholder="Color" value={color} onChange={(e) => setColor(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#1a1a1a', color: 'white' }} />
                <input type="date" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #555', backgroundColor: '#1a1a1a', color: 'white', colorScheme: 'dark' }} title="Fecha de Nacimiento" />
              </div>

              <button type="submit" style={{ padding: '12px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
                + Guardar Paciente
              </button>
            </>
          )}
        </form>
      </div>

      {/* --- TABLA DE RESULTADOS --- */}
      {idCliente && (
        <div style={{ backgroundColor: '#242424', padding: '25px', borderRadius: '10px', marginTop: '30px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
          <h3 style={{ marginTop: '0' }}>Expedientes asociados</h3>
          
          {mascotasDelCliente.length === 0 ? (
            <p style={{ color: '#aaa' }}>Este cliente aún no tiene mascotas registradas.</p>
          ) : (
            <table style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #4CAF50' }}>
                  <th style={{ padding: '12px' }}>Nombre</th>
                  <th style={{ padding: '12px' }}>Especie</th>
                  <th style={{ padding: '12px' }}>Raza</th>
                  <th style={{ padding: '12px' }}>Sexo</th>
                </tr>
              </thead>
              <tbody>
                {mascotasDelCliente.map((mascota) => (
                  <tr key={mascota.id_mascota} style={{ borderBottom: '1px solid #444' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#4CAF50' }}>{mascota.nombre}</td>
                    <td style={{ padding: '12px' }}>{mascota.especie}</td>
                    <td style={{ padding: '12px' }}>{mascota.raza}</td>
                    <td style={{ padding: '12px' }}>{mascota.sexo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default Mascotas;      