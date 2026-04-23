# Guía de Despliegue en Render.com

Esta guía te ayudará a desplegar Prayer Wall en Render con PostgreSQL.

## Por qué Render > Railway

- ✅ **Más estable**: Menos bugs durante el build
- ✅ **Logs claros**: Errores más fáciles de debuggear
- ✅ **PostgreSQL gratis**: Incluido en el tier gratuito
- ✅ **Interface simple**: Menos configuración necesaria
- ⚠️ **Limitación**: Apps gratis se duermen después de 15 min de inactividad (tardan ~30s en despertar)

---

## Requisitos previos

1. Cuenta en [Render.com](https://render.com) (gratis)
2. Tu código en GitHub (ya lo tienes)
3. 10 minutos de tiempo

---

## Paso 1: Preparar las variables de entorno

Antes de empezar, genera tu JWT_SECRET:

### En PowerShell (Windows):
```powershell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
```

### En Git Bash / Linux / Mac:
```bash
openssl rand -base64 64
```

**Guarda este valor**, lo necesitarás en el Paso 4.

---

## Paso 2: Crear el Web Service

1. Ve a [render.com/dashboard](https://dashboard.render.com)
2. Click en **"New +"** (arriba derecha)
3. Selecciona **"Web Service"**
4. Click en **"Build and deploy from a Git repository"**
5. Click **"Next"**

---

## Paso 3: Conectar el repositorio

1. Si es la primera vez, autoriza Render a acceder a GitHub
2. Busca tu repositorio: **`dylanhrojas/Peticiones`** (o como se llame)
3. Click en **"Connect"**

---

## Paso 4: Configurar el Web Service

Llena el formulario con estos valores:

### Basic Settings:
- **Name**: `prayer-wall` (o el nombre que quieras)
- **Region**: `Oregon (US West)` (o el más cercano a ti)
- **Branch**: `main`
- **Root Directory**: `prayer-wall` ⚠️ **MUY IMPORTANTE**
- **Runtime**: `Java`

### Build Settings:
- **Build Command**:
  ```bash
  cd frontend && npm install && npm run build && cd .. && mvn clean package -DskipTests
  ```

- **Start Command**:
  ```bash
  java -Dserver.port=$PORT -jar target/prayer-wall-0.0.1-SNAPSHOT.jar
  ```

### Instance Type:
- Selecciona **"Free"** (o el plan que prefieras)

### Environment Variables:
Click en **"Advanced"** y agrega estas variables:

| Key | Value |
|-----|-------|
| `JWT_SECRET` | El valor que generaste en el Paso 1 |
| `GOOGLE_CLIENT_ID` | `REPLACE_ME` (opcional, por ahora) |
| `GOOGLE_CLIENT_SECRET` | `REPLACE_ME` (opcional, por ahora) |

⚠️ **NO agregues `DATABASE_URL` todavía**, lo harás después de crear la base de datos.

---

## Paso 5: Crear PostgreSQL Database

**ANTES de hacer click en "Create Web Service"**, abre una nueva pestaña:

1. Ve a [render.com/dashboard](https://dashboard.render.com)
2. Click en **"New +"** → **"PostgreSQL"**
3. Llena el formulario:
   - **Name**: `prayer-wall-db`
   - **Database**: `prayerwall`
   - **User**: `prayerwall_user` (o deja el default)
   - **Region**: **El mismo que elegiste para el Web Service** ⚠️
   - **PostgreSQL Version**: `16` (o la última)
   - **Instance Type**: **Free**

4. Click **"Create Database"**
5. Espera ~2 minutos a que se cree
6. Una vez creada, copia el **"Internal Database URL"** (empieza con `postgresql://`)

---

## Paso 6: Conectar la base de datos al Web Service

1. Vuelve a la pestaña del Web Service (donde llenaste el formulario)
2. En **Environment Variables**, agrega:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | La URL que copiaste (Internal Database URL) |

3. Ahora sí, click en **"Create Web Service"**

---

## Paso 7: Esperar el deployment

Render empezará a buildear tu app. Verás logs en tiempo real:

1. ✅ **Installing dependencies** (Node.js, Maven, JDK)
2. ✅ **Building frontend** (`npm install && npm run build`)
3. ✅ **Building backend** (`mvn clean package`)
4. ✅ **Starting application** (`java -jar ...`)

Esto toma ~5-10 minutos la primera vez.

### Si todo sale bien:
Verás un mensaje verde: **"Your service is live 🎉"**

### Si algo falla:
- Revisa los logs en la pestaña **"Logs"**
- Busca líneas con `[ERROR]` o `FAILED`
- Los errores más comunes:
  - ❌ **Root Directory incorrecto**: Asegúrate que sea `prayer-wall`
  - ❌ **DATABASE_URL mal formateado**: Copia la URL exacta desde la base de datos
  - ❌ **Build Command incorrecto**: Verifica que copiaste el comando exacto

---

## Paso 8: Verificar que funciona

1. Render te dará una URL como: `https://prayer-wall-xxxxx.onrender.com`
2. Abre esa URL en tu navegador
3. Deberías ver la landing page con el globo 3D
4. Intenta:
   - ✅ Registrarte
   - ✅ Crear una petición
   - ✅ Ver el globo con la petición

---

## Paso 9 (Opcional): Configurar Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un proyecto (o usa uno existente)
3. Habilita **Google+ API**
4. Ve a **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configura:
   - **Application type**: Web application
   - **Authorized redirect URIs**:
     ```
     https://prayer-wall-xxxxx.onrender.com/login/oauth2/code/google
     ```
     (reemplaza con tu URL de Render)

6. Copia el **Client ID** y **Client Secret**
7. En Render, ve a tu Web Service → **Environment** → Edita:
   - `GOOGLE_CLIENT_ID`: pega tu Client ID
   - `GOOGLE_CLIENT_SECRET`: pega tu Client Secret

8. Click **"Save Changes"** → Render redesplegará automáticamente

---

## Troubleshooting

### Error: "Application failed to start"
**Revisa los logs:**
```bash
# Busca en los logs de Render
org.springframework.beans.factory.BeanCreationException
```

**Soluciones:**
- Verifica que `DATABASE_URL` esté configurada correctamente
- Asegúrate que la región de la DB y el Web Service sean la misma
- Revisa que el `JWT_SECRET` tenga al menos 32 caracteres

### Error: "Build failed"
**Frontend no se buildea:**
- Verifica que el `Root Directory` sea `prayer-wall`
- Asegúrate que `frontend/package.json` existe en el repo

**Maven falla:**
- Revisa que el `Build Command` esté correcto
- Verifica que `pom.xml` esté en la raíz de `prayer-wall/`

### La app se duerme (Free tier)
Render pone las apps gratis en "sleep" después de 15 minutos de inactividad.

**Para evitarlo (opcional):**
- Usa un servicio como [UptimeRobot](https://uptimerobot.com) para hacer ping cada 14 minutos
- O upgradea a un plan pago ($7/mes)

### El globo 3D no carga
- Abre la consola del navegador (F12)
- Busca errores de CORS o CSP
- Verifica que los assets se carguen desde la URL correcta

---

## Comandos útiles

### Ver logs en tiempo real:
En Render → tu Web Service → pestaña **"Logs"**

### Redeploy manual:
En Render → tu Web Service → **"Manual Deploy"** → **"Deploy latest commit"**

### Conectarse a la base de datos:
En Render → tu PostgreSQL → **"Connect"** → Copia el comando `psql`

```bash
# Ejemplo:
psql postgresql://prayerwall_user:xxx@dpg-xxx.oregon-postgres.render.com/prayerwall
```

### Ver variables de entorno:
En Render → tu Web Service → pestaña **"Environment"**

---

## Costos

### Free Tier (lo que usarás):
- **Web Service**: Gratis
  - Se duerme después de 15 min de inactividad
  - 750 horas/mes
  - Builds ilimitados

- **PostgreSQL**: Gratis
  - 1 GB de almacenamiento
  - Expira después de 90 días (tienes que crear una nueva)
  - Backups no incluidos

### Paid Tier (si quieres upgrade):
- **Web Service**: $7/mes
  - Siempre activo
  - Más recursos

- **PostgreSQL**: $7/mes
  - 10 GB de almacenamiento
  - No expira
  - Backups automáticos

---

## Próximos pasos

Una vez desplegado:

- [ ] Prueba todas las funcionalidades
- [ ] Configura Google OAuth (si quieres)
- [ ] Conecta un dominio personalizado (en Settings → Custom Domain)
- [ ] Configura SSL (Render lo hace automáticamente)
- [ ] Agrega el URL a tu README

---

## Soporte

- [Render Docs](https://render.com/docs)
- [Render Community](https://community.render.com)
- [Render Status](https://status.render.com)

## Alternativa: Render Blueprint (Avanzado)

Si quieres automatizar todo esto, puedes crear un `render.yaml`:

```yaml
services:
  - type: web
    name: prayer-wall
    runtime: java
    rootDir: prayer-wall
    buildCommand: cd frontend && npm install && npm run build && cd .. && mvn clean package -DskipTests
    startCommand: java -Dserver.port=$PORT -jar target/prayer-wall-0.0.1-SNAPSHOT.jar
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: prayer-wall-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: GOOGLE_CLIENT_ID
        value: REPLACE_ME
      - key: GOOGLE_CLIENT_SECRET
        value: REPLACE_ME

databases:
  - name: prayer-wall-db
    databaseName: prayerwall
    user: prayerwall_user
```

Guarda esto como `render.yaml` en la raíz del proyecto y Render lo detectará automáticamente.

---

¡Buena suerte con el deploy! 🚀
