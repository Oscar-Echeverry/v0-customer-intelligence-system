# 🚀 Servidor Python FastAPI - Customer Intelligence ML

Servidor FastAPI que ejecuta los modelos de Machine Learning entrenados para predicción de calidad de leads y churn.

## 📋 Requisitos

- Python 3.9 o superior
- Modelos entrenados en `/ml/models/` (ejecuta primero `python ml/train_leads_and_churn.py`)

## 🔧 Instalación

### 1. Crear entorno virtual (recomendado)

\`\`\`bash
cd python-server
python3 -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
\`\`\`

### 2. Instalar dependencias

\`\`\`bash
pip install -r requirements.txt
\`\`\`

## 🎯 Uso

### Iniciar el servidor

**Opción 1: Usando el script (recomendado)**

\`\`\`bash
chmod +x python-server/start-server.sh
./python-server/start-server.sh
\`\`\`

**Opción 2: Manualmente**

\`\`\`bash
cd python-server
python main.py
\`\`\`

El servidor estará disponible en:
- **API**: http://localhost:8000
- **Documentación interactiva (Swagger)**: http://localhost:8000/docs
- **Redoc**: http://localhost:8000/redoc

### Health Check

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
  },
  "message": "Todos los modelos cargados"
}
\`\`\`

## 📡 Endpoints

### 1. POST `/predict/lead-quality`

Predice la calidad de un lead (caliente, tibio, frío).

**Request Body:**
\`\`\`json
{
  "name": "Juan Pérez",
  "city": "Bogotá",
  "channel": "WhatsApp Bot",
  "budget": 15000000,
  "urgency": 4,
  "service_type": "Social Ads"
}
\`\`\`

**Response:**
\`\`\`json
{
  "quality_label": "caliente",
  "quality_score": 0.85,
  "probabilities": {
    "frío": 0.05,
    "tibio": 0.10,
    "caliente": 0.85
  }
}
\`\`\`

### 2. POST `/predict/churn`

Predice la probabilidad de churn de un cliente.

**Request Body:**
\`\`\`json
{
  "client_id": "CLI-001",
  "engagement": "Medio",
  "satisfaccion": "Alto",
  "dias_ultima_compra": 45,
  "total_compras": 50000000,
  "promedio_compra": 10000000,
  "num_transacciones": 5,
  "std_compra": 2000000
}
\`\`\`

**Response:**
\`\`\`json
{
  "client_id": "CLI-001",
  "churn_probability": 0.35,
  "risk_level": "Medio"
}
\`\`\`

## 🧪 Testing desde Next.js

1. Inicia el servidor Python (puerto 8000)
2. Inicia Next.js (puerto 3000)
3. Ve a http://localhost:3000/bot
4. Completa el formulario del bot
5. La predicción usará tu modelo ML real

## 🐛 Troubleshooting

### Error: "Modelo no disponible"

\`\`\`bash
# Entrena los modelos primero
python ml/train_leads_and_churn.py
\`\`\`

Verifica que existan estos archivos:
- `ml/models/lead_quality_model.joblib`
- `ml/models/lead_quality_scaler.joblib`
- `ml/models/feature_config_leads.json`
- `ml/models/churn_model.joblib`
- `ml/models/churn_scaler.joblib`
- `ml/models/feature_config_churn.json`

### Error: "ModuleNotFoundError: No module named 'ml'"

Asegúrate de ejecutar el servidor desde la raíz del proyecto:
\`\`\`bash
# ✅ Correcto
cd /ruta/al/proyecto
python python-server/main.py

# ❌ Incorrecto
cd python-server
python main.py
\`\`\`

### Puerto 8000 en uso

\`\`\`bash
# Mata el proceso que usa el puerto
lsof -ti:8000 | xargs kill -9

# O usa otro puerto
uvicorn main:app --port 8001
\`\`\`

## 📊 Monitoreo

Ver logs en tiempo real:
\`\`\`bash
tail -f python-server.log
\`\`\`

## 🔐 Producción

Para desplegar en producción:

1. Usa un servidor ASGI robusto como Gunicorn:
\`\`\`bash
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
\`\`\`

2. Configura CORS apropiadamente en `main.py`
3. Usa variables de entorno para configuración sensible
4. Implementa rate limiting y autenticación

## 📚 Arquitectura

\`\`\`
Cliente (Next.js)
    ↓
API Routes (/api/predict/lead-quality/route.ts)
    ↓ HTTP POST
FastAPI Server (Python - Puerto 8000)
    ↓
ML Utils (ml/utils.py)
    ↓
Modelos Entrenados (ml/models/*.joblib)
\`\`\`

## 🤝 Integración con Next.js

Los API routes de Next.js en `/app/api/predict/lead-quality/route.ts` ahora hacen fetch a este servidor Python en lugar de usar heurísticas.

Flujo completo:
1. Usuario completa bot en `/bot`
2. Bot llama a `apiClient.post("/predict/lead-quality")`
3. Next.js API route (`/api/v1/predict/lead-quality/route.ts`) hace fetch a Python
4. FastAPI ejecuta modelo real
5. Respuesta regresa al usuario con predicción real

**¡Sin mocks, sin simulaciones, solo modelos reales! 🎯**
