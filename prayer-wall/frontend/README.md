# Prayer Wall — Frontend

Frontend de la plataforma Muro Global de Oración, construido con React + Vite.

## Stack técnico

- **React 19** con hooks
- **Vite** para desarrollo y build
- **React Router** para navegación SPA
- **Framer Motion** para animaciones
- **Globe.gl** (three.js) para el globo 3D interactivo
- **CSS Modules** para estilos scoped

## Estructura del proyecto

```
src/
├── components/
│   ├── PrayerGlobe.jsx      # Globo 3D con barras por país (peticiones + misioneros)
│   ├── PrayerCard.jsx       # Card de petición individual
│   ├── Nav.jsx              # Barra de navegación
│   └── Footer.jsx           # Pie de página
├── pages/
│   ├── HomePage.jsx         # Landing con globo, contadores y sección de misioneros
│   ├── FeedPage.jsx         # Muro/feed de peticiones con filtros
│   ├── NewPrayerPage.jsx    # Formulario para publicar petición
│   ├── PrayerDetailPage.jsx # Detalle de petición con comentarios y "Oré por ti"
│   ├── MyPrayersPage.jsx    # Gestión de peticiones propias
│   ├── TestimonyPage.jsx    # Galería de peticiones respondidas
│   ├── ProfilePage.jsx      # Editar perfil (nombre, país, misionero, bio)
│   ├── AuthPage.jsx         # Login
│   ├── RegisterPage.jsx     # Registro (incluye checkbox misionero)
│   └── NotFoundPage.jsx     # 404
├── hooks/
│   └── useAuth.js           # Hook de autenticación con JWT
├── data/
│   └── countries.js         # Lista de países + búsqueda + flags
└── main.jsx                 # Entry point
```

## Características implementadas

### Autenticación
- ✅ Login con correo + contraseña
- ✅ Registro con validación
- ✅ JWT almacenado en localStorage
- ✅ Rutas protegidas (redirect a /login si no autenticado)
- ✅ Google OAuth (botón presente, falta configurar credenciales en backend)

### Perfil de usuario
- ✅ Página `/perfil` para editar datos personales
- ✅ Campos: nombre, país (autocomplete), checkbox misionero, país misionero, bio/testimonio
- ✅ Avatar fallback con iniciales si no hay foto de Google
- ✅ Actualización en tiempo real del estado global del usuario

### Sistema de misioneros
- ✅ Checkbox "Soy misionero" en registro y perfil
- ✅ Campo condicional para país de servicio misionero
- ✅ Campo bio/testimonio (1000 caracteres) para descripción espiritual
- ✅ Sección dedicada en el home mostrando misioneros agrupados por país
- ✅ Visualización en el globo 3D: barra dorada para países con misioneros
- ✅ Modal al hacer click en la barra dorada mostrando lista de misioneros del país

### Globo 3D (PrayerGlobe.jsx)
- ✅ Barras por país: altura = número de oraciones, color = categoría dominante
- ✅ Barra dorada especial para países con misioneros
- ✅ Auto-rotación lenta (desactivable al interactuar)
- ✅ Modal de detalle al hacer click (peticiones o misioneros según el tipo de barra)
- ✅ Leyenda interactiva de categorías
- ✅ Textura de tierra con atmósfera
- ✅ Dark mode (`#0A1628` de fondo)

### Peticiones
- ✅ Formulario de creación con categoría, país (autocomplete), anónimo, 500 chars max
- ✅ Feed con filtros (categoría, país, fecha), ordenable, paginación (20 + "Cargar más")
- ✅ Sidebar de trending: peticiones más oradas + países más activos
- ✅ Detalle de petición con comentarios ("Palabras de aliento")
- ✅ Botón "Oré por ti" con contador (no aparece en peticiones propias)
- ✅ Marcar como respondida (solo autor) + escribir testimonio

### Testimonios
- ✅ Galería de peticiones respondidas
- ✅ Cards con icono de oraciones y contador dorado
- ✅ Contador global en el home

### UX/UI
- ✅ Animaciones con Framer Motion (fade-ins, slides)
- ✅ Loading states con spinner animado
- ✅ Página 404 con estilo consistente
- ✅ Paleta "Cielo Nocturno" (`#0A1628`, `#F5C26B`, `#E8DCC4`)
- ✅ Tipografía: Cormorant Garamond (títulos) + Inter (cuerpo)
- ✅ Responsive design

## Pendiente

### Para completar MVP
- [ ] **Google OAuth completar** — configurar CLIENT_ID en `.env` y backend

### Mejoras post-MVP
- [ ] **Animación "Oré por ti"** — feedback visual satisfactorio al tocar el botón
- [ ] **Toast/notificaciones** — feedback al crear petición, comentar, orar
- [ ] **Meta tags SEO** — og:image, description, títulos dinámicos
- [ ] **Favicon personalizado**
- [ ] **i18n (inglés)** — segundo idioma
- [ ] **Sistema de moderación** — panel admin para revisar contenido
- [ ] **Filtro anti-spam** — detección automática de contenido inapropiado
- [ ] **Reportar contenido** — botón para usuarios reporten contenido

## Desarrollo local

```bash
npm install
npm run dev
```

El frontend corre en `http://localhost:5173` y hace proxy al backend en `http://localhost:8080`.

## Build para producción

```bash
npm run build
```

Los assets se generan en `dist/` y son servidos por Spring Boot desde `src/main/resources/static/`.

## Notas técnicas

- **SPA routing:** Spring Boot hace forward de rutas del frontend para permitir navegación directa a `/feed`, `/perfil`, etc.
- **Autocomplete de países:** usa Fuse.js para búsqueda fuzzy con soporte de teclado (flechas, Enter, Escape)
- **Globe.gl performance:** solo renderiza peticiones activas de los últimos 30 días para evitar sobrecarga
- **CSS Modules:** cada componente tiene su propio `.module.css`, sin colisiones de nombres
- **Misioneros en el globo:** las barras doradas tienen prioridad z-index para destacarse sobre las de peticiones
