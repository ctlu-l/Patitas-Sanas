import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { jsPDF } from "jspdf";
import "./Medico.css";

export default function Medico() {
  const navigate = useNavigate();
  
  const [veterinario, setVeterinario] = useState(null);
  const [citas, setCitas] = useState([]);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [historialMascota, setHistorialMascota] = useState([]);
  const [formulario, setFormulario] = useState({
    peso_kg: "", temperatura_c: "", sintomas: "",
    diagnostico: "", tratamiento: "", notas_adicionales: "",
  });
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    // MODO DESARROLLO
    const mockVeterinario = {
      id_veterinario: 1, 
      email: "vetalejandro@gmail.com",
      nombre_completo: "Dr. Alejandro",
      especialidad: "General" 
    };
    setVeterinario(mockVeterinario);
    cargarCitas(mockVeterinario.id_veterinario);
  }, []);

  const cargarCitas = async (id) => {
    const hoy = new Date();
    const inicio = new Date(hoy.setHours(0, 0, 0, 0)).toISOString();
    const { data } = await supabase
      .from("citas")
      .select("*, mascotas(nombre, especie)")
      .eq("id_veterinario", id)
      .gte("fecha_hora", inicio)
      .order("fecha_hora", { ascending: true });
    setCitas(data || []);
  };

  useEffect(() => {
    const cargarHistorial = async () => {
      if (!citaSeleccionada) {
        setHistorialMascota([]);
        return;
      }
      const { data, error } = await supabase
        .from("historial_medico")
        .select("*, veterinarios(nombre_completo)")
        .eq("id_mascota", citaSeleccionada.id_mascota)
        .order("created_at", { ascending: false }); 

      if (!error && data) setHistorialMascota(data);
    };
    cargarHistorial();
  }, [citaSeleccionada]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const generarRecetaPDF = () => {
    if (!citaSeleccionada) return;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Configuración de colores (Verde institucional Patitas Sanas)
    const colorPrimario = [152, 204, 96];
    
    // --- 1. Encabezado ---
    doc.setFillColor(...colorPrimario);
    doc.rect(0, 0, 210, 45, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("Patitas Sanas", 20, 25);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("Venta de Productos y Servicios Veterinarios", 20, 32);

    // --- 2. Información del Paciente ---
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("Información del Paciente", 20, 60);
    doc.line(20, 62, 190, 62);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Paciente: ${citaSeleccionada.mascotas?.nombre}`, 20, 70);
    doc.text(`Especie: ${citaSeleccionada.mascotas?.especie}`, 20, 77);
    doc.text(`Peso: ${formulario.peso_kg || '--'} kg`, 80, 70);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 140, 70);

    // --- 3. Tabla / Contenido ---
    doc.setFillColor(245, 245, 245);
    doc.rect(20, 90, 170, 10, 'F'); // Fondo título tabla
    doc.setFont("helvetica", "bold");
    doc.text("Descripción", 25, 97);
    
    doc.setFont("helvetica", "normal");
    doc.rect(20, 100, 170, 60); // Caja principal de contenido
    doc.text("Diagnóstico:", 25, 110);
    doc.text(formulario.diagnostico || 'N/A', 25, 117, { maxWidth: 160 });
    
    doc.text("Tratamiento:", 25, 135);
    doc.text(formulario.tratamiento || 'N/A', 25, 142, { maxWidth: 160 });

    // --- 4. Pie de página estilizado ---
    doc.setFillColor(...colorPrimario);
    doc.rect(0, 260, 210, 37, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text("Av. Juan de Dios Bátiz s/n, Gustavo A. Madero | RFC: PATS-260621-XYZ", 105, 275, { align: "center" });
    doc.text("¡Gracias por confiar en Patitas Sanas para el cuidado de tu mascota!", 105, 282, { align: "center" });

    doc.save(`Receta_${citaSeleccionada.mascotas?.nombre}.pdf`);
};

  const guardarConsulta = async () => {
    if (!formulario.diagnostico) {
      setMensaje("⚠️ El diagnóstico es obligatorio.");
      return;
    }
    const { error } = await supabase.from("historial_medico").insert([{
      id_mascota: citaSeleccionada.id_mascota,
      id_veterinario: veterinario.id_veterinario,
      peso_kg: formulario.peso_kg || null,
      temperatura_c: formulario.temperatura_c || null,
      sintomas: formulario.sintomas,
      diagnostico: formulario.diagnostico,
      tratamiento: formulario.tratamiento,
      notas_adicionales: formulario.notas_adicionales,
    }]);
    
    if (error) {
      setMensaje("❌ Error: " + error.message);
    } else {
      await supabase.from("citas").update({ estado: "Completada" }).eq("id_cita", citaSeleccionada.id_cita);
      setMensaje("✅ Consulta guardada correctamente.");
      cargarCitas(veterinario.id_veterinario);
    }
  };

  const cerrarEvaluacion = () => {
    setCitaSeleccionada(null);
    setMensaje("");
    setFormulario({ peso_kg: "", temperatura_c: "", sintomas: "", diagnostico: "", tratamiento: "", notas_adicionales: "" });
  };

  // Cálculos para las tarjetas
  const citasHoy = citas.length;
  const completadas = citas.filter(c => c.estado === "Completada").length;
  const cirugias = citas.filter(c => c.motivo.toLowerCase().includes("cirugía")).length;

  return (
    <div className="vet-wrapper">
      {/* BARRA LATERAL (Idéntica a tu captura) */}
      <aside className="vet-sidebar">
        <h2>Patitas<span>Sanas</span></h2>
        <ul className="nav-menu">
          <li><a href="#" className="active">📅 <span>Mi Agenda</span></a></li>
        </ul>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="main-content">
        <div className="header-main">
          <div>
            <h1>Bienvenido, {veterinario?.nombre_completo}</h1>
            <p>Panel de Control Veterinario</p>
          </div>
          <button onClick={handleLogout} className="btn-logout">Cerrar Sesión</button>
        </div>

        {/* TARJETAS DE RESUMEN (Idénticas a tu captura) */}
        <div className="stats-grid">
          <div className="stat-card">
            <h4>CITAS DE HOY</h4>
            <div className="value">{citasHoy.toString().padStart(2, '0')}</div>
          </div>
          <div className="stat-card" style={{ borderBottom: '4px solid var(--accent)' }}>
            <h4>CIRUGÍAS</h4>
            <div className="value">{cirugias.toString().padStart(2, '0')}</div>
          </div>
          <div className="stat-card">
            <h4>COMPLETADAS</h4>
            <div className="value">{completadas.toString().padStart(2, '0')}</div>
          </div>
        </div>

        {/* RENDERIZADO CONDICIONAL: AGENDA o EVALUACIÓN */}
        {!citaSeleccionada ? (
          /* VISTA 1: CRONOGRAMA COMPLETO */
          <section className="agenda-container">
            <div className="agenda-header">
              <h2>Cronograma del Día</h2>
              <span className="date-label">
                {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>

            <div className="agenda-list">
              {citas.length === 0 ? (
                <p style={{padding: '20px', color: '#888'}}>No hay citas registradas para hoy.</p>
              ) : (
                citas.map((cita) => (
                  <div key={cita.id_cita} className={`schedule-row ${cita.estado === "Completada" ? 'completed' : ''}`}>
                    <div className="time-col">
                      {new Date(cita.fecha_hora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div className="info-col">
                      <span className={`badge ${cita.motivo.toLowerCase().includes('cirugía') ? 'badge-cirugia' : 'badge-consulta'}`}>
                        {cita.estado === "Completada" ? "COMPLETADA" : "CONSULTA GENERAL"}
                      </span>
                      <h4>{cita.mascotas?.nombre}</h4>
                      <p>Dueño: Pendiente | <strong>Motivo:</strong> {cita.motivo}</p>
                    </div>
                    <div className="action-col">
                      <button 
                        className={`btn-atender ${cita.estado === "Completada" ? "btn-editar" : ""}`}
                        onClick={() => setCitaSeleccionada(cita)}
                        style={{ pointerEvents: 'auto', opacity: 1 }}
                      >
                        {cita.estado === "Completada" ? "Editar" : "Atender"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        ) : (
          /* VISTA 2: ÁREA DE EVALUACIÓN Y FORMULARIO */
          <section className="evaluacion-container">
            <div className="evaluacion-header">
              <h2>🩺 Evaluación Médica: {citaSeleccionada.mascotas?.nombre}</h2>
              <button className="btn-volver" onClick={cerrarEvaluacion}>← Volver a la Agenda</button>
            </div>

            <div className="evaluacion-split">
              {/* Lado Izquierdo: Historial */}
              <div className="vet-historial-box">
                <h3>📖 Historial Previo</h3>
                <div className="historial-lista">
                  {historialMascota.length === 0 ? (
                    <p>No hay registros médicos anteriores para esta mascota.</p>
                  ) : (
                    historialMascota.map((reg, idx) => (
                      <div key={idx} className="historial-item">
                        <strong>{new Date(reg.created_at).toLocaleDateString()} - Dr. {reg.veterinarios?.nombre_completo}</strong>
                        <p>{reg.diagnostico}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Lado Derecho: Formulario */}
              <div className="vet-form-box">
                <h3>📝 Redactar Consulta Actual</h3>
                <div className="form-grid">
                  <input type="number" placeholder="Peso (kg)" value={formulario.peso_kg} onChange={(e) => setFormulario({ ...formulario, peso_kg: e.target.value })} />
                  <input type="number" placeholder="Temp (°C)" value={formulario.temperatura_c} onChange={(e) => setFormulario({ ...formulario, temperatura_c: e.target.value })} />
                </div>
                <textarea placeholder="Síntomas..." value={formulario.sintomas} onChange={(e) => setFormulario({ ...formulario, sintomas: e.target.value })} />
                <textarea placeholder="Diagnóstico *" value={formulario.diagnostico} onChange={(e) => setFormulario({ ...formulario, diagnostico: e.target.value })} />
                <textarea placeholder="Tratamiento / Receta..." value={formulario.tratamiento} onChange={(e) => setFormulario({ ...formulario, tratamiento: e.target.value })} />
                
                <div className="form-actions">
                  <button className="btn-save" onClick={guardarConsulta}>Guardar Consulta</button>
                  <button className="btn-pdf" onClick={generarRecetaPDF}>Descargar PDF</button>
                </div>
                {mensaje && <p className="form-msg">{mensaje}</p>}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}