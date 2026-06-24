import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import "./Medico.css";

export default function Medico() {
  const navigate = useNavigate();
  
  const [veterinario, setVeterinario] = useState(null);
  const [citas, setCitas] = useState([]);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [historialMascota, setHistorialMascota] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [formulario, setFormulario] = useState({
    nombre_cliente: "", peso_kg: "", temperatura_c: "", costo_consulta: "",
    sintomas: "", diagnostico: "", tratamiento: "", notas_adicionales: "",
  });
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const mockVeterinario = {
      id_veterinario: 1, 
      email: "vetalejandro@gmail.com",
      nombre_completo: "Dr. Alejandro",
      especialidad: "General" 
    };
    setVeterinario(mockVeterinario);
  }, []);

  useEffect(() => {
    if (veterinario) {
      cargarCitas(veterinario.id_veterinario, fechaSeleccionada);
    }
  }, [veterinario, fechaSeleccionada]);

  const cargarCitas = async (id, fecha) => {
    const fechaInicio = new Date(fecha);
    fechaInicio.setHours(0, 0, 0, 0);
    const inicio = fechaInicio.toISOString();

    const fechaFin = new Date(fecha);
    fechaFin.setHours(23, 59, 59, 999);
    const fin = fechaFin.toISOString();

    const { data, error } = await supabase
      .from("citas")
      .select("*, mascotas(nombre, especie)") 
      .eq("id_veterinario", id)
      .gte("fecha_hora", inicio)
      .lte("fecha_hora", fin)
      .order("fecha_hora", { ascending: true });
      
    if (error) {
        console.error("Error de Supabase:", error.message);
    }
      
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

      if (!error && data) {
        setHistorialMascota(data);
        setFormulario({ 
          nombre_cliente: "",
          peso_kg: "", 
          temperatura_c: "", 
          costo_consulta: "", 
          sintomas: "", 
          diagnostico: "", 
          tratamiento: "", 
          notas_adicionales: "" 
        });
      }
    };
    cargarHistorial();
  }, [citaSeleccionada]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleFechaChange = (e) => {
    const fechaString = e.target.value;
    if (fechaString) {
      setFechaSeleccionada(new Date(fechaString + 'T00:00:00'));
    }
  };

  const cancelarCita = async (id_cita) => {
    const confirmar = window.confirm("¿Estás seguro de que deseas cancelar esta cita?");
    if (!confirmar) return;

    const { error } = await supabase
      .from("citas")
      .update({ estado: "Cancelada" })
      .eq("id_cita", id_cita);

    if (error) {
      alert("Error al cancelar la cita: " + error.message);
    } else {
      cargarCitas(veterinario.id_veterinario, fechaSeleccionada);
    }
  };

  const generarRecetaPDF = () => {
    if (!citaSeleccionada) return;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Cabecera Izquierda 
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Patitas Sanas", 20, 30);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("VENTA DE PRODUCTOS Y SERVICIOS", 20, 38);
    doc.text("VETERINARIOS", 20, 43);
    doc.text("Los reyes la paz, Estado de México", 20, 48);

    // Cabecera Derecha (Recuadros del Ticket) 
    doc.setLineWidth(0.5);
    doc.roundedRect(120, 20, 70, 25, 3, 3); // Caja principal
    doc.line(120, 28, 190, 28); 
    doc.setFillColor(0, 0, 0);
    doc.rect(120, 28, 70, 8, "F"); // Fondo negro
    doc.line(120, 36, 190, 36); 

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("RFC: PATS-260621-XYZ", 155, 26, { align: "center" });
    doc.setTextColor(255, 255, 255);
    doc.text("RECETA Y ORDEN DE PAGO", 155, 34, { align: "center" });
    doc.setTextColor(0, 0, 0);
    doc.text(`Nro. CITA-${citaSeleccionada.id_cita}`, 155, 42, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`FECHA: ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`, 155, 52, { align: "center" });

    // Información del Cliente / Paciente / Médico.
    doc.roundedRect(20, 60, 170, 22, 3, 3);
    
    // Fila 1: Cliente y Médico
    doc.setFont("helvetica", "bold");
    doc.text("CLIENTE:", 25, 68);
    doc.setFont("helvetica", "normal");
    const dueno = formulario.nombre_cliente || "Público en General";
    doc.text(dueno, 46, 68);
    
    doc.setFont("helvetica", "bold");
    doc.text("MÉDICO:", 115, 68);
    doc.setFont("helvetica", "normal");
    doc.text(veterinario?.nombre_completo || "Dr. Alejandro", 135, 68);

    // Fila 2: Paciente y Forma de Pago
    doc.setFont("helvetica", "bold");
    doc.text("PACIENTE:", 25, 76);
    doc.setFont("helvetica", "normal");
    doc.text(`${citaSeleccionada.mascotas?.nombre} (${citaSeleccionada.mascotas?.especie})`, 48, 76);
    
    doc.setFont("helvetica", "bold");
    doc.text("FORMA DE PAGO:", 115, 76);
    doc.setFont("helvetica", "normal");
    doc.text("En Recepción", 149, 76);

    // Datos Médicos (Receta) 
    doc.setFont("helvetica", "bold");
    doc.text("DATOS MÉDICOS", 20, 92); 
    doc.setLineWidth(0.2);
    doc.line(20, 94, 190, 94); 

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Diagnóstico:", 20, 102); 
    doc.setFont("helvetica", "normal");
    doc.text(formulario.diagnostico || 'N/A', 45, 102, { maxWidth: 145 });

    doc.setFont("helvetica", "bold");
    doc.text("Tratamiento:", 20, 117); 
    doc.setFont("helvetica", "normal");
    doc.text(formulario.treatment || formulario.tratamiento || 'N/A', 45, 117, { maxWidth: 145 });

    // 5. Tabla de Cobro 
    const tableY = 145; 
    doc.setLineWidth(0.5);
    doc.rect(20, tableY, 170, 8); 
    doc.setFont("helvetica", "bold");
    doc.text("CANT.", 30, tableY + 5.5, { align: "center" });
    doc.text("DESCRIPCIÓN", 80, tableY + 5.5, { align: "center" });
    doc.text("P. UNIT", 150, tableY + 5.5, { align: "center" });
    doc.text("IMPORTE", 175, tableY + 5.5, { align: "center" });

    // Líneas de columnas
    doc.rect(20, tableY, 20, 20); 
    doc.rect(40, tableY, 95, 20); 
    doc.rect(135, tableY, 30, 20); 
    doc.rect(165, tableY, 25, 20); 

    // Fila de servicio
    const costoTotal = parseFloat(formulario.costo_consulta) || 0;
    doc.setFont("helvetica", "normal");
    doc.text("1", 30, tableY + 13, { align: "center" });
    doc.text("Consulta Veterinaria y Tratamiento", 45, tableY + 13);
    doc.text(`$${costoTotal.toFixed(2)}`, 150, tableY + 13, { align: "center" });
    doc.text(`$${costoTotal.toFixed(2)}`, 175, tableY + 13, { align: "center" });

    // 6. Totales y Desglose 
    const subtotal = costoTotal / 1.16; 
    const iva = costoTotal - subtotal;

    const totalsY = tableY + 25;
    doc.rect(135, totalsY, 55, 24); 
    doc.line(135, totalsY + 8, 190, totalsY + 8);
    doc.line(135, totalsY + 16, 190, totalsY + 16);
    doc.setFillColor(0, 0, 0);
    doc.rect(135, totalsY + 16, 55, 8, "F"); 

    doc.setFont("helvetica", "bold");
    doc.text("SUBTOTAL", 138, totalsY + 5.5);
    doc.text("IVA (16%)", 138, totalsY + 13.5);
    doc.setTextColor(255, 255, 255);
    doc.text("TOTAL", 138, totalsY + 21.5);

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(`$${subtotal.toFixed(2)}`, 187, totalsY + 5.5, { align: "right" });
    doc.text(`$${iva.toFixed(2)}`, 187, totalsY + 13.5, { align: "right" });
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(`$${costoTotal.toFixed(2)}`, 187, totalsY + 21.5, { align: "right" });

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Representación impresa de una receta y orden de pago electrónica.", 20, totalsY + 10);
    doc.text("Para el pago, presenta este comprobante impreso o digital en mostrador.", 20, totalsY + 14);
    doc.text("¡Gracias por confiar en Patitas Sanas para el cuidado de tu mascota!", 20, totalsY + 18);

    doc.save(`OrdenPago_Receta_${citaSeleccionada.mascotas?.nombre}.pdf`);
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
      cargarCitas(veterinario.id_veterinario, fechaSeleccionada);
    }
  };

  const cerrarEvaluacion = () => {
    setCitaSeleccionada(null);
    setMensaje("");
    setFormulario({ nombre_cliente: "", peso_kg: "", temperatura_c: "", costo_consulta: "", sintomas: "", diagnostico: "", tratamiento: "", notas_adicionales: "" });
  };

  const citasHoy = citas.length;
  const completadas = citas.filter(c => c.estado === "Completada").length;
  const cirugias = citas.filter(c => c.motivo.toLowerCase().includes("cirugía")).length;

  return (
    <div className="vet-wrapper">
      <aside className="vet-sidebar">
        <h2>Patitas<span>Sanas</span></h2>
        <ul className="nav-menu">
          <li><a href="#" className="active">📅 <span>Mi Agenda</span></a></li>
        </ul>
      </aside>

      <main className="main-content">
        <div className="header-main">
          <div>
            <h1>Bienvenido, {veterinario?.nombre_completo}</h1>
            <p>Panel de Control Veterinario</p>
          </div>
          <button onClick={handleLogout} className="btn-logout">Cerrar Sesión</button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h4>CITAS PROGRAMADAS</h4>
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

        {!citaSeleccionada ? (
          <section className="agenda-container">
            <div className="agenda-header">
              <h2>Cronograma Diario</h2>
              <div className="agenda-header-controls">
                <input 
                  type="date" 
                  className="calendar-input"
                  value={fechaSeleccionada.toISOString().split('T')[0]} 
                  onChange={handleFechaChange}
                />
                <span className="date-label">
                  {fechaSeleccionada.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="agenda-list">
              {citas.length === 0 ? (
                <p style={{padding: '20px', color: '#888'}}>No hay citas registradas para este día.</p>
              ) : (
                citas.map((cita) => (
                  <div key={cita.id_cita} className={`schedule-row ${cita.estado === "Completada" ? 'completed' : ''}`}>
                    <div className="time-col">
                      {new Date(cita.fecha_hora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div className="info-col">
                      <span className={`badge 
                        ${cita.estado === "Cancelada" ? 'badge-cancelada' : 
                          cita.motivo.toLowerCase().includes('cirugía') ? 'badge-cirugia' : 'badge-consulta'}`}>
                        {cita.estado === "Completada" ? "COMPLETADA" : cita.estado === "Cancelada" ? "CANCELADA" : "CONSULTA GENERAL"}
                      </span>
                      <h4>{cita.mascotas?.nombre}</h4>
                      <p>Dueño: {cita.clientes?.nombre_completo || cita.mascotas?.clientes?.nombre_completo || "Pendiente"} | <strong>Motivo:</strong> {cita.motivo}</p>
                    </div>
                    
                    <div className="action-col">
                      <button 
                        className={`btn-atender ${cita.estado === "Completada" ? "btn-editar" : ""}`}
                        onClick={() => setCitaSeleccionada(cita)}
                        disabled={cita.estado === "Cancelada"}
                        style={{ pointerEvents: 'auto', opacity: cita.estado === "Cancelada" ? 0.5 : 1 }}
                      >
                        {cita.estado === "Completada" ? "Ver/Editar" : "Atender"}
                      </button>

                      <button 
                        className="btn-cancelar"
                        onClick={() => cancelarCita(cita.id_cita)}
                        disabled={cita.estado === "Completada" || cita.estado === "Cancelada"}
                        style={{ pointerEvents: 'auto' }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        ) : (
          <section className="evaluacion-container">
            <div className="evaluacion-header">
              <h2>🩺 Evaluación Médica: {citaSeleccionada.mascotas?.nombre}</h2>
              <button className="btn-volver" onClick={cerrarEvaluacion}>← Volver a la Agenda</button>
            </div>

            <div className="evaluacion-split">
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

              <div className="vet-form-box">
                <h3> Redactar Consulta Actual</h3>
                
                <input 
                  type="text" 
                  placeholder="Nombre del Dueño / Cliente" 
                  value={formulario.nombre_cliente} 
                  onChange={(e) => setFormulario({ ...formulario, nombre_cliente: e.target.value })} 
                />

                <div className="form-grid">
                  <input type="number" placeholder="Peso (kg)" value={formulario.peso_kg} onChange={(e) => setFormulario({ ...formulario, peso_kg: e.target.value })} />
                  <input type="number" placeholder="Temp (°C)" value={formulario.temperatura_c} onChange={(e) => setFormulario({ ...formulario, temperatura_c: e.target.value })} />
                </div>
                
                <textarea placeholder="Síntomas..." value={formulario.sintomas} onChange={(e) => setFormulario({ ...formulario, sintomas: e.target.value })} />
                <textarea placeholder="Diagnóstico *" value={formulario.diagnostico} onChange={(e) => setFormulario({ ...formulario, diagnostico: e.target.value })} />
                <textarea placeholder="Tratamiento / Receta..." value={formulario.tratamiento} onChange={(e) => setFormulario({ ...formulario, tratamiento: e.target.value })} />
                
                <div style={{ marginTop: '15px', marginBottom: '5px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'var(--primary)', fontSize: '14px' }}>
                    💵 Costo Total de la Consulta:
                  </label>
                  <input 
                    type="number" 
                    placeholder="Ej. 450.00" 
                    value={formulario.costo_consulta} 
                    onChange={(e) => setFormulario({ ...formulario, costo_consulta: e.target.value })} 
                    style={{ fontSize: '16px', fontWeight: '600', borderColor: 'var(--accent)' }}
                  />
                </div>
                
                <div className="form-actions">
                  <button className="btn-save" onClick={guardarConsulta}>Guardar Consulta</button>
                  <button className="btn-pdf" onClick={generarRecetaPDF}>Descargar Receta y Pago (PDF)</button>
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