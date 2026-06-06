import { useState, useEffect } from 'react';

function Mascotas() {
  const [clientes, setClientes] = useState([]);
  const [mascotasDelCliente, setMascotasDelCliente] = useState([]);

  const [idCliente, setIdCliente] = useState('');
  const [nombre, setNombre] = useState('');
  const [especie, setEspecie] = useState('');
  const [raza, setRaza] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [sexo, setSexo] = useState('');
  const [color, setColor] = useState('');

  // ── Cargar dueños al inicio ──
  useEffect(() => {
    fetch('http://localhost:4000/api/clientes')
      .then((r) => r.json())
      .then((datos) => setClientes(datos))
      .catch((e) => console.error('Error al cargar dueños:', e));
  }, []);

  // ── Cargar mascotas cuando cambia el dueño seleccionado ──
  const cargarMascotasDelDueño = (id) => {
    if (!id) { setMascotasDelCliente([]); return; }
    fetch(`http://localhost:4000/api/mascotas/cliente/${id}`)
      .then((r) => r.json())
      .then((datos) => setMascotasDelCliente(datos))
      .catch((e) => console.error('Error al cargar mascotas:', e));
  };

  useEffect(() => { cargarMascotasDelDueño(idCliente); }, [idCliente]);

  // ── Guardar mascota ──
  const guardarMascota = async (evento) => {
    evento.preventDefault();
    const nuevaMascota = { id_cliente: idCliente, nombre, especie, raza, fecha_nacimiento: fechaNacimiento, sexo, color };
    try {
      const respuesta = await fetch('http://localhost:4000/api/mascotas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaMascota),
      });
      if (respuesta.ok) {
        alert('¡Paciente registrado con éxito!');
        setNombre(''); setEspecie(''); setRaza('');
        setFechaNacimiento(''); setSexo(''); setColor('');
        cargarMascotasDelDueño(idCliente);
      }
    } catch (e) { console.error('Error al guardar mascota:', e); }
  };

  return (
    <>
      <style>{`
        .masc-wrap {
          padding: 36px 32px;
          max-width: 860px;
          margin: 0 auto;
          font-family: 'Nunito', 'Segoe UI', sans-serif;
          color: #fff;
        }
        .masc-title {
          font-size: 1.6rem;
          font-weight: 800;
          color: #4CAF50;
          border-bottom: 2px solid #4CAF50;
          padding-bottom: 10px;
          margin-bottom: 28px;
        }

        /* ── CARD ── */
        .masc-card {
          background: #1e1e1e;
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          margin-bottom: 28px;
        }
        .masc-card label {
          display: block;
          font-size: 0.85rem;
          font-weight: 700;
          color: #aaa;
          margin-bottom: 8px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        /* ── INPUTS ── */
        .masc-select, .masc-input {
          width: 100%;
          padding: 11px 14px;
          border-radius: 9px;
          border: 1px solid #3a3a3a;
          background: #141414;
          color: #fff;
          font-family: inherit;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s;
          margin-bottom: 16px;
        }
        .masc-select:focus, .masc-input:focus { border-color: #4CAF50; }
        .masc-input::placeholder { color: #555; }
        .masc-input[type="date"] { color-scheme: dark; }

        /* ── ROW ── */
        .masc-row {
          display: flex;
          gap: 12px;
        }
        .masc-row > * { flex: 1; }

        /* ── BOTÓN ── */
        .masc-btn {
          width: 100%;
          padding: 13px;
          background: #4CAF50;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-family: inherit;
          font-size: 1rem;
          font-weight: 800;
          cursor: pointer;
          margin-top: 4px;
          transition: opacity 0.15s, transform 0.1s;
        }
        .masc-btn:hover { opacity: 0.88; transform: translateY(-1px); }

        /* ── TABLA ── */
        .masc-table-title {
          font-size: 1rem;
          font-weight: 800;
          color: #4CAF50;
          margin-bottom: 16px;
        }
        .masc-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.93rem;
        }
        .masc-table thead tr {
          border-bottom: 2px solid #4CAF50;
        }
        .masc-table th {
          padding: 10px 14px;
          text-align: left;
          color: #aaa;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.78rem;
          letter-spacing: 0.05em;
        }
        .masc-table tbody tr {
          border-bottom: 1px solid #2a2a2a;
          transition: background 0.15s;
        }
        .masc-table tbody tr:hover { background: #252525; }
        .masc-table td { padding: 12px 14px; }
        .masc-table td:first-child { color: #4CAF50; font-weight: 700; }

        .masc-empty { color: #666; font-size: 0.9rem; padding: 10px 0; }

        /* ── DIVIDER ── */
        .masc-divider {
          border: none;
          border-top: 1px solid #2a2a2a;
          margin: 20px 0;
        }
      `}</style>

      <div className="masc-wrap">
        <h2 className="masc-title">🐕 Gestión de Mascotas</h2>

        {/* ── FORMULARIO ── */}
        <div className="masc-card">
          <form onSubmit={guardarMascota}>

            <label>Selecciona al dueño</label>
            <select
              className="masc-select"
              value={idCliente}
              onChange={(e) => setIdCliente(e.target.value)}
              required
            >
              <option value="">-- Selecciona un dueño --</option>
              {clientes.map((c) => (
                <option key={c.id_cliente} value={c.id_cliente}>
                  {c.nombre_completo} (Tel: {c.telefono})
                </option>
              ))}
            </select>

            {idCliente && (
              <>
                <hr className="masc-divider" />

                <div className="masc-row">
                  <div>
                    <label>Nombre de la mascota</label>
                    <input className="masc-input" placeholder="Ej. Luna" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                  </div>
                  <div>
                    <label>Especie</label>
                    <input className="masc-input" placeholder="Ej. Perro" value={especie} onChange={(e) => setEspecie(e.target.value)} required />
                  </div>
                  <div>
                    <label>Raza</label>
                    <input className="masc-input" placeholder="Ej. Labrador" value={raza} onChange={(e) => setRaza(e.target.value)} />
                  </div>
                </div>

                <div className="masc-row">
                  <div>
                    <label>Sexo</label>
                    <input className="masc-input" placeholder="Macho / Hembra" value={sexo} onChange={(e) => setSexo(e.target.value)} />
                  </div>
                  <div>
                    <label>Color</label>
                    <input className="masc-input" placeholder="Ej. Café" value={color} onChange={(e) => setColor(e.target.value)} />
                  </div>
                  <div>
                    <label>Fecha de nacimiento</label>
                    <input className="masc-input" type="date" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} />
                  </div>
                </div>

                <button type="submit" className="masc-btn">+ Guardar Paciente</button>
              </>
            )}
          </form>
        </div>

        {/* ── TABLA DE MASCOTAS ── */}
        {idCliente && (
          <div className="masc-card">
            <p className="masc-table-title">Expedientes asociados al dueño</p>
            {mascotasDelCliente.length === 0 ? (
              <p className="masc-empty">Este cliente aún no tiene mascotas registradas.</p>
            ) : (
              <table className="masc-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Especie</th>
                    <th>Raza</th>
                    <th>Sexo</th>
                  </tr>
                </thead>
                <tbody>
                  {mascotasDelCliente.map((m) => (
                    <tr key={m.id_mascota}>
                      <td>{m.nombre}</td>
                      <td>{m.especie}</td>
                      <td>{m.raza}</td>
                      <td>{m.sexo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default Mascotas;
