# 🐾 Veterinaria Patitas Sanas — Documentación de Base de Datos

> Sistema de Gestión Clínica Veterinaria · Versión 1.0  
> Única sucursal: Colonia Emiliano Zapata, Los Reyes La Paz

---

## Índice

1. [Introducción y Planteamiento del Problema](#1-introducción-y-planteamiento-del-problema)
   - [1.1 Descripción de la Problemática](#11-descripción-de-la-problemática)
   - [1.2 Levantamiento de Requerimientos](#12-levantamiento-de-requerimientos)
2. [Diseño Conceptual y Arquitectura de Datos](#2-diseño-conceptual-y-arquitectura-de-datos)
   - [2.1 Identificación de Entidades](#21-identificación-de-entidades)
   - [2.2 Relaciones y Cardinalidades](#22-relaciones-y-cardinalidades)
   - [2.3 Jerarquía ISA](#23-jerarquía-isa-especialización--generalización)
   - [2.4 Entidades Débiles y Dependencias](#24-entidades-débiles-y-dependencias)
   - [2.5 Diagrama EER](#25-diagrama-eer)
3. [Modelo Relacional](#3-modelo-relacional)
   - [3.1 Estrategia de Transformación](#31-estrategia-de-transformación)
   - [3.2 Tablas Resultantes del Esquema Relacional](#32-tablas-resultantes-del-esquema-relacional)
   - [3.3 Diagrama Relacional](#33-diagrama-relacional)
4. [Stack Tecnológico](#4-stack-tecnológico)

---

## 1. Introducción y Planteamiento del Problema

Este documento presenta la documentación técnica del sistema de gestión veterinaria Patitas Sanas, desarrollado como proyecto final para la materia de Bases de Datos.

### 1.1 Descripción de la Problemática

La **Veterinaria Patitas Sanas**, dirigida por el **Dr. Alejandro Ortega López**, operaba hasta la implementación de este sistema bajo un modelo completamente manual: los registros de pacientes se llevaban en libretas físicas y hojas de cálculo sueltas sin ningún esquema formal. Este modelo generaba tres consecuencias críticas:

- **Pérdida de historiales médicos**: Sin un repositorio centralizado, la información clínica de las mascotas (diagnósticos, tratamientos, vacunas) se extraviaba o quedaba incompleta.
- **Desorganización de la agenda**: La programación de citas se realizaba sin trazabilidad, provocando empalmes, citas duplicadas y falta de seguimiento del estado de cada atención.
- **Riesgo en situaciones de emergencia**: La imposibilidad de localizar rápidamente los datos de contacto de un tutor ante una urgencia clínica representaba un riesgo real para la vida de las mascotas.

Este proyecto resuelve la problemática mediante un **esquema relacional normalizado** que digitaliza y estructura la operación completa de la clínica: registro de tutores y mascotas, agenda de citas, historial clínico, control de vacunación/desparasitación y registro de pagos.

---

### 1.2 Levantamiento de Requerimientos

Los siguientes requerimientos fueron extraídos directamente de la entrevista con el **Dr. Alejandro Ortega López**:

**Requerimientos Generales y de Acceso**

- El sistema debe soportar al menos dos **perfiles de usuario**: `veterinario` y `recepcionista`, cada uno con responsabilidades diferenciadas dentro del flujo de atención.
- El sistema está diseñado para operar en una **única sucursal**.
- Debe existir un catálogo de **servicios** ofrecidos (consulta, cirugía, rayos X, ultrasonido, cremación, entre otros).

**Módulo de Tutores (Clientes)**

- Registrar a cada responsable como **Tutor**, almacenando: nombre completo, dirección, correo electrónico, número(s) de teléfono y fecha de registro.
- Un tutor puede tener **una o varias mascotas** registradas; cada mascota pertenece a un único tutor.

**Módulo de Mascotas (Pacientes)**

- Generar un **ID único** (`id_mascota`) por cada mascota registrada.
- Registrar: nombre, especie, raza, sexo, edad y un identificador de carnet de salud (`id_uk_carnet`).
- Restringir las **especies válidas** a: `'reptil'`, `'felino'`, `'canino'` y `'ave'`, excluyendo ganado y animales exóticos mayores (restricción `CHECK` en la columna `especie`).

**Módulo de Citas y Agenda**

- Registrar citas con: fecha, hora, motivo, monto y referencia al veterinario que atenderá.
- La tabla `agenda` vincula de forma ternaria a la `cita`, la `recepcionista` que la programa y el `tutor` que la solicita.
- Permitir atenciones **sin cita previa** (walk-in), así como clasificar el estado de cada atención.

**Módulo de Servicios / Historial Clínico**

- Cada servicio (`servicio`) está asociado a una cita específica (relación 1:1) y a una mascota.
- El tipo de servicio está restringido mediante `CHECK` a: `'consulta'`, `'cirugia'`, `'rayos x'`, `'ultrasonido'` y `'creamacion'`.
- Registrar el **motivo** de cada servicio.

**Módulo de Vacunación y Desparasitación**

- Guardar el historial de **vacunas** (`vacuna`) por mascota: tipo de vacuna, fecha de aplicación y fecha de próxima dosis.
- Guardar el historial de **desparasitaciones** (`desparasitacion`) por mascota: producto y fecha de aplicación.
- Estos registros permiten al sistema calcular y avisar sobre próximas dosis.

**Módulo de Pagos**

- Registrar el **monto** de cada cita/servicio con su fecha.
- Registrar el **método de pago** (efectivo, tarjeta, transferencia).
- El campo `id_uk_transaccion` en la tabla `cita` prevé la integración futura con un sistema de facturación formal.

---

## 2. Diseño Conceptual y Arquitectura de Datos

### 2.1 Identificación de Entidades

La siguiente tabla documenta **todas** las tablas declaradas en el script SQL y su rol dentro del dominio veterinario:

| Entidad (Tabla) | Descripción |
|---|---|
| **`empleado`** | Entidad padre (supertipo) de todo el personal. Almacena los atributos compartidos: `id_empleado`, `nombre`, `telefono` y `rfc`. Actúa como base de la jerarquía ISA. |
| **`veterinario`** | Especialización de `empleado`. Extiende al personal médico con `cedula_profesional` y `especialidad`. Su PK (`id_empleado`) es simultáneamente FK hacia `empleado`. |
| **`recepcionista`** | Especialización de `empleado`. Representa al personal administrativo. Incorpora `id_caja` como PK propia y mantiene `id_empleado` como FK hacia `empleado`. |
| **`tutor`** | Entidad independiente que representa al dueño o responsable legal de una o varias mascotas. Almacena datos de contacto: `nombre`, `direccion`, `correo_electronico`, `telefono` y `fecha_de_registo`. |
| **`mascota`** | Entidad central del sistema clínico. Representa al paciente. Almacena datos biográficos (`nombre`, `especie`, `sexo`, `edad`) y referencia su carnet de salud mediante `id_uk_carnet`. |
| **`tiene`** | Tabla asociativa (relación N:M) que vincula a `tutor` con `mascota`, formalizando la propiedad o tutela de uno o varios animales. |
| **`cita`** | Registra el encuentro programado entre un paciente y el veterinario. Contiene `fecha`, `hora`, `monto`, referencia al `veterinario` y un campo único `id_uk_transaccion` para pagos. |
| **`agenda`** | Tabla asociativa ternaria que une a `cita`, `recepcionista` y `tutor`. Materializa el acto administrativo de agendar una cita: quién la programa, para quién y cuándo. |
| **`servicio`** | Representa el acto médico o procedimiento realizado durante una cita. Tiene relación 1:1 con `cita` y N:1 con `mascota`. Restringe los tipos válidos mediante `CHECK`. |
| **`vacuna`** | Entidad débil por existencia. Registra cada vacuna aplicada a una mascota: tipo, `fecha_aplicacion` y `proxima_dosis` para control preventivo. Depende de `mascota`. |
| **`desparasitacion`** | Entidad débil por existencia. Registra cada desparasitación aplicada a una mascota con su `fecha_aplicacion`. Depende de `mascota`. |

---

### 2.2 Relaciones y Cardinalidades

Las siguientes relaciones se deducen **estrictamente** de las cláusulas `FOREIGN KEY` del script SQL:

| Relación | Tipo | Cardinalidad (Min, Max) | Descripción |
|---|---|---|---|
| **`empleado`** → **`veterinario`** | Especialización ISA (herencia de PK) | (0, 1) : (1, 1) | Un empleado puede especializarse como veterinario. El `id_empleado` en `veterinario` es PK y FK simultánea. |
| **`empleado`** → **`recepcionista`** | Especialización ISA (herencia de PK) | (0, 1) : (1, 1) | Un empleado puede especializarse como recepcionista. El `id_empleado` en `recepcionista` es FK con restricción `UNIQUE NOT NULL`. |
| **`tutor`** — **`mascota`** | N:M (vía `tiene`) | (0, N) : (1, 1) | Un tutor puede tener cero o muchas mascotas; una mascota pertenece a exactamente un tutor. La tabla `tiene` materializa esta relación. |
| **`veterinario`** → **`cita`** | 1:N | (1, 1) : (0, N) | Un veterinario atiende muchas citas; cada cita es asignada a exactamente un veterinario (`id_empleado` FK en `cita`). |
| **`cita`** → **`servicio`** | 1:1 | (1, 1) : (0, 1) | Cada cita genera a lo sumo un registro de servicio/acto médico. La columna `id_cita` en `servicio` es `UNIQUE`, garantizando cardinalidad máxima de 1. |
| **`mascota`** → **`servicio`** | 1:N | (1, 1) : (0, N) | Una mascota puede ser objeto de múltiples servicios a lo largo del tiempo. `id_uk_mascota` en `servicio` es FK hacia `mascota`. |
| **`cita`** + **`recepcionista`** + **`tutor`** → **`agenda`** | Relación ternaria N:M:M | (0, N) : (0, N) : (0, N) | La tabla `agenda` es una entidad asociativa ternaria. Su PK compuesta (`id_cita`, `id_empleado`, `id_cliente`) impide duplicados y vincula los tres participantes del acto de agendar. |
| **`mascota`** → **`vacuna`** | 1:N | (1, 1) : (0, N) | Una mascota acumula múltiples registros de vacunación. `id_mascota` en `vacuna` es FK; sin la mascota, la vacuna no tiene entidad propia. |
| **`mascota`** → **`desparasitacion`** | 1:N | (1, 1) : (0, N) | Una mascota puede tener múltiples desparasitaciones registradas. `id_mascota` en `desparasitacion` es FK; igual que `vacuna`, depende de la existencia de la mascota. |

---

### 2.3 Jerarquía ISA (Especialización / Generalización)

El personal de la clínica se modela mediante una **jerarquía de especialización** de tres niveles, implementada con el patrón de **tabla por subtipo**:

```
empleado  (supertipo)
   ├── veterinario  (subtipo A)
   └── recepcionista  (subtipo B)
```

**Implementación física:**

- La tabla **`empleado`** actúa como supertipo y concentra los atributos compartidos: `id_empleado` (PK), `nombre`, `telefono` y `rfc`.
- La tabla **`veterinario`** usa `id_empleado` como **PK y FK simultánea** hacia `empleado`. Añade los atributos diferenciadores: `cedula_profesional` y `especialidad`.
- La tabla **`recepcionista`** usa `id_empleado` como FK con restricción `UNIQUE NOT NULL`, y declara `id_caja` como su propia PK. Esto refleja que la recepcionista tiene una identidad adicional vinculada a su caja de cobro.

**Restricción `DEFERRABLE INITIALLY IMMEDIATE`:**

Todas las FK de la jerarquía se declaran con `DEFERRABLE INITIALLY IMMEDIATE`. Esto significa que la validación de integridad referencial es **inmediata por defecto** (se evalúa al finalizar cada sentencia DML), pero puede diferirse explícitamente dentro de una transacción usando `SET CONSTRAINTS DEFERRED`. Esta flexibilidad permite insertar primero el registro en `empleado` y luego en `veterinario` o `recepcionista` dentro de la misma transacción sin violar la FK.

**Tipo de especialización:**

- **Disjunta**: Un empleado no puede ser simultáneamente `veterinario` y `recepcionista` en el diseño actual, dado que cada subtipo ocupa un `id_empleado` único.
- **Parcial**: No todo `empleado` requiere tener una fila correspondiente en `veterinario` ni en `recepcionista`; podría existir un empleado genérico sin subtipo asignado (por ejemplo, durante el proceso de alta).

---

### 2.4 Entidades Débiles y Dependencias

En el modelo implementado se identifican las siguientes **entidades con dependencia de existencia** o **dependencia de identidad**:

**Dependencia de existencia — `vacuna` y `desparasitacion`**

Las tablas **`vacuna`** y **`desparasitacion`** son entidades débiles respecto a **`mascota`**:

- Ambas incluyen `id_mascota` como **FK no nula**, heredado de la tabla `mascota`.
- Sin la existencia previa de una fila en `mascota`, ningún registro de vacuna ni de desparasitación puede existir. Si se eliminara una mascota, los registros asociados perderían su referencia.
- A nivel físico, la dependencia se implementa mediante la cláusula `ALTER TABLE ... ADD FOREIGN KEY (id_mascota) REFERENCES mascota(id_mascota) DEFERRABLE INITIALLY IMMEDIATE`.
- Sus claves primarias (`id_vacuna`, `id_desparasitacion`) son generadas independientemente, pero la **existencia** del registro depende del ciclo de vida de la mascota.

**Dependencia de identidad — `veterinario` y `recepcionista`**

Las tablas **`veterinario`** y **`recepcionista`** son subtypes con **dependencia de identidad** respecto a **`empleado`**:

- `veterinario` no puede tener un `id_empleado` que no exista previamente en `empleado`; su propia identidad (PK) es heredada.
- `recepcionista` mantiene el mismo patrón: su `id_empleado` debe referenciar siempre a un `empleado` existente.
- La eliminación de un registro en `empleado` sin eliminar antes su correspondiente fila en `veterinario` o `recepcionista` violaría la integridad referencial.

**Dependencia funcional — `servicio` respecto a `cita`**

La tabla **`servicio`** no puede existir de forma autónoma: su columna `id_cita` es `UNIQUE` y FK hacia `cita`. Un servicio médico solo tiene sentido en el contexto de una cita registrada, lo que convierte a `cita` en la entidad padre del acto clínico y a `servicio` en su extensión dependiente.

**Tabla asociativa pura — `tiene` y `agenda`**

Las tablas **`tiene`** y **`agenda`** no almacenan atributos propios más allá de sus claves foráneas. Su rol es exclusivamente relacionar entidades:

- **`tiene`**: PK compuesta (`id_cliente`, `id_mascota`), resuelve la relación N:M entre `tutor` y `mascota`.
- **`agenda`**: PK compuesta ternaria (`id_cita`, `id_empleado`, `id_cliente`), resuelve la relación ternaria entre `cita`, `recepcionista` y `tutor`.

---

### 2.5 Diagrama EER

<img src="https://raw.githubusercontent.com/ctlu-l/pagina-web/main/EER.drawio.png" alt="Diagrama EER" loading="lazy">

---

## 3. Modelo Relacional

### 3.1 Estrategia de Transformación

La conversión del modelo conceptual (E-R) al modelo relacional físico siguió cuatro reglas de transformación principales, aplicadas de forma explícita en el script SQL:

**Jerarquía ISA — Tabla por subtipo**

La especialización del personal se resolvió con el patrón *tabla por subtipo*: la tabla **`empleado`** centraliza los atributos compartidos (`id_empleado`, `nombre`, `telefono`, `rfc`) y actúa como supertipo. Cada subtipo genera su propia tabla con atributos exclusivos:

- **`veterinario`** hereda `id_empleado` como PK y FK simultánea, añadiendo `cedula_profesional` y `especialidad`.
- **`recepcionista`** referencia `id_empleado` como FK con restricción `UNIQUE NOT NULL`, pero declara `id_caja` como su propia PK, reflejando una identidad administrativa independiente vinculada a la caja de cobro.

Todas las FK de la jerarquía se declaran `DEFERRABLE INITIALLY IMMEDIATE`, lo que permite diferir la validación referencial dentro de una transacción para insertar primero en `empleado` y luego en el subtipo correspondiente, sin violar la integridad en ningún punto intermedio de la operación.

**Relaciones N:M — Tablas asociativas**

Las relaciones de muchos a muchos se materializaron mediante tablas puente con PK compuesta:

- **`tiene`** (`id_cliente`, `id_mascota`) resuelve la relación binaria N:M entre `tutor` y `mascota`. Su PK compuesta garantiza que una misma pareja tutor-mascota no se registre de forma duplicada.
- **`agenda`** (`id_cita`, `id_empleado`, `id_cliente`) resuelve una relación **ternaria** que vincula simultáneamente a `cita`, `recepcionista` y `tutor`. La PK de tres columnas impide que una misma combinación de cita, recepcionista y cliente se agende más de una vez.

**Relación 1:1 entre `cita` y `servicio`**

La relación uno a uno entre el evento logístico (`cita`) y el acto médico (`servicio`) se implementó propagando `id_cita` hacia `servicio` con la restricción `UNIQUE`. Esto garantiza que cada cita genera **a lo sumo un** registro de servicio: si la columna fuera solo FK sin `UNIQUE`, la cardinalidad permitiría múltiples servicios por cita, lo que violaría la semántica del modelo. La restricción `UNIQUE` es el mecanismo relacional que hace cumplir el máximo de 1.

**Entidades débiles — `vacuna` y `desparasitacion`**

Las tablas **`vacuna`** y **`desparasitacion`** no tienen existencia independiente: ambas incluyen `id_mascota` como FK obligatoria hacia `mascota`. Sus propias PK (`id_vacuna`, `id_desparasitacion`) son enteros autónomos, pero el ciclo de vida de cada registro queda ligado al de la mascota referenciada. La dependencia se implementa físicamente mediante `ALTER TABLE ... ADD FOREIGN KEY (id_mascota) REFERENCES mascota(id_mascota) DEFERRABLE INITIALLY IMMEDIATE`.

---

### 3.2 Tablas Resultantes del Esquema Relacional

| Tabla | Tipo | Descripción |
|---|---|---|
| **`empleado`** | Fuerte / Supertipo | Raíz de la jerarquía de personal. Almacena los atributos comunes a todo el personal de la clínica: `id_empleado` (PK), `nombre`, `telefono` y `rfc`. |
| **`veterinario`** | Débil por identidad / Subtipo | Especialización médica de `empleado`. Su PK `id_empleado` es heredada como FK desde `empleado`. Extiende el perfil con `cedula_profesional` y `especialidad`. |
| **`recepcionista`** | Débil por identidad / Subtipo | Especialización administrativa de `empleado`. Declara `id_caja` como PK propia y referencia `id_empleado` (UNIQUE NOT NULL) como FK hacia `empleado`. |
| **`cita`** | Fuerte / Transaccional | Registra el encuentro entre el paciente y el veterinario. Contiene `fecha`, `hora`, `monto`, FK hacia `veterinario` y `id_uk_transaccion` (UNIQUE) para trazabilidad de pagos futuros. |
| **`servicio`** | Débil por existencia / Extensión 1:1 | Materializa el acto médico derivado de una cita. `id_cita` es FK con restricción UNIQUE (garantiza cardinalidad 1:1). Registra el `tipo` de procedimiento (CHECK) y el `motivo`. |
| **`agenda`** | Asociativa / Ternaria N:M | Tabla puente ternaria que vincula `cita`, `recepcionista` y `tutor`. PK compuesta de tres columnas: (`id_cita`, `id_empleado`, `id_cliente`). |
| **`tutor`** | Fuerte | Entidad independiente que representa al responsable legal de las mascotas. Almacena `nombre`, `direccion`, `correo_electronico`, `telefono` y `fecha_de_registo`. |
| **`tiene`** | Asociativa N:M | Tabla puente binaria entre `tutor` y `mascota`. PK compuesta (`id_cliente`, `id_mascota`) formaliza la relación de tutela. |
| **`mascota`** | Fuerte | Entidad central del sistema clínico (el paciente). Almacena `nombre`, `especie` (CHECK), `sexo`, `edad` y `id_uk_carnet` (UNIQUE). |
| **`vacuna`** | Débil por existencia | Historial de vacunación por mascota. Depende de `mascota` vía FK `id_mascota`. Registra `tipo`, `fecha_aplicacion` y `proxima_dosis`. |
| **`desparasitacion`** | Débil por existencia | Historial de desparasitaciones por mascota. Depende de `mascota` vía FK `id_mascota`. Registra únicamente `fecha_aplicacion` en el esquema actual. |

---

### 3.3 Diagrama Relacional

<img src="https://raw.githubusercontent.com/ctlu-l/pagina-web/main/relacional.png" alt="Diagrama Relacional" loading="lazy">

---

## 4. Stack Tecnológico

La interfaz web fue construida con un enfoque en la usabilidad y la presentación clara de la información, con un diseño responsivo que se adapta a dispositivos móviles y de escritorio.

**Tecnologías principales**

- **Frontend — React**: La interfaz se desarrolló con React, aprovechando su arquitectura basada en componentes para estructurar las vistas de forma modular y reutilizable.
- **Backend — Node.js**: Se utilizó Node.js para la lógica del servidor y la gestión de dependencias del proyecto.
- **Base de datos — Supabase**: Se eligió Supabase como backend como servicio (BaaS) por proporcionar una base de datos PostgreSQL gestionada con API RESTful automática, lo que simplifica las operaciones CRUD desde el cliente. Incluye además Row Level Security y una capa gratuita adecuada para proyectos académicos y prototipos.

**Despliegue**

- **GitHub Pages**: Hospedaje del sitio estático del frontend.
- **Vercel**: Plataforma de despliegue continuo integrada con el repositorio, utilizada para previsualización y producción.

---

🔗 Enlaces

Código Fuente: Repositorio GitHub Demo en Vivo:https://patitas-sanas.vercel.app/

Repositorio central, visitalo en la siguiente liga: https://github.com/gabrielhuav/DB-Coursework-2026-2