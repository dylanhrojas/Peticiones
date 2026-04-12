# Proyecto Misión Mundial — Muro Global de Oración

> Plataforma web donde cualquier persona puede publicar peticiones de oración y otros del mundo interceden por ella, visualizado en un globo terráqueo 3D interactivo.

**Nombre:** *(pendiente de definir)*
**Equipo:** 2 personas
**Materia:** Misión Mundial

---

## Concepto central

Una plataforma donde cualquier persona puede publicar una petición de oración y otros del mundo oran por ella. El globo 3D le da el ángulo visual y misionero: ves que alguien en Kenia está pidiendo oración y tú desde México oras por él. Conecta al cuerpo de Cristo globalmente.

**Ciclo narrativo cristiano:** publicar petición → recibir oraciones → marcar como respondida → testimonio. Esto le da peso espiritual real, no es solo un foro.

**Diferenciador frente a lo que ya existe:** investigando, hay plataformas de oración global (Every Home, Prayer.Global, ACSI), pero ninguna combina (a) muro social abierto donde cualquiera publica + (b) globo 3D estilo GitHub/Stripe + (c) ciclo completo petición→testimonio + (d) enfoque adventista.

---

## Roles de usuario

- **Visitante (sin login):** puede ver el globo, leer peticiones y tocar "Oré por ti". No puede publicar ni comentar. Esto baja la barrera de entrada — cualquiera que llegue al link ya está interactuando.
- **Usuario registrado:** puede publicar peticiones, comentar, marcar peticiones como respondidas, ver su historial.
- **Moderador (informal):** los integrantes del equipo, sin UI especial, solo acceso directo a base de datos para ocultar contenido inapropiado.

---

## MVP — Lo que SÍ va en la primera versión

### Autenticación
- Registro/login con correo + contraseña, **o** Google OAuth (elegir solo una vía para no complicarse)
- Perfil básico: nombre, país, foto opcional

### Publicar peticiones
- Formulario con:
  - Texto (máximo 500 caracteres)
  - Categoría (5-6 fijas)
  - Ubicación (auto-detectada del navegador o seleccionada manualmente por país)
  - Opción anónimo sí/no
- Validación básica anti-spam (longitud mínima, rate limit por usuario)

### Globo 3D principal — la estrella del proyecto
- Globe.gl integrado con barras estilo el ejemplo de world-population
- **Color por categoría, altura por número de oraciones recibidas**
- Auto-rotación lenta cuando no hay interacción
- Click en una barra → abre modal con detalle de la petición
- Muestra solo peticiones activas de los últimos N días (definir después)
- Se ve espectacular en dark mode

### Feed alternativo (lista)
- Lista scrolleable de peticiones, especialmente útil en móvil
- Ordenable por: recientes / más oradas
- Filtro por categoría

### Detalle de petición
- Texto completo, ubicación, categoría, contador de oraciones
- Botón gigante "Oré por ti" con animación satisfactoria al tocarlo
- Comentarios de aliento (texto simple, sin imágenes)
- Botón "marcar como respondida" (solo el autor)

### Marcar como respondida + testimonio
- El autor escribe un breve testimonio de cómo Dios respondió
- La petición pasa a la sección de "Testimonios" y desaparece del globo con animación
- Esta función cierra el ciclo narrativo del proyecto

### Página de testimonios respondidos
- Galería simple de peticiones respondidas con sus testimonios
- **Carta fuerte para presentarle al maestro:** muestra fruto real de la plataforma

### Contador global
- "Hoy se han ofrecido X oraciones" visible en el home
- "X peticiones respondidas en total"
- Da sensación de comunidad activa

---

## Nice-to-have — Stretch goals (si terminamos el MVP con tiempo)

- Notificación al autor cuando alguien ora por su petición ("Alguien en Brasil oró por ti hace 2 minutos")
- Pulso visual en el globo cuando llega una oración (anillo expansivo desde ese punto)
- Inglés como segundo idioma de interfaz
- Animación dorada cuando una petición se marca como respondida (sube al cielo y desaparece)
- Compartir petición con link único
- Versículo del día en el home
- Hexbins / agrupación regional cuando hay mucha actividad para evitar saturación visual

