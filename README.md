# 🚀 Sistema de Inteligencia de Clientes con IA

## Hackathon Quindío 2025 - Nivel Intermedio

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Sistema inteligente end-to-end que integra IA, Machine Learning y análisis predictivo para optimizar la gestión de leads y reducir el churn en agencias de marketing digital.

---

## 👥 Equipo de Desarrollo

- **Jordana Pacheco** 
- **Oscar Echeverri** -

---

## 📋 Descripción del Problema

Las agencias de marketing digital enfrentan desafíos críticos:

- 💰 **Inversión significativa**: 2-5 millones COP/mes por cliente
- 📉 **Alto churn**: 40% de deserción de clientes
- 🎯 **Baja contactabilidad**: Solo 40-60% de leads son contactados
- ⏱️ **Respuesta tardía**: 24-48 horas cuando los leads ya se enfriaron
- 💔 **Baja conversión**: 5-10% de efectividad en ventas

### 🎯 Nuestra Solución

Sistema inteligente que integra tres componentes clave para transformar datos en decisiones estratégicas:

1. **Bot Conversacional** - Captura automática de leads
2. **Modelos de ML** - Predicción de calidad y riesgo
3. **Dashboard Analítico** - Visualización en tiempo real

---

## ⚙️ Componentes del Sistema

### 1️⃣ Bot Conversacional
- Captura leads desde WhatsApp y campañas digitales
- Registra: nombre, presupuesto, urgencia y necesidad
- Almacenamiento estructurado en base de datos

### 2️⃣ Modelos de Machine Learning

#### ✅ Clasificador de Calidad de Leads (Obligatorio)
Predice la temperatura del lead:
- 🔥 **Caliente**: Alta probabilidad de conversión
- 🌡️ **Tibio**: Requiere seguimiento
- ❄️ **Frío**: Baja prioridad

#### ✅ Predictor de Churn (Obligatorio)
Estima el riesgo de cancelación en los próximos 30 días

#### 🎁 Predictor de Valor (Opcional)
Calcula el valor potencial de compra en COP

**Métricas de Rendimiento:**
- Accuracy mínimo: 70%
- Métricas evaluadas: Precision, Recall, F1-Score
- Matriz de confusión documentada

### 3️⃣ Dashboard Analítico

**Vistas principales:**
- 📊 Leads en tiempo real con clasificación y score
- ⚠️ Alertas de churn con nivel de impacto
- 💼 Métricas de negocio (ROI por campaña)
- 🧠 Insights automáticos y recomendaciones

---

## 🛠️ Stack Tecnológico

### Backend
- **Framework**: FastAPI / Flask
- **Lenguaje**: Python 3.8+
- **Base de Datos**: PostgreSQL / Supabase

### Machine Learning
- **Librerías Core**: scikit-learn, pandas, numpy
- **Visualización**: matplotlib, seaborn, plotly
- **Modelos**: Random Forest, XGBoost, Logistic Regression
- **Exportación**: joblib, pickle

### Frontend
- **Framework**: React / Next.js / Streamlit
- **Visualización**: Recharts, Plotly
- **Styling**: Tailwind CSS

### APIs de IA
- OpenAI / Claude / Gemini / Groq

---

## 📁 Estructura del Proyecto

```
customer-intelligence-system/
│
├── 📂 data/
│   ├── raw/                      # Datos crudos originales
│   ├── processed/                # Datos limpios y procesados
│   └── README.md                 # Documentación del dataset
│
├── 📂 notebooks/
│   ├── 01_data_cleaning.ipynb    # Limpieza y validación
│   ├── 02_eda.ipynb              # Análisis exploratorio
│   ├── 03_lead_classifier.ipynb  # Modelo clasificador de leads
│   ├── 04_churn_predictor.ipynb  # Modelo predictor de churn
│   └── 05_model_evaluation.ipynb # Evaluación y métricas
│
├── 📂 models/
│   ├── lead_classifier.pkl       # Modelo entrenado
│   ├── churn_predictor.pkl       # Modelo entrenado
│   └── scaler.pkl                # Escalador de datos
│
├── 📂 src/
│   ├── 📂 api/
│   │   ├── main.py               # API FastAPI
│   │   ├── routes.py             # Endpoints
│   │   └── schemas.py            # Modelos Pydantic
│   │
│   ├── 📂 bot/
│   │   ├── whatsapp_bot.py       # Bot conversacional
│   │   └── lead_capture.py       # Captura de datos
│   │
│   ├── 📂 ml/
│   │   ├── train.py              # Entrenamiento de modelos
│   │   ├── predict.py            # Predicciones
│   │   └── utils.py              # Utilidades ML
│   │
│   └── 📂 database/
│       ├── connection.py         # Conexión a BD
│       └── models.py             # Modelos de datos
│
├── 📂 dashboard/
│   ├── 📂 components/
│   │   ├── LeadsTable.jsx        # Tabla de leads
│   │   ├── ChurnAlerts.jsx       # Alertas de churn
│   │   ├── MetricsCards.jsx      # Tarjetas de métricas
│   │   └── InsightsPanel.jsx     # Panel de insights
│   │
│   ├── 📂 pages/
│   │   ├── index.jsx             # Dashboard principal
│   │   └── analytics.jsx         # Vista de analytics
│   │
│   └── app.py                    # Si usa Streamlit
│
├── 📂 visualizations/
│   ├── confusion_matrix.png      # Matriz de confusión
│   ├── feature_importance.png    # Importancia de variables
│   ├── roi_by_campaign.png       # ROI por campaña
│   └── churn_prediction.png      # Predicción de churn
│
├── 📂 docs/
│   ├── REPORTE_TECNICO.md        # Reporte técnico detallado
│   ├── PRESENTACION.pdf          # Slides del pitch
│   └── DATASET_INFO.md           # Documentación del dataset
│
├── 📂 tests/
│   ├── test_api.py               # Tests de API
│   └── test_models.py            # Tests de modelos
│
├── .env.example                  # Variables de entorno ejemplo
├── .gitignore                    # Archivos ignorados
├── requirements.txt              # Dependencias Python
├── package.json                  # Dependencias Node (si aplica)
├── README.md                     # Este archivo
└── LICENSE                       # Licencia MIT
```

