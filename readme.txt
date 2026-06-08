README Para el Profe

## Proyecto 7: Patitas Sanas - Veterinaria 
Sistema web para una clínica veterinaria enfocado en realizar citas en línea, control de invetarios, 
manejo de personal e informacion sobre los servicios proporcionados.

### 🛠️ Tecnologías
* Backend: Node.js y BaaS (Supabase)
* Base de Datos: Supabase (PostgreSQL)
* Frontend: HTML, CSS, JavaScript, React.js con Vite
* Despliegue: Vercel y GitHub pages

### ✨ Funcionalidades principales
* Registro e inicio de sesión de usuarios.
* Portal de clientes interactivo para gestionar perfiles e historial de mascotas.
* Agendamiento automatizado de citas médicas por especialidad y horario en tiempo real.
* Panel administrativo interno para el control de la agenda y expedientes.

<details>
<summary>🖼️ Ver Imagenes del Proyecto</summary>

| Pantalla de Inicio |
|---|
| <img loading="lazy" src="./fotos/inicio.png" width="800"/> |

| Servicios |
|---|
| <img loading="lazy" src="./fotos/servicios.png" width="800"/> |

| Login |
|---|
| <img loading="lazy" src="./fotos/login.png" width="800"/> |

| Panel de Citas |
|---|
| <img loading="lazy" src="./fotos/cita-1.png" width="800"/> |
| <img loading="lazy" src="./fotos/cita-2.png" width="800"/> |
| <img loading="lazy" src="./fotos/cita-3.png" width="800"/> |

| Clientes |
|---|
| <img loading="lazy" src="./fotos/cliente.png" width="800"/> |

| Inventario |
|---|
| <img loading="lazy" src="./fotos/inv.png" width="800"/> |

| Recepcionista |
|---|
| <img loading="lazy" src="./fotos/rec.png" width="800"/> |

| Administrador |
|---|
| <img loading="lazy" src="./fotos/admin-1.png" width="800"/> |
| <img loading="lazy" src="./fotos/admin-2.png" width="800"/> |

| Veterinario |
|---|
| <img loading="lazy" src="./fotos/vet.png" width="800"/> |

</details>

### 📂estructura general:
```
  frontend/
├── .gitignore
├── README.md
├── eslint.config.js       # Reglas de estilo y calidad de código para consistencia.
├── index.html             # Punto de entrada principal; monta el bundle de React.
├── package-lock.json      # Registro de versiones exactas de dependencias instaladas.
├── package.json           # Manifiesto de dependencias y scripts de ejecución.
├── vite.config.js         # Configuración del empaquetador (Vite) y optimizaciones.
├── src/
│   ├── supabase.js             # Configuración de conexión a Supabase
│   ├── index.css               # Estilos globales
│   ├── main.jsx                # Punto de entrada de la app en React
│   ├── App.css                 # Estilos del componente principal
│   ├── App.jsx                 # Componente raíz y configuración de rutas
│   ├── Login.css               # Estilos para la pantalla de inicio de sesión
│   ├── Login.jsx               # Lógica de la pantalla de inicio de sesión
│   ├── assets/                 # Recursos estáticos
│   └── pages/                  # Componentes de las distintas vistas
│       ├── AgendarCita.css
│       ├── AgendarCita.jsx     # Formulario de creación de nuevas citas
│       ├── Citas.jsx           # Gestión global de citas en la clínica
│       ├── Clientes.jsx        # CRUD y directorio de clientes (dueños)
│       ├── Inicio.css
│       ├── Inicio.jsx          # Landing page (servicios, contacto, navegación)
│       ├── Mascotas.jsx        # Vinculación y gestión de mascotas por dueño
│       ├── Medico.css
│       ├── Medico.jsx          # Panel de control médico (agenda y estados)
│       ├── MisCitas.css
│       ├── MisCitas.jsx        # Historial y gestión de citas del cliente
│       ├── MisMascotas.jsx     # Registro y perfil de las mascotas del cliente
│       ├── PortalCliente.css
│       ├── PortalCliente.jsx   # Dashboard centralizado para el usuario cliente
│       ├── Recepcion.css
│       └── Recepcion.jsx       # Panel operativo: caja, inventario y turnos
```


### Usuarios:
### Usuario de Prueba: 
* Correo: usuariodemo@gmail.com
* Contraseña: usuario1234

### Recepcionista: 
* Correo: marirep@gmail.com
* Contraseña: Spam18091809.

### Veterinario
* Correo: veterinario@demo.com
* Contraseña: vet123

### Admin: 
Correo: admin@patitassanas.com
Contraseña: Admin1234

### 🔗 Enlaces
* Código Fuente: [Repositorio GitHub](https://github.com/Jaely19/Patitas-Sanas)
* Demo en Vivo: [Patitas Sanas Web](https://patitas-sanas.vercel.app)



