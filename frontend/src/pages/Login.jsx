import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import './Login.css'; 

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [cargando, setCargando] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailLimpio = email.trim();

    // --- CUENTAS ESTÁTICAS DEL SISTEMA ---
    
    // 1. Administrador
    if (emailLimpio === 'admin@patitassanas.com' && password === 'Admin1234') {
      localStorage.setItem('currentUser', JSON.stringify({ email: emailLimpio, rol: 'Administrador' }));
      navigate('/admin');
      return; 
    }

    // 2. Recepcionista
    if (emailLimpio === 'marirep@gmail.com' && password === 'Spam18091809.') {
      localStorage.setItem('currentUser', JSON.stringify({ email: emailLimpio, rol: 'Recepcionista' }));
      // Redirige a /recepcion que está definida en tu App.jsx
      navigate('/recepcion');
      return; 
    }

    // 3. Veterinario
    if (emailLimpio === 'veterinario@demo.com' && password === 'vet123') {
      localStorage.setItem('currentUser', JSON.stringify({ email: emailLimpio, rol: 'Veterinario' }));
      // Redirige a /demo-veterinario según tu App.jsx
      navigate('/demo-veterinario');
      return; 
    }

    setCargando(true);
    
    // Simulamos un pequeño tiempo de carga para los clientes
    setTimeout(() => {
      const rutaDestino = location.state?.returnTo || '/portal-cliente';
      const usuariosDB = JSON.parse(localStorage.getItem('patitas_usuarios') || '[]');

      if (!isLogin) {
        // --- REGISTRO SIMULADO PARA CLIENTES ---
        if (!nombreCompleto) {
          alert('Por favor ingresa tu nombre completo.');
          setCargando(false);
          return;
        }
        
        // Verificar si el correo ya existe
        if (usuariosDB.find(u => u.email === emailLimpio)) {
          alert('Este correo ya está registrado.');
          setCargando(false);
          return;
        }

        // Crear nuevo usuario local
        const nuevoUsuario = { email: emailLimpio, password, nombreCompleto, telefono, rol: 'Cliente' };
        usuariosDB.push(nuevoUsuario);
        localStorage.setItem('patitas_usuarios', JSON.stringify(usuariosDB));
        
        // Iniciar sesión automáticamente
        localStorage.setItem('currentUser', JSON.stringify(nuevoUsuario));
        
        alert('¡Cuenta creada con éxito!');
        navigate(location.state?.returnTo ? rutaDestino : '/agendar-cita');

      } else {
        // --- INICIO DE SESIÓN SIMULADO PARA CLIENTES ---
        const usuarioEncontrado = usuariosDB.find(u => u.email === emailLimpio && u.password === password);
        
        if (usuarioEncontrado) {
          // Guardar sesión activa
          localStorage.setItem('currentUser', JSON.stringify(usuarioEncontrado));
          navigate(rutaDestino);
        } else {
          alert('Credenciales incorrectas o el usuario no existe.');
        }
      }
      setCargando(false);
    }, 600);
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2>Portal de Acceso</h2>

        <div className="tabs">
          <button className={isLogin ? 'active' : ''} onClick={() => setIsLogin(true)}>
            Iniciar Sesión
          </button>
          <button className={!isLogin ? 'active' : ''} onClick={() => setIsLogin(false)}>
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <>
              <div className="input-group">
                <label>Nombre Completo *</label>
                <input 
                  type="text" 
                  placeholder="Tu nombre completo" 
                  value={nombreCompleto} 
                  onChange={(e) => setNombreCompleto(e.target.value)} 
                  required 
                />
              </div>
              <div className="input-group">
                <label>Teléfono (opcional)</label>
                <input 
                  type="tel" 
                  placeholder="10 dígitos" 
                  value={telefono} 
                  onChange={(e) => setTelefono(e.target.value)} 
                />
              </div>
            </>
          )}

          <div className="input-group">
            <label>Correo Electrónico</label>
            <input 
              type="email" 
              placeholder="ejemplo@correo.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="input-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              placeholder="Tu contraseña" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" className="btn-submit" disabled={cargando}>
            {cargando ? 'Cargando...' : (isLogin ? 'Entrar' : 'Crear Cuenta')}
          </button>
        </form>

        <div className="login-footer">
          <Link to="/">← Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;