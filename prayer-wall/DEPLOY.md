# Guía de Despliegue en Railway

Esta guía te ayudará a desplegar Prayer Wall en Railway con PostgreSQL.

## Requisitos previos

1. Cuenta en [Railway](https://railway.app)
2. Cuenta en [GitHub](https://github.com) (para conectar el repo)
3. [Railway CLI](https://docs.railway.app/develop/cli) instalado (opcional pero recomendado)

## Paso 1: Preparar el repositorio

1. Asegúrate de tener todos los cambios commiteados:
   ```bash
   git add .
   git commit -m "chore: prepare for Railway deployment"
   git push origin main
   ```

2. Si no tienes un repositorio remoto en GitHub:
   ```bash
   # Crea un nuevo repo en GitHub y luego:
   git remote add origin https://github.com/tu-usuario/prayer-wall.git
   git push -u origin main
   ```

## Paso 2: Crear proyecto en Railway

### Opción A: Desde el Dashboard Web

1. Ve a [railway.app](https://railway.app) y haz login
2. Click en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Autoriza Railway a acceder a tus repos
5. Selecciona el repositorio `prayer-wall`
6. Railway detectará automáticamente que es un proyecto Spring Boot

### Opción B: Desde Railway CLI

```bash
cd prayer-wall
railway login
railway init
railway link
```

## Paso 3: Agregar PostgreSQL

1. En el dashboard de Railway, click en **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway automáticamente creará las variables de entorno:
   - `DATABASE_URL` (formato: `postgresql://user:pass@host:port/db`)
   - Otras variables relacionadas

## Paso 4: Configurar variables de entorno

En el dashboard de Railway, ve a tu servicio → **Variables** y agrega:

### Variables requeridas:

```bash
# JWT Secret (genera uno seguro)
JWT_SECRET=tu-jwt-secret-super-seguro-de-al-menos-64-caracteres

# Database (Railway lo provee automáticamente, pero puedes usar referencias)
DATABASE_URL=${{Postgres.DATABASE_URL}}
DB_USERNAME=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}

# Server Port (Railway lo maneja automáticamente)
PORT=8080
```

### Variables opcionales (para Google OAuth):

```bash
GOOGLE_CLIENT_ID=tu-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-google-client-secret
```

#### Cómo generar JWT_SECRET seguro:

```bash
# En Linux/Mac:
openssl rand -base64 64

# En Windows PowerShell:
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))

# O usa un generador online:
https://generate-secret.vercel.app/64
```

## Paso 5: Configurar Build Settings (si es necesario)

Railway debería detectar automáticamente el `nixpacks.toml`, pero si necesitas ajustar:

1. Ve a **Settings** → **Build Settings**
2. Asegúrate que:
   - **Build Command**: (dejarlo vacío, nixpacks.toml lo maneja)
   - **Start Command**: (dejarlo vacío, nixpacks.toml lo maneja)

## Paso 6: Desplegar

Railway empezará a construir automáticamente. El proceso:

1. **Instalación de dependencias**: Node.js 20, Maven, JDK 21
2. **Build del frontend**: `npm ci && npm run build` en `/frontend`
3. **Build del backend**: `mvn clean package -DskipTests`
4. **Start**: `java -jar target/prayer-wall-0.0.1-SNAPSHOT.jar`

Puedes ver los logs en tiempo real en el dashboard.

## Paso 7: Configurar dominio (opcional)

1. En **Settings** → **Networking**
2. Railway te da un dominio automático: `tu-app.up.railway.app`
3. O conecta un dominio propio en **Custom Domain**

## Paso 8: Configurar Google OAuth (opcional)

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita **Google+ API**
4. Ve a **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configura:
   - Application type: **Web application**
   - Authorized redirect URIs:
     ```
     https://tu-dominio.up.railway.app/login/oauth2/code/google
     ```
6. Copia el **Client ID** y **Client Secret**
7. Agrégalos como variables de entorno en Railway:
   ```bash
   GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=xxx
   ```
8. Redeploy la aplicación

## Verificación

Una vez desplegado, verifica:

1. ✅ La app está corriendo: `https://tu-app.up.railway.app`
2. ✅ El globo 3D se ve correctamente
3. ✅ Puedes registrarte/login
4. ✅ PostgreSQL está conectado (crea un usuario de prueba)
5. ✅ Las peticiones se guardan y aparecen en el globo

## Troubleshooting

### Error: "Unable to connect to database"
- Verifica que `DATABASE_URL` esté configurado correctamente
- Asegúrate que el formato sea: `jdbc:postgresql://host:port/db`
- Railway provee `postgresql://` pero Spring Boot necesita `jdbc:postgresql://`
- Solución: Railway debería manejar esto automáticamente, pero verifica en los logs

### Error: "Port already in use"
- Railway maneja el PORT automáticamente
- No necesitas configurar nada, el `application.properties` ya tiene `${PORT:8080}`

### Error 500 al cargar la app
- Revisa los logs en Railway: **Deployments** → Click en el deployment → **View Logs**
- Busca errores de Spring Boot
- Verifica que todas las variables de entorno estén configuradas

### Frontend no se ve / 404 en rutas
- Asegúrate que el build del frontend se completó:
  ```bash
  # Busca en los logs:
  cd frontend && npm ci && npm run build
  ```
- Verifica que `dist/` se haya copiado a `src/main/resources/static/`

### El globo 3D no renderiza
- Puede ser un problema de CORS o CSP
- Verifica la consola del navegador (F12)
- Asegúrate que Globe.gl se cargó correctamente

## Comandos útiles (Railway CLI)

```bash
# Ver logs en tiempo real
railway logs

# Ver variables de entorno
railway variables

# Conectarse a la base de datos
railway connect

# Redeploy
railway up

# Ver status
railway status
```

## Rollback

Si algo sale mal:

1. Ve a **Deployments** en Railway
2. Click en un deployment anterior exitoso
3. Click en **"Redeploy"**

## Costos

- **Hobby Plan (gratis)**: 500 horas/mes, $5 de crédito
- **PostgreSQL**: ~$5/mes
- Si pasas del plan gratuito, Railway te cobrará por uso

## Próximos pasos

Una vez desplegado:

1. [ ] Configura Google OAuth
2. [ ] Conecta un dominio personalizado
3. [ ] Configura monitoreo/alertas
4. [ ] Habilita backups automáticos de PostgreSQL
5. [ ] Agrega SSL/TLS (Railway lo hace automáticamente)

## Soporte

- [Railway Docs](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [Railway Help Center](https://help.railway.app)
