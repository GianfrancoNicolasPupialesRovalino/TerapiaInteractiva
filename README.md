# YogaTerapia - Plataforma de Terapias Personalizadas

Una aplicación web fullstack que permite a instructores y pacientes gestionar y ejecutar terapias de yoga terapéutico personalizadas.

## 🧘‍♀️ Características Principales

### Para Instructores
- **Registro e inicio de sesión seguro** con validaciones JWT
- **Gestión completa de pacientes** - añadir y actualizar información
- **Creación de series terapéuticas personalizadas**:
    - Selección de tipo de terapia (Ansiedad, Artritis, Dolor de Espalda)
    - Biblioteca de posturas con más de 6 opciones por tipo
    - Configuración de orden y duración personalizada
    - Definición de sesiones recomendadas
- **Asignación de series a pacientes** (una serie activa por paciente)

### Para Pacientes
- **Inicio de sesión seguro**
- **Visualización y ejecución de series asignadas**:
    - Posturas mostradas en orden con foto y duración
    - Cronómetro integrado con función pausar/reanudar
    - Evaluación de intensidad pre y post-sesión
    - Comentarios obligatorios al finalizar

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React.js** con Vite
- **Tailwind CSS** + shadcn/ui para componentes
- **Wouter** para navegación
- **TanStack Query** para manejo de estado del servidor
- **React Hook Form** + Zod para formularios y validación

### Backend
- **Node.js** con Express.js
- **Drizzle ORM** para base de datos PostgreSQL
- **JWT** para autenticación segura
- **bcryptjs** para encriptación de contraseñas

### Base de Datos
- **PostgreSQL** con esquema completo para:
    - Usuarios (instructores y pacientes)
    - Tipos de terapia
    - Posturas con instrucciones y beneficios
    - Series terapéuticas
    - Asignaciones paciente-serie
    - Registro de sesiones

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 20+
- PostgreSQL
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/GianfrancoNicolasPupialesRovalino/TerapiaInteractiva.git
cd yogaterapia
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
   Crear archivo `.env` con:
```env
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/yogaterapia
JWT_SECRET=tu_jwt_secret_aqui
```

4. **Configurar base de datos**
```bash
# Crear la base de datos
createdb yogaterapia

# Ejecutar migraciones (push del schema)
npm run db:push
```

5. **Iniciar la aplicación**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5000`

## 📖 Uso de la Aplicación

### Primer Uso

1. **Registrar un Instructor**
    - Ir a `/login`
    - Pestaña "Registrarse"
    - Seleccionar "Instructor" como tipo de usuario
    - Completar formulario

2. **Registrar un Paciente**
    - Mismo proceso seleccionando "Paciente"
    - Se asigna automáticamente al primer instructor

3. **Crear una Serie Terapéutica**
    - Login como instructor
    - Dashboard → "Crear Nueva Serie Terapéutica"
    - Seleccionar tipo de terapia
    - Elegir mínimo 6 posturas de la biblioteca
    - Configurar duraciones y sesiones recomendadas

4. **Asignar Serie a Paciente**
    - Desde gestión de pacientes
    - Seleccionar paciente y serie creada

5. **Ejecutar Sesión como Paciente**
    - Login como paciente
    - "Iniciar Nueva Sesión"
    - Seguir evaluación pre-sesión
    - Completar posturas con temporizador
    - Evaluación post-sesión y comentarios

## 🎯 Tipos de Terapia Incluidos

### 1. Ansiedad
- **Posturas incluidas**: Balasana (Postura del Niño), Padmasana (Postura del Loto)
- **Enfoque**: Calma mental, reducción del estrés, respiración consciente
- **Beneficios**: Relajación profunda, mejora de concentración

### 2. Artritis
- **Posturas incluidas**: Marjaryasana (Postura del Gato)
- **Enfoque**: Movilidad articular suave, flexibilidad
- **Beneficios**: Reducción de rigidez, fortalecimiento del core

### 3. Dolor de Espalda
- **Posturas incluidas**: Adho Mukha Svanasana (Perro boca abajo)
- **Enfoque**: Fortalecimiento y estiramiento espinal
- **Beneficios**: Alivio de tensión, mejora de postura

## 📊 Estructura de la Base de Datos

```
users (instructores y pacientes)
├── patients (información extendida de pacientes)
├── therapy_types (tipos de terapia disponibles)
├── postures (biblioteca de posturas)
├── series (series terapéuticas creadas)
├── patient_series (asignaciones activas)
└── sessions (registro de sesiones completadas)
```

## 🔐 Autenticación y Seguridad

- **JWT tokens** para sesiones seguras
- **Contraseñas encriptadas** con bcryptjs
- **Validación de roles** (instructor/paciente)
- **Middleware de autenticación** en rutas protegidas
- **Validación de datos** con Zod en frontend y backend

## 🎨 Características de UI/UX

- **Diseño responsivo** optimizado para móviles y desktop
- **Tema consistente** con Tailwind CSS
- **Iconografía intuitiva** con Font Awesome
- **Feedback visual** con toasts y estados de carga
- **Navegación por roles** con menús contextuales
- **Cronómetro visual** con progreso circular

## 📱 Funcionalidades Avanzadas

### Ejecución de Sesiones
- **Evaluación pre/post** de intensidad de molestias
- **Temporizador personalizable** por postura
- **Función pausar/reanudar** para flexibilidad
- **Progreso visual** de la serie completa
- **Comentarios obligatorios** para seguimiento

### Gestión de Datos
- **Biblioteca extensible** de posturas
- **Múltiples tipos de terapia** configurables
- **Historial completo** de sesiones
- **Estadísticas de adherencia** para instructores

## 🚀 Deployment

### Replit (Recomendado)
La aplicación está configurada para deployment directo en Replit:
1. Importar proyecto a Replit
2. Las variables de entorno se configuran automáticamente
3. La base de datos PostgreSQL se provisiona automáticamente
4. Ejecutar con el botón "Run"

### Deployment Manual
1. **Backend**: Deplogar en servicios como Railway, Heroku, o DigitalOcean
2. **Frontend**: Build estático deployable en Vercel, Netlify
3. **Base de datos**: PostgreSQL en Railway, Supabase, o AWS RDS

## 🧪 Testing

### Datos de Prueba
La aplicación inicializa automáticamente con:
- 3 tipos de terapia predefinidos
- Posturas de ejemplo con imágenes de Unsplash
- Estructura completa para testing

### Flujo de Prueba Recomendado
1. Registrar instructor y paciente
2. Crear serie con posturas variadas
3. Asignar serie a paciente
4. Ejecutar sesión completa como paciente
5. Verificar registro de datos en dashboard

## 📝 Scripts Disponibles

```bash
npm run dev          # Desarrollo con hot reload
npm run build        # Build de producción
npm run start        # Iniciar en producción
npm run db:push      # Aplicar cambios de schema a BD
npm run db:studio    # Interfaz visual de base de datos
```

## 🤝 Contribución

Para contribuir al proyecto:
1. Fork del repositorio
2. Crear rama para feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Añadir nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## 👥 Soporte

Para soporte y preguntas:
- Crear issue en GitHub
- Documentación de APIs disponible en `/api/docs` (Swagger)

---

**YogaTerapia** - Transformando vidas a través del yoga terapéutico personalizado 🧘‍♀️✨