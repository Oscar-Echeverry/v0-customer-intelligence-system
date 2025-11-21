# 🚀 Guía de Despliegue - Customer Intelligence System

## Arquitectura del Sistema

\`\`\`
┌─────────────────────┐
│   Next.js Frontend  │  Puerto 3000
│   (Vercel/Local)    │
└──────────┬──────────┘
           │
           │ HTTP Requests
           ↓
┌─────────────────────┐
│   Next.js API       │  /api/v1/predict/lead-quality
│   Routes            │  /api/v1/churn/at-risk
└──────────┬──────────┘
           │
           │ HTTP POST
           ↓
┌─────────────────────┐
│  FastAPI Server     │  Puerto 8000
│  (Python ML)        │  
└──────────┬──────────┘
           │
           │ joblib.load()
           ↓
┌─────────────────────┐
│  Trained Models     │  /ml/models/*.joblib
│  (.joblib files)    │
└─────────────────────┘
\`\`\`

## 📋 Pasos de Despliegue

### 1️⃣ Entrenar los Modelos (Primero!)

\`\`\`bash
# Desde la raíz del proyecto
python ml/train_leads_and_churn.py
\`\`\`

Esto generará:
- `ml/models/lead_quality_model.joblib`
- `ml/models/lead_quality_scaler.joblib`
- `ml/models/feature_config_leads.json`
- `ml/models/churn_model.joblib`
- `ml/models/churn_scaler.joblib`
- `ml/models/feature_config_churn.json`

### 2️⃣ Iniciar Servidor Python

**Opción A: Script automático (recomendado)**

\`\`\`bash
chmod +x python-server/start-server.sh
./python-server/start-server.sh
\`\`\`

**Opción B: Manual**

\`\`\`bash
cd python-server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
\`\`\`

Verifica que esté funcionando:
\`\`\`bash
curl http://localhost:8000/health
\`\`\`

### 3️⃣ Configurar Variables de Entorno en Next.js

Crea o actualiza `.env.local`:

\`\`\`bash
# URL del servidor Python
PYTHON_SERVER_URL=http://localhost:8000

# Otras variables...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
\`\`\`

### 4️⃣ Iniciar Next.js

\`\`\`bash
npm install
npm run dev
\`\`\`

### 5️⃣ Probar la Integración

1. Ve a http://localhost:3000/bot
2. Completa el formulario del bot:
   - Nombre: "Test Lead"
   - Ciudad: "Bogotá"
   - Presupuesto: 15000000
   - Urgencia: 4
   - Servicio: "Social Ads"
3. Verifica en la consola del servidor Python que reciba la petición
4. El bot debe mostrar la predicción real del modelo

## 🔍 Verificación del Sistema

### Test 1: Health Check del Servidor Python

\`\`\`bash
curl http://localhost:8000/health
\`\`\`

Respuesta esperada:
\`\`\`json
{
  "status": "healthy",
  "models": {
    "lead_quality": true,
    "churn": true
  }
}
\`\`\`

### Test 2: Predicción Manual desde Terminal

\`\`\`bash
curl -X POST http://localhost:8000/predict/lead-quality \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Lead",
    "city": "Bogotá",
    "budget": 15000000,
    "urgency": 4,
    "service_type": "Social Ads"
  }'
\`\`\`

### Test 3: Desde Next.js API Route

\`\`\`bash
curl -X POST http://localhost:3000/api/v1/predict/lead-quality \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Lead",
    "city": "Bogotá",
    "budget": 15000000,
    "urgency": 4,
    "service_type": "Social Ads"
  }'
\`\`\`

## 🐛 Troubleshooting

### Problema: "Connection refused" al Python server

**Solución:**
\`\`\`bash
# Verifica que el servidor Python esté corriendo
ps aux | grep python

# Reinicia el servidor
./python-server/start-server.sh
\`\`\`

### Problema: "ModuleNotFoundError: No module named 'ml'"

**Solución:** El servidor Python debe ejecutarse desde la raíz del proyecto:
\`\`\`bash
# ✅ Correcto
python python-server/main.py

# ❌ Incorrecto  
cd python-server && python main.py
\`\`\`

### Problema: "FileNotFoundError: Modelo no encontrado"

**Solución:** Entrena los modelos primero:
\`\`\`bash
python ml/train_leads_and_churn.py
ls -la ml/models/  # Verifica que los archivos existan
\`\`\`

### Problema: Next.js no se conecta al servidor Python

**Solución:** Verifica la variable de entorno:
\`\`\`bash
echo $PYTHON_SERVER_URL  # Debe ser http://localhost:8000
\`\`\`

## 🌐 Despliegue en Producción

### Opción 1: Vercel + Railway

1. **Frontend (Vercel):**
   - Deploy Next.js a Vercel normalmente
   - Configura variable: `PYTHON_SERVER_URL=https://tu-app.railway.app`

2. **Backend Python (Railway):**
   - Crea cuenta en Railway.app
   - Deploy desde GitHub
   - Railway detectará `requirements.txt` automáticamente
   - Configura Procfile:
     \`\`\`
     web: cd python-server && uvicorn main:app --host 0.0.0.0 --port $PORT
     \`\`\`

### Opción 2: Todo en un VPS (DigitalOcean/AWS)

\`\`\`bash
# Instalar dependencias del sistema
sudo apt update
sudo apt install python3-pip nodejs npm

# Clonar repo y configurar
git clone <tu-repo>
cd customer-intelligence-system

# Setup Python
python3 -m venv venv
source venv/bin/activate
pip install -r python-server/requirements.txt
python ml/train_leads_and_churn.py

# Setup Next.js
npm install
npm run build

# Usar PM2 para mantener servicios corriendo
npm install -g pm2

# Iniciar Python server
pm2 start python-server/main.py --name ml-server --interpreter python3

# Iniciar Next.js
pm2 start npm --name nextjs -- start

# Configurar nginx como reverse proxy
\`\`\`

## 📊 Monitoreo

### Logs del Servidor Python

\`\`\`bash
tail -f python-server.log
\`\`\`

### Logs de Next.js

\`\`\`bash
npm run dev  # Modo desarrollo con logs en terminal
\`\`\`

### Métricas de Predicciones

Agrega logging en `python-server/main.py`:
\`\`\`python
import logging
logging.basicConfig(
    filename='predictions.log',
    level=logging.INFO,
    format='%(asctime)s - %(message)s'
)
\`\`\`

## ✅ Checklist de Despliegue

- [ ] Modelos entrenados en `/ml/models/`
- [ ] Servidor Python corriendo en puerto 8000
- [ ] Variable `PYTHON_SERVER_URL` configurada
- [ ] Next.js corriendo en puerto 3000
- [ ] Health check responde correctamente
- [ ] Bot funciona end-to-end
- [ ] Predicciones reales (no fallback)
- [ ] Logs monitoreados

## 🎯 Flujo Completo de Trabajo

1. **Desarrollo Local:**
   - Terminal 1: `./python-server/start-server.sh`
   - Terminal 2: `npm run dev`
   - Navegar a http://localhost:3000/bot

2. **Testing:**
   - Probar bot con diferentes inputs
   - Verificar logs en ambos servidores
   - Confirmar que usa modelos reales

3. **Deploy:**
   - Push a GitHub
   - Deploy frontend a Vercel
   - Deploy backend a Railway/VPS
   - Configurar variables de entorno
   - Smoke test en producción

**¡Sistema completamente integrado con ML real! 🎉**
