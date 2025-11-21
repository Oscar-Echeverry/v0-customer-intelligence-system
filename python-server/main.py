"""
Servidor FastAPI para ejecutar modelos de Machine Learning
Customer Intelligence System - InnovAI

Este servidor expone endpoints para predicción de calidad de leads y churn
usando los modelos entrenados en /ml/models/
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any
import sys
from pathlib import Path

# Add parent directory to path to import ml.utils
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

try:
    from ml.utils import predict_lead_quality, predict_churn
except ImportError as e:
    print(f"⚠️  Error importando ml.utils: {e}")
    print("Asegúrate de que los modelos estén entrenados en /ml/models/")
    predict_lead_quality = None
    predict_churn = None

app = FastAPI(
    title="Customer Intelligence ML API",
    description="API de predicción de calidad de leads y churn usando modelos entrenados",
    version="1.0.0"
)

# CORS configuration for Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== Request/Response Models ====================

class LeadQualityRequest(BaseModel):
    """Modelo de entrada para predicción de calidad de lead"""
    name: str = Field(..., description="Nombre del lead")
    city: str = Field(..., description="Ciudad del lead")
    channel: str = Field(default="WhatsApp Bot", description="Canal de adquisición")
    budget: Optional[float] = Field(None, description="Presupuesto mensual en COP")
    urgency: Optional[int] = Field(None, ge=1, le=5, description="Urgencia de 1 a 5")
    service_type: Optional[str] = Field(None, description="Tipo de servicio")
    
    @validator('urgency')
    def validate_urgency(cls, v):
        if v is not None and (v < 1 or v > 5):
            raise ValueError('urgency debe estar entre 1 y 5')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "Juan Pérez",
                "city": "Bogotá",
                "channel": "WhatsApp Bot",
                "budget": 15000000,
                "urgency": 4,
                "service_type": "Social Ads"
            }
        }


class LeadQualityResponse(BaseModel):
    """Modelo de respuesta para predicción de calidad de lead"""
    quality_label: str = Field(..., description="Etiqueta de calidad: 'caliente', 'tibio', o 'frío'")
    quality_score: float = Field(..., ge=0, le=1, description="Score de probabilidad (0-1)")
    probabilities: Optional[Dict[str, float]] = Field(None, description="Probabilidades por clase")
    
    class Config:
        json_schema_extra = {
            "example": {
                "quality_label": "caliente",
                "quality_score": 0.85,
                "probabilities": {
                    "frío": 0.05,
                    "tibio": 0.10,
                    "caliente": 0.85
                }
            }
        }


class ChurnPredictionRequest(BaseModel):
    """Modelo de entrada para predicción de churn"""
    client_id: str = Field(..., description="ID del cliente")
    engagement: str = Field(..., description="Nivel de engagement: 'Bajo', 'Medio', 'Alto'")
    satisfaccion: str = Field(..., description="Nivel de satisfacción: 'Bajo', 'Medio', 'Alto'")
    dias_ultima_compra: int = Field(..., ge=0, description="Días desde la última compra")
    total_compras: float = Field(..., ge=0, description="Suma total de compras en COP")
    promedio_compra: float = Field(..., ge=0, description="Promedio de compra")
    num_transacciones: int = Field(..., ge=0, description="Número total de transacciones")
    std_compra: Optional[float] = Field(0, ge=0, description="Desviación estándar de compras")
    
    @validator('engagement', 'satisfaccion')
    def validate_categorical(cls, v, field):
        valid_values = ['Bajo', 'Medio', 'Alto']
        if v not in valid_values:
            raise ValueError(f'{field.name} debe ser uno de: {valid_values}')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "client_id": "CLI-001",
                "engagement": "Medio",
                "satisfaccion": "Alto",
                "dias_ultima_compra": 45,
                "total_compras": 50000000,
                "promedio_compra": 10000000,
                "num_transacciones": 5,
                "std_compra": 2000000
            }
        }


class ChurnPredictionResponse(BaseModel):
    """Modelo de respuesta para predicción de churn"""
    client_id: str = Field(..., description="ID del cliente")
    churn_probability: float = Field(..., ge=0, le=1, description="Probabilidad de churn (0-1)")
    risk_level: str = Field(..., description="Nivel de riesgo: 'Bajo', 'Medio', 'Alto'")
    
    class Config:
        json_schema_extra = {
            "example": {
                "client_id": "CLI-001",
                "churn_probability": 0.35,
                "risk_level": "Medio"
            }
        }


# ==================== Helper Functions ====================

def map_budget_to_category(budget: Optional[float]) -> str:
    """Mapea presupuesto numérico a categoría"""
    if budget is None:
        return "Menos de 5M"
    if budget < 5_000_000:
        return "Menos de 5M"
    elif budget < 10_000_000:
        return "5M-10M"
    elif budget < 20_000_000:
        return "10M-20M"
    elif budget < 50_000_000:
        return "20M-50M"
    else:
        return "Más de 50M"


def map_urgency_to_category(urgency: Optional[int]) -> str:
    """Mapea urgencia numérica (1-5) a categoría"""
    if urgency is None or urgency <= 1:
        return "Baja"
    elif urgency == 2:
        return "Media"
    elif urgency == 3 or urgency == 4:
        return "Alta"
    else:
        return "Inmediata"


def get_risk_level(probability: float) -> str:
    """Determina nivel de riesgo basado en probabilidad"""
    if probability < 0.3:
        return "Bajo"
    elif probability < 0.6:
        return "Medio"
    else:
        return "Alto"


# ==================== Endpoints ====================

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "Customer Intelligence ML API",
        "version": "1.0.0",
        "models_loaded": predict_lead_quality is not None and predict_churn is not None
    }


@app.get("/health")
async def health_check():
    """Verificar estado del servidor y modelos"""
    models_status = {
        "lead_quality": predict_lead_quality is not None,
        "churn": predict_churn is not None
    }
    
    all_loaded = all(models_status.values())
    
    return {
        "status": "healthy" if all_loaded else "degraded",
        "models": models_status,
        "message": "Todos los modelos cargados" if all_loaded else "Algunos modelos no están disponibles"
    }


@app.post("/predict/lead-quality", response_model=LeadQualityResponse)
async def predict_lead_quality_endpoint(lead: LeadQualityRequest):
    """
    Predice la calidad de un lead usando el modelo entrenado.
    
    El modelo analiza presupuesto, urgencia, tipo de servicio y ciudad
    para clasificar el lead como 'caliente', 'tibio' o 'frío'.
    """
    if predict_lead_quality is None:
        raise HTTPException(
            status_code=503,
            detail="Modelo de calidad de leads no disponible. Entrena los modelos ejecutando: python ml/train_leads_and_churn.py"
        )
    
    try:
        # Preparar datos para el modelo
        presupuesto_cat = map_budget_to_category(lead.budget)
        urgencia_cat = map_urgency_to_category(lead.urgency)
        
        sample_dict = {
            'presupuesto': presupuesto_cat,
            'urgencia': urgencia_cat,
            'tipo_servicio': lead.service_type or 'Social Ads',
            'ciudad': lead.city
        }
        
        # Ejecutar predicción real con el modelo
        result = predict_lead_quality(sample_dict)
        
        return LeadQualityResponse(
            quality_label=result['quality_label'],
            quality_score=result['quality_score'],
            probabilities=result.get('probabilities')
        )
        
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Error cargando modelo: {str(e)}. Entrena los modelos primero."
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error en predicción: {str(e)}"
        )


@app.post("/predict/churn", response_model=ChurnPredictionResponse)
async def predict_churn_endpoint(client: ChurnPredictionRequest):
    """
    Predice la probabilidad de churn de un cliente usando el modelo entrenado.
    
    El modelo analiza engagement, satisfacción, comportamiento de compra
    y recencia para estimar el riesgo de pérdida del cliente.
    """
    if predict_churn is None:
        raise HTTPException(
            status_code=503,
            detail="Modelo de churn no disponible. Entrena los modelos ejecutando: python ml/train_leads_and_churn.py"
        )
    
    try:
        # Preparar datos para el modelo
        sample_dict = {
            'engagement': client.engagement,
            'satisfaccion': client.satisfaccion,
            'dias_ultima_compra': client.dias_ultima_compra,
            'total_compras': client.total_compras,
            'promedio_compra': client.promedio_compra,
            'num_transacciones': client.num_transacciones,
            'std_compra': client.std_compra
        }
        
        # Ejecutar predicción real con el modelo
        result = predict_churn(sample_dict)
        churn_prob = result['churn_probability']
        
        return ChurnPredictionResponse(
            client_id=client.client_id,
            churn_probability=churn_prob,
            risk_level=get_risk_level(churn_prob)
        )
        
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Error cargando modelo: {str(e)}. Entrena los modelos primero."
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error en predicción: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    
    print("🚀 Iniciando servidor FastAPI...")
    print("📊 Modelos ML cargados desde /ml/models/")
    print("🌐 Servidor escuchando en http://localhost:8000")
    print("📖 Documentación interactiva en http://localhost:8000/docs")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