---

## Fuera del alcance — NO incluir

Lista clara de lo que **no** vamos a hacer, para protegernos de scope creep:

- Notificaciones push o por correo
- Traducción automática de peticiones
- Múltiples idiomas en la interfaz desde el día uno (empezar solo en español)
- Sistema de moderación complejo con UI
- Grupos privados o de iglesia
- Compartir directo a redes sociales
- Búsqueda avanzada con filtros múltiples
- Sistema de favoritos / guardados
- Estadísticas personales detalladas
- Modo oscuro/claro intercambiable (elegir uno solo — recomendado oscuro)
- App móvil nativa (web responsive es suficiente)
- Login con múltiples proveedores (elegir uno solo)
- Chat directo entre usuarios
- Videos o multimedia pesada
- Sistema de donaciones o cualquier cosa con dinero

---

## Identidad visual

> Esto es una propuesta inicial. Puede (y probablemente va a) ajustarse cuando se vea implementado.

### Concepto general

**Sobrio, moderno, con un toque sagrado.** Ni "iglesia ochentera con gradientes feos" ni "startup secular sin alma". Punto medio entre **Hallow** (la app católica de meditación, súper bien diseñada) y **GitHub** (limpio, dark mode, técnico).

### Paleta de colores propuesta — "Cielo Nocturno"

Esta paleta va con el globo 3D y le da el factor "wow" inmediato. El fondo oscuro hace que los rayos del globo brillen.

| Elemento | Color | Hex |
|---|---|---|
| Fondo principal | Azul marino casi negro | `#0A1628` |
| Fondo secundario | Azul noche | `#142847` |
| Acento principal | Dorado cálido (incienso, luz divina) | `#F5C26B` |
| Acento secundario | Crema suave (papel antiguo) | `#E8DCC4` |
| Texto principal | Blanco hueso | `#F5F5F0` |
| Éxito (oración respondida) | Verde salvia | `#7FB069` |

**Categorías (los rayos del globo):**

| Categoría | Color | Hex |
|---|---|---|
| Salud | Rojo coral | `#E63946` |
| Familia | Naranja cálido | `#F4A261` |
| Espiritual | Dorado | `#F5C26B` |
| Trabajo / Provisión | Verde-azulado | `#2A9D8F` |
| Otros | Gris suave | `#A8A8B3` |

### Tipografía

- **Títulos:** una serif moderna como **Fraunces** o **Cormorant Garamond** — le da peso espiritual sin ser anticuada
- **Cuerpo:** **Inter** o **DM Sans** — limpia, legible, neutra
- Ambas son gratis en Google Fonts

### Tono de la copy / textos

- **Cálido pero no cursi.** Nada de "¡Hola hermano en Cristo bendecido!"
- **Directo pero respetuoso.** Ejemplo: en lugar de "Envía tu plegaria al Altísimo" → "Comparte tu petición"
- **Inclusivo:** alguien que no sea adventista o ni siquiera cristiano puede entrar y entenderlo. No sectario.
- **Bilingüe-ready:** escribir textos cortos, fáciles de traducir después

### Elementos visuales clave

- **Iconografía:** Lucide Icons o Phosphor Icons (gratis, modernos)
- **Sin ilustraciones cliché** (nada de manos en oración con rayos de luz)
- **Espacios en blanco generosos** — que respire
- **Animaciones suaves:** fade-ins, transiciones lentas. El sitio debe sentirse contemplativo, no frenético

### Inspiraciones / mood-board

- **hallow.com** — app católica de oración, top tier en diseño espiritual moderno
- **lectio365.com** — devocionales con buen diseño dark
- **github.com** — por el globo 3D y el dark mode profesional
- **stripe.com** — limpieza y elegancia
- **globe.gl/example/world-population** — referencia visual exacta del globo

---

## Pendientes por decidir

1. **Nombre del proyecto** (en pausa)
2. **Stack técnico** (frontend, backend, base de datos, hosting)
3. **Forma única de login** (correo o Google)
4. **Cuántos días dura una petición activa en el globo** antes de archivarse
5. **Categorías finales** (las 5-6 fijas que se van a ofrecer)
6. **División de tareas entre los 2 integrantes**

