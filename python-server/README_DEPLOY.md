# 🚀 Guía de Deployment - Python ML Server

Esta guía te ayudará a deployar el servidor FastAPI de Machine Learning en Railway o Render.

---

## 📋 Pre-requisitos

Antes de deployar, asegúrate de:

1. ✅ **Entrenar los modelos localmente**:
   \`\`\`bash
   python ml/train_leads_and_churn.py
   \`\`\`
   Esto creará los archivos `.joblib` en `ml/models/`

2. ✅ **Verificar que los modelos funcionan**:
   \`\`\`bash
   cd python-server
   python main.py
   \`\`\`
   Visita http://localhost:8000/docs y prueba los endpoints

---

## 🚂 Opción 1: Deploy en Railway

Railway es la opción más rápida y sencilla.

### Paso 1: Preparar el repositorio

1. Asegúrate de que tu código esté en GitHub
2. Verifica que la carpeta `ml/models/` tenga los archivos `.joblib` (commit y push)

### Paso 2: Crear proyecto en Railway

1. Ve a [railway.app](https://railway.app)
2. Click en **"Start a New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Elige tu repositorio `v0-customer-intelligence-system`

### Paso 3: Configurar el deployment

Railway detectará automáticamente el Dockerfile. Configura:

**Root Directory**: `python-server`

**Variables de entorno** (opcional):
\`\`\`bash
PYTHONUNBUFFERED=1
PORT=8000
\`\`\`

### Paso 4: Deploy

1. Click en **"Deploy"**
2. Espera 2-3 minutos
3. Railway te dará una URL pública: `https://tu-proyecto.railway.app`

### Paso 5: Verificar

Visita:
- `https://tu-proyecto.railway.app/health` → Debería responder `{"status": "healthy"}`
- `https://tu-proyecto.railway.app/docs` → Documentación interactiva

---

## 🎨 Opción 2: Deploy en Render

Render ofrece un tier gratuito con auto-sleep.

### Paso 1: Preparar el repositorio

Igual que Railway, asegúrate de que `ml/models/*.joblib` estén en el repo.

### Paso 2: Crear Web Service en Render

1. Ve a [render.com](https://render.com)
2. Click en **"New +"** → **"Web Service"**
3. Conecta tu repositorio de GitHub
4. Selecciona el repositorio `v0-customer-intelligence-system`

### Paso 3: Configurar el service

**Configuración básica:**
- **Name**: `customer-intelligence-ml-api`
- **Region**: Oregon (US West) o la más cercana
- **Branch**: `main`
- **Root Directory**: `python-server`
- **Runtime**: `Docker`

**Advanced:**
- **Dockerfile Path**: `python-server/Dockerfile`
- **Docker Build Context Directory**: `.` (raíz del repo)

### Paso 4: Deploy

1. Click en **"Create Web Service"**
2. Espera 3-5 minutos (el build es más lento que Railway)
3. Render te dará una URL: `https://customer-intelligence-ml-api.onrender.com`

### Paso 5: Verificar

Visita:
- `https://tu-app.onrender.com/health`
- `https://tu-app.onrender.com/docs`

⚠️ **Nota**: En el tier gratuito, Render pone a dormir tu servicio después de 15 minutos de inactividad. La primera request puede tardar 30-60 segundos en "despertar" el servidor.

---

## 🔗 Integrar con Vercel (Next.js Frontend)

Una vez que tu servidor esté deployado:

### 1. Obtener la URL pública

Ejemplo:
- Railway: `https://customer-intelligence-ml-j8k2.railway.app`
- Render: `https://customer-intelligence-ml-api.onrender.com`

### 2. Configurar en Vercel

Ve a tu proyecto en [vercel.com](https://vercel.com) → Settings → Environment Variables:

\`\`\`bash
PYTHON_SERVER_URL=https://tu-servidor.railway.app
\`\`\`

O si prefieres que sea pública (para llamadas desde el cliente):

\`\`\`bash
NEXT_PUBLIC_PYTHON_SERVER_URL=https://tu-servidor.railway.app
\`\`\`

### 3. Redeploy en Vercel

Después de agregar la variable, haz un redeploy:
- Ve a **Deployments** → Click en el último deployment → **Redeploy**

### 4. Verificar integración

Tu bot en `/bot` ahora usará las predicciones reales del servidor Python.

---

## 🐛 Troubleshooting

### Error: "Modelo no encontrado"

**Causa**: Los modelos `.joblib` no están en el repo o no se copiaron correctamente.

**Solución**:
\`\`\`bash
# Entrena los modelos localmente
python ml/train_leads_and_churn.py

# Verifica que existan
ls -la ml/models/

# Haz commit y push
git add ml/models/*.joblib ml/models/*.json
git commit -m "Add trained ML models"
git push
\`\`\`

### Error: "Failed to fetch" en el frontend

**Causa**: CORS o el servidor no está respondiendo.

**Solución**:
1. Verifica que el servidor esté corriendo: `https://tu-servidor.com/health`
2. Revisa los logs en Railway/Render
3. Asegúrate de que la URL en Vercel esté correcta (sin `/` al final)

### La app de Render se "duerme"

**Causa**: Tier gratuito pone servicios a dormir después de 15 minutos.

**Soluciones**:
- Opción 1: Usa Railway (no se duerme)
- Opción 2: Implementa un "keep-alive" que haga ping cada 10 minutos
- Opción 3: Upgrade a Render paid tier ($7/mes)

### Build falla: "No such file or directory: '../ml'"

**Causa**: El Dockerfile intenta copiar `../ml` pero el build context es incorrecto.

**Solución**:
En Render, asegúrate de que:
- **Root Directory**: `python-server`
- **Docker Build Context Directory**: `.` (raíz del repo)

---

## 📊 Monitoreo

### Logs en Railway

1. Ve a tu proyecto en Railway
2. Click en el servicio
3. Tab **"Logs"** → Ver logs en tiempo real

### Logs en Render

1. Ve a tu servicio en Render
2. Tab **"Logs"** → Ver logs de deployment y runtime

### Métricas útiles

Ambas plataformas muestran:
- ✅ CPU usage
- ✅ Memory usage
- ✅ Request count
- ✅ Response times

---

## 💰 Costos

### Railway
- **Free tier**: $5/mes de crédito (suficiente para desarrollo)
- **Pro**: $5/mes + uso ($0.000463/GB-hour RAM, $0.000231/vCPU-hour)
- Estimado para este proyecto: ~$5-10/mes

### Render
- **Free tier**: Gratis (con auto-sleep)
- **Starter**: $7/mes (sin auto-sleep, 512 MB RAM)
- **Standard**: $25/mes (2 GB RAM)

**Recomendación**: Railway para producción, Render free tier para testing.

---

## 🎯 Próximos pasos

1. ✅ Deploy el servidor Python
2. ✅ Configura `PYTHON_SERVER_URL` en Vercel
3. ✅ Redeploy tu app de Next.js
4. 🎉 ¡Disfruta de predicciones ML reales en tu chatbot!

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs del servicio
2. Prueba el endpoint `/health` directamente
3. Verifica que los modelos `.joblib` existan en el repo
4. Consulta la documentación oficial:
   - [Railway Docs](https://docs.railway.app/)
   - [Render Docs](https://render.com/docs)

---

**¡Buena suerte con tu deployment! 🚀**
