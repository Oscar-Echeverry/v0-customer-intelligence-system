🚀 Customer Intelligence System – Sistema Inteligente de Clientes con IA
Proyecto desarrollado para Hackathon Quindío 2025 – Nivel Intermedio
Por: Jordana Pacheco – Óscar Echeverri




📌 Descripción General

Customer Intelligence System es un MVP funcional que integra:

Captura automatizada de leads mediante un bot conversacional estilo WhatsApp.

Procesamiento y análisis de datos históricos.

Modelos de Machine Learning para clasificación de leads y predicción de churn.

Un dashboard analítico para visualizar métricas en tiempo real.

Este proyecto busca resolver un problema real de las agencias de marketing digital:
conectar datos, predicciones y atención al cliente en un sistema unificado e inteligente.

🎯 Objetivos del Sistema
✔ Capturar leads de forma guiada

El bot recopila:

Nombre

Ciudad

Presupuesto

Urgencia

Tipo de servicio

✔ Clasificar automáticamente cada lead

Modelo de Machine Learning entrenado con datos históricos.

✔ Definir tiempos de contacto según clasificación

🔥 Caliente → 25 minutos

🌤️ Tibio → 1 hora y 30 minutos

❄️ Frío → 6 horas

✔ Registrar la información en base de datos

Todo se almacena para análisis posterior y seguimiento.

🧠 Arquitectura del Proyecto
customer-intelligence-system/
│── backend/
│── frontend/
│── dashboard/
│── models/
│── data/
│── notebooks/
│── docs/
│── README.md

🧩 Tecnologías Utilizadas
Frontend

Next.js

React

TailwindCSS

v0.app components

Backend

FastAPI / Flask

PostgreSQL / MongoDB / Supabase

Data & Machine Learning

Python

pandas / numpy

scikit-learn

joblib

Jupyter Notebook

📊 Modelos de Machine Learning
🔹 Lead Quality Classifier

Algoritmos probados:

Random Forest

Gradient Boosting

Decision Trees

Variables utilizadas:

Presupuesto

Urgencia

Ciudad

Tipo de servicio

Patrones históricos

🔹 Predictor de Churn

Probabilidad de cancelación en los próximos 30 días.

🔹 Predictor de Valor (opcional)
💬 Bot Conversacional Estilo WhatsApp

Incluye:

Flujo guiado

Validaciones de datos

Llamada automática al modelo predictivo

Mensaje de tiempo de contacto según clasificación

Registro del lead en base de datos

Ejemplo:

“Gracias, Carlos. Un asesor te contactará en los próximos 25 minutos.”

📈 Dashboard Analítico

Visualiza:

Leads clasificados

Clientes en riesgo de churn

ROI por campaña

Insights automáticos

Comparación de predicción vs valores reales

🌐 Deployment

🔗 https://v0-customer-intelligence-system.vercel.app

Sincronizado desde:
🔗 https://v0.app/chat/2tD5uuw4P9l

🛠 Instalación y Ejecución
1. Clonar repositorio
git clone https://github.com/tu-usuario/customer-intelligence-system.git

2. Frontend
cd frontend
npm install
npm run dev

3. Backend (si aplica)
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

📚 Documentación del Modelo

Ubicada en /notebooks, incluye:

Limpieza de datos

Análisis exploratorio (EDA)

Ingeniería de características

Entrenamiento del modelo

Comparación de métricas

Exportación .pkl

👥 Autores
👤 Jordana Pacheco

Frontend · Integración · UX Conversacional

👤 Óscar Echeverri

Backend · Modelos de ML · Arquitectura del sistema

📄 Licencia

MIT License – Uso académico permitido.

📬 Contacto

Para dudas, sugerencias o mejoras, abre un Issue en el repositorio.