---

## Justificación para el maestro

El ángulo misionero es fuerte: la Gran Comisión es global, esta plataforma conecta literalmente al cuerpo de Cristo mundial en intercesión. Versículos clave para el pitch:

- **Mateo 18:20** — "donde están dos o tres congregados en mi nombre, allí estoy yo en medio de ellos"
- **Santiago 5:16** — "la oración eficaz del justo puede mucho"
- **Apocalipsis 8:3-4** — las oraciones de los santos suben como incienso ante Dios *(encaja perfecto con la visualización de las barras del globo subiendo)*
- **1 Tesalonicenses 5:17** — "orad sin cesar"

El proyecto técnicamente es serio (3D, full-stack, base de datos, autenticación) pero espiritualmente justifica cada función con un fundamento bíblico real.

---

## Estado actual del proyecto

### Implementado

- **Auth:** registro/login con correo + contraseña, JWT, rutas protegidas
- **Google OAuth:** backend verificador de tokens + botón en login/registro (falta configurar credenciales de Google Cloud)
- **Publicar peticiones:** formulario con categoría, país (autocomplete), anónimo, 500 chars
- **Globo 3D:** Globe.gl con barras por ubicación, color por categoría, altura por oraciones, auto-rotación, leyenda interactiva
- **Feed/muro:** lista filtrable por categoría, país, fecha, ordenable, con paginación (20 por página + "Cargar más")
- **"Oré por ti":** botón funcional que incrementa contador (no aparece en peticiones propias)
- **Comentarios:** sistema de "Palabras de aliento" en cada petición
- **Mis peticiones:** página privada para gestionar peticiones propias, marcar como respondida y escribir testimonio
- **Testimonios:** galería con cards, icono de oraciones, counter dorado
- **Contadores globales:** oraciones hoy, peticiones publicadas, respondidas — visibles en el hero del landing y sobre el globo
- **Editar perfil:** página /perfil para cambiar nombre y país
- **Archivado automático:** cron job diario que archiva peticiones sin actividad por 30 días
- **SPA routing:** forwarding de rutas del frontend en Spring Boot
- **Loading states:** loader animado en todas las páginas que cargan datos
- **Página 404:** con estilo consistente y links de navegación
- **Trending sidebar:** peticiones más oradas y países más activos en el feed
- **Seguridad:** PostgreSQL actualizado (CVE fix), JWT con expiración 24h

### Falta para completar el MVP

- [ ] **Google OAuth credenciales** — crear proyecto en Google Cloud Console, obtener Client ID, configurar en `.env` y `application.properties`
- [ ] **Railway deploy** — configurar DATABASE_URL, JWT_SECRET como env vars, build del frontend, desplegar JAR

### Mejoras post-MVP

- [ ] **Animación del "Oré por ti"** — el spec pide "satisfying animation" con feedback visual al tocar
- [ ] **Toast/notificaciones** — feedback visual cuando se ora, comenta o crea petición (actualmente solo hay redirect)
- [ ] **Responder comentarios** — actualmente los comentarios son planos, no hay hilos
- [ ] **Meta tags / SEO** — og:image, description, títulos dinámicos por página
- [ ] **Favicon propio** — icono personalizado del proyecto en la pestaña del navegador
- [ ] **Animación de salida del globo** — cuando una petición se marca como respondida, la barra sube y desaparece
- [ ] **Pulso visual en el globo** — anillo expansivo cuando alguien ora en tiempo real
- [ ] **Rate limiting** — anti-spam en publicación de peticiones y oraciones
- [ ] **i18n (inglés)** — segundo idioma de interfaz
- [ ] **Geolocation precisa** — usar API del navegador como opción además del país
- [ ] **Skeleton loaders** — reemplazar los dots por skeletons que imiten la forma del contenido
- [ ] **Responsive polish** — revisar breakpoints en tablets y móviles pequeños
- [ ] **PWA** — service worker para funcionar offline y "Add to Home Screen"
