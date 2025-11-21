# 🤖 Módulo de Machine Learning - Customer Intelligence System

Este módulo contiene los scripts de entrenamiento y utilidades para los modelos de Machine Learning del sistema de inteligencia de clientes.

## 📊 Modelos Disponibles

### 1. Modelo de Calidad de Leads (Lead Scoring)

**Objetivo:** Clasificar leads en tres categorías (caliente, tibio, frío) según su probabilidad de convertirse en clientes de alta calidad.

**Features utilizadas:**
- `presupuesto_numeric`: Presupuesto del lead mapeado a valores numéricos (2.5M - 75M COP)
- `urgencia_numeric`: Nivel de urgencia del proyecto (1-4: Baja, Media, Alta, Inmediata)
- `tipo_servicio_encoded`: Tipo de servicio solicitado (Consultoría, Desarrollo, Marketing, Infraestructura)
- `ciudad_encoded`: Ciudad del lead (Bogotá, Medellín, Cali, Barranquilla, Cartagena, Bucaramanga)

**Algoritmos comparados:**
- Logistic Regression (baseline)
- Random Forest Classifier (configuración optimizada)

El script entrena ambos modelos y selecciona automáticamente el de mejor rendimiento.

**Target:** Clasificación multi-clase
- 🔥 **Caliente** (Alta): Leads con alta probabilidad de conversión
- 🟡 **Tibio** (Media): Leads con probabilidad moderada
- 🧊 **Frío** (Baja): Leads con baja probabilidad

**Métricas de evaluación:**
- Accuracy: Precisión general del modelo
- F1-Score (macro): Balance entre precisión y recall para todas las clases
- Matriz de confusión: Visualización de errores de clasificación

---

### 2. Modelo de Predicción de Churn

**Objetivo:** Identificar clientes en riesgo de abandonar el servicio calculando su probabilidad de churn.

**Features utilizadas:**
- `engagement_encoded`: Nivel de engagement del cliente (0-2: Bajo, Medio, Alto)
- `satisfaccion_encoded`: Nivel de satisfacción (0-2: Bajo, Medio, Alto)
- `dias_ultima_compra`: Días transcurridos desde la última transacción
- `total_compras`: Suma total de compras en COP
- `promedio_compra`: Promedio de compra por transacción
- `num_transacciones`: Número total de transacciones realizadas
- `std_compra`: Desviación estándar de las compras (variabilidad)

**Algoritmos comparados:**
- Random Forest Classifier
- Gradient Boosting Classifier

El script selecciona automáticamente el modelo con mejor ROC-AUC.

**Target:** Clasificación binaria
- **Churn = 1**: Cliente en riesgo si cumple alguna de estas condiciones:
  - Engagement bajo
  - Satisfacción baja
  - Más de 90 días sin comprar
- **No Churn = 0**: Cliente activo y saludable

**Métricas de evaluación:**
- ROC-AUC: Capacidad de discriminación del modelo
- Precision, Recall, F1-Score: Balance entre falsos positivos y negativos
- Matriz de confusión
- Curva ROC
- Distribución de probabilidades

---

## 🚀 Instalación de Dependencias

Instala las librerías necesarias con pip:

\`\`\`bash
pip install pandas numpy scikit-learn matplotlib seaborn joblib
\`\`\`

**Librerías requeridas:**
- `pandas`: Manipulación de datos
- `numpy`: Operaciones numéricas
- `scikit-learn`: Modelos de ML y métricas
- `matplotlib` y `seaborn`: Visualizaciones
- `joblib`: Serialización de modelos

---

## ▶️ Cómo Ejecutar el Entrenamiento

Desde la **raíz del proyecto**, ejecuta:

\`\`\`bash
python ml/train_leads_and_churn.py
\`\`\`

**Proceso de entrenamiento:**

1. ✅ Carga los CSV desde `public/data/`:
   - `leads_historicos.csv`
   - `clientes_comportamiento.csv`
   - `clientes_transacciones.csv`

2. 🔄 Realiza feature engineering automático:
   - Mapeo de variables categóricas
   - Normalización con StandardScaler
   - Agregación de transacciones por cliente

3. 🧪 Compara múltiples algoritmos y selecciona el mejor

4. 📊 Genera visualizaciones:
   - Matriz de confusión
   - Importancia de features
   - Curva ROC (solo para churn)
   - Distribución de probabilidades

5. 💾 Guarda los modelos entrenados en `ml/models/`:
   - Modelos (.joblib)
   - Scalers (.joblib)
   - Configuración de features (.json)

**Manejo de errores:**

Si algún CSV no se encuentra, el script imprime un mensaje claro y continúa con los otros modelos sin fallar:

\`\`\`
⚠️  No se encontró public/data/leads_historicos.csv
   Por favor, asegúrate de que el archivo existe en public/data/
   Saltando entrenamiento del modelo de leads...
\`\`\`

---

## 📁 Estructura de Archivos

\`\`\`
ml/
├── train_leads_and_churn.py    # Script principal de entrenamiento
├── utils.py                     # Funciones para predicción
├── README.md                    # Esta documentación
└── models/                      # ⬇ Generados después del entrenamiento
    ├── lead_quality_model.joblib
    ├── lead_quality_scaler.joblib
    ├── feature_config_leads.json
    ├── churn_model.joblib
    ├── churn_scaler.joblib
    ├── feature_config_churn.json
    ├── lead_quality_confusion_matrix.png
    ├── lead_quality_feature_importance.png
    ├── churn_confusion_matrix.png
    ├── churn_feature_importance.png
    ├── churn_roc_curve.png
    └── churn_probability_distribution.png
\`\`\`

---

## 🔧 Uso de los Modelos

### Predicción Individual de Leads

\`\`\`python
from ml.utils import predict_lead_quality

lead_data = {
    'presupuesto': '10M-20M',
    'urgencia': 'Alta',
    'tipo_servicio': 'Desarrollo',
    'ciudad': 'Bogotá'
}

result = predict_lead_quality(lead_data)

print(f"Calidad: {result['quality_label']}")  # 'caliente', 'tibio', o 'frío'
print(f"Score: {result['quality_score']:.1%}")  # Probabilidad de ser caliente
print(f"Probabilidades: {result['probabilities']}")  # Dict con todas las probabilidades
\`\`\`

**Salida esperada:**
\`\`\`
Calidad: caliente
Score: 87.3%
Probabilidades: {'frío': 0.05, 'tibio': 0.08, 'caliente': 0.87}
\`\`\`

---

### Predicción Individual de Churn

\`\`\`python
from ml.utils import predict_churn

client_data = {
    'engagement': 'Bajo',
    'satisfaccion': 'Medio',
    'dias_ultima_compra': 120,
    'total_compras': 50000000,
    'promedio_compra': 10000000,
    'num_transacciones': 5,
    'std_compra': 2000000
}

result = predict_churn(client_data)

print(f"Probabilidad de churn: {result['churn_probability']:.1%}")
\`\`\`

**Salida esperada:**
\`\`\`
Probabilidad de churn: 78.5%
\`\`\`

---

### Predicción en Batch (Múltiples Leads)

\`\`\`python
from ml.utils import batch_predict_leads

leads_list = [
    {'presupuesto': '10M-20M', 'urgencia': 'Alta', 'tipo_servicio': 'Desarrollo', 'ciudad': 'Bogotá'},
    {'presupuesto': '5M-10M', 'urgencia': 'Media', 'tipo_servicio': 'Consultoría', 'ciudad': 'Medellín'},
    {'presupuesto': 'Más de 50M', 'urgencia': 'Inmediata', 'tipo_servicio': 'Infraestructura', 'ciudad': 'Cali'}
]

df_results = batch_predict_leads(leads_list)
print(df_results[['tipo_servicio', 'ciudad', 'predicted_quality_label', 'predicted_quality_score']])
\`\`\`

---

### Predicción en Batch (Múltiples Clientes)

\`\`\`python
from ml.utils import batch_predict_churn

clients_list = [
    {'engagement': 'Bajo', 'satisfaccion': 'Bajo', 'dias_ultima_compra': 150, 
     'total_compras': 5000000, 'promedio_compra': 1000000, 'num_transacciones': 5, 'std_compra': 200000},
    {'engagement': 'Alto', 'satisfaccion': 'Alto', 'dias_ultima_compra': 15,
     'total_compras': 100000000, 'promedio_compra': 20000000, 'num_transacciones': 5, 'std_compra': 5000000}
]

df_churn = batch_predict_churn(clients_list)
print(df_churn[['engagement', 'satisfaccion', 'churn_probability']])
\`\`\`

---

## 📈 Interpretación de Resultados

### Lead Scoring

| Probabilidad | Etiqueta | Acción Recomendada |
|--------------|----------|-------------------|
| ≥ 70% | 🔥 Caliente | Priorizar contacto inmediato |
| 40-70% | 🟡 Tibio | Seguimiento regular |
| < 40% | 🧊 Frío | Nurturing automatizado |

### Churn Prediction

| Probabilidad | Riesgo | Acción Recomendada |
|--------------|--------|-------------------|
| ≥ 70% | 🚨 Alto | Intervención urgente, llamada del account manager |
| 40-70% | ⚠️ Medio | Campaña de re-engagement, oferta personalizada |
| < 40% | ✅ Bajo | Cliente saludable, mantener relación |

---

## 🔄 Re-entrenamiento Recomendado

**Cuándo re-entrenar los modelos:**

✅ **Cada trimestre** como mínimo
✅ Cuando se acumulen **>20% nuevos registros** en los CSV
✅ Si el **rendimiento en producción** disminuye notablemente
✅ Después de **cambios en el modelo de negocio**

**Proceso de re-entrenamiento:**

\`\`\`bash
# 1. Actualiza los CSV en public/data/
# 2. Ejecuta el script de entrenamiento
python ml/train_leads_and_churn.py

# 3. Revisa las nuevas métricas y visualizaciones en ml/models/
# 4. Si las métricas son satisfactorias, los modelos están listos para producción
\`\`\`

---

## ⚙️ Configuración Avanzada

Para ajustar hiperparámetros, edita `ml/train_leads_and_churn.py`:

**Modelo de Leads:**
\`\`\`python
RandomForestClassifier(
    n_estimators=100,        # Número de árboles (más = mejor, pero más lento)
    max_depth=10,            # Profundidad máxima (evita overfitting)
    min_samples_split=5,     # Mínimo de muestras para split
    random_state=42,
    class_weight='balanced'  # Maneja desbalance de clases
)
\`\`\`

**Modelo de Churn:**
\`\`\`python
GradientBoostingClassifier(
    n_estimators=150,        # Número de árboles
    learning_rate=0.1,       # Tasa de aprendizaje (0.01-0.3)
    max_depth=5,             # Profundidad de árboles
    random_state=42
)
\`\`\`

**Configuración general:**
\`\`\`python
test_size=0.2  # Proporción para testing (20%)
random_state=42  # Semilla para reproducibilidad
\`\`\`

---

## 🐛 Solución de Problemas

**Error: "No se encontró el archivo CSV"**
\`\`\`
⚠️  No se encontró public/data/leads_historicos.csv
\`\`\`
✅ Solución: Verifica que los CSV estén en `public/data/` desde la raíz del proyecto

**Error: "FileNotFoundError: Modelo no encontrado"**
\`\`\`python
FileNotFoundError: Modelo no encontrado: ml/models/lead_quality_model.joblib
\`\`\`
✅ Solución: Ejecuta primero el script de entrenamiento:
\`\`\`bash
python ml/train_leads_and_churn.py
\`\`\`

**Error: "KeyError en sample_dict"**
✅ Solución: Asegúrate de que tu diccionario incluya todos los campos requeridos (ver ejemplos arriba)

---

## 🎯 Integración con Backend (Futuro)

Este módulo está diseñado para integrarse fácilmente con un backend Python (FastAPI):

\`\`\`python
# Ejemplo de API endpoint con FastAPI
from fastapi import FastAPI
from ml.utils import predict_lead_quality, predict_churn

app = FastAPI()

@app.post("/api/predict-lead-quality")
def predict_lead(lead: dict):
    return predict_lead_quality(lead)

@app.post("/api/predict-churn")
def predict_client_churn(client: dict):
    return predict_churn(client)
\`\`\`

---

## 📝 Notas Técnicas

- ✅ Los modelos usan **StandardScaler** para normalizar features numéricas
- ✅ El modelo de leads maneja **desbalance de clases** con `class_weight='balanced'`
- ✅ Los CSV se leen desde `public/data/` usando **pathlib** para compatibilidad multiplataforma
- ✅ Todos los modelos incluyen **configuración de features** en JSON para reproducibilidad
- ✅ Las funciones incluyen **type hints** y **docstrings** completas para mejor documentación
- ✅ El código sigue **PEP 8** y mejores prácticas de Python

---

## 📚 Referencias

- [scikit-learn Documentation](https://scikit-learn.org/stable/)
- [Random Forest Classifier](https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.RandomForestClassifier.html)
- [Gradient Boosting Classifier](https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.GradientBoostingClassifier.html)
- [Understanding ROC Curves](https://developers.google.com/machine-learning/crash-course/classification/roc-and-auc)

---

**¿Preguntas o problemas?** Contacta al equipo de Data Science 📧