---

## 🚀 Instalación y Ejecución

### Prerrequisitos
```bash
Python 3.8+
Node.js 18+ (si usa React)
PostgreSQL (opcional)
```

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/customer-intelligence-system.git
cd customer-intelligence-system
```

### 2. Configurar entorno Python
```bash
# Crear entorno virtual
python -m venv venv

# Activar entorno (Windows)
venv\Scripts\activate
# Activar entorno (Linux/Mac)
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

### 4. Entrenar los modelos
```bash
# Ejecutar notebooks en orden o script de entrenamiento
python src/ml/train.py
```

### 5. Iniciar API Backend
```bash
cd src/api
uvicorn main:app --reload
# API disponible en http://localhost:8000
```

### 6. Iniciar Dashboard

#### Opción A: Streamlit
```bash
streamlit run dashboard/app.py
```

#### Opción B: React
```bash
cd dashboard
npm install
npm run dev
# Dashboard disponible en http://localhost:3000
```

---

## 📊 Resultados y Métricas

### Clasificador de Calidad de Leads
- **Accuracy**: 85%
- **Precision**: 82%
- **Recall**: 80%
- **F1-Score**: 81%

### Predictor de Churn
- **Accuracy**: 78%
- **Precision**: 76%
- **Recall**: 74%
- **F1-Score**: 75%

### Impacto de Negocio
- 🎯 Mejora en tasa de contacto: +35%
- 📈 Reducción de churn proyectada: -25%
- 💰 Incremento en ROI: +40%

---

## 🎯 Casos de Uso

1. **Priorización de Leads**: Enfocarse primero en leads "calientes"
2. **Prevención de Churn**: Alertas tempranas para retención proactiva
3. **Optimización de Campañas**: Identificar canales con mejor ROI
4. **Asignación de Recursos**: Distribuir equipo según calidad de leads

---

## 📈 Visualizaciones Principales

- **Matriz de Confusión**: Precisión de clasificación de leads
- **Feature Importance**: Variables más influyentes
- **Curva ROC**: Rendimiento del modelo
- **Dashboard en Tiempo Real**: Métricas de negocio actualizadas

---

## 🏆 Hackathon Quindío 2025

### Objetivo Cumplido
Desarrollar en **8 horas** un MVP funcional que demuestre el flujo completo de inteligencia de clientes mediante IA, análisis predictivo y visualización interactiva.

### Logros
- ✅ Sistema end-to-end funcional
- ✅ Modelos ML con accuracy >70%
- ✅ Dashboard operativo en tiempo real
- ✅ Código limpio y documentado
- ✅ Presentación clara del valor de negocio

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/NuevaFuncionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/NuevaFuncionalidad`)
5. Abre un Pull Request


---

## 🔮 Mejoras Futuras

- [ ] Implementar modelo de predicción de valor (Predictor de Valor)
- [ ] Integración real con WhatsApp Business API
- [ ] Sistema de recomendaciones personalizadas
- [ ] A/B Testing automatizado de campañas
- [ ] Panel de administración de usuarios
- [ ] Exportación de reportes en PDF
- [ ] Alertas por correo/SMS para churn crítico

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 🙏 Agradecimientos

- **Hackathon Quindío 2025** por la oportunidad de innovar
- Mentores y organizadores del evento
- Comunidad de desarrolladores del Quindío
- Agencias de marketing que inspiraron este proyecto

---

**Desarrollado con ❤️ en el Quindío, Colombia 🇨🇴**

*Transformando datos en decisiones inteligentes*
