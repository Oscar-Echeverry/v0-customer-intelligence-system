"""
Utilidades para el módulo de Machine Learning - Customer Intelligence System

Este módulo proporciona funciones para cargar modelos entrenados y realizar
predicciones individuales o en lote para calidad de leads y predicción de churn.
"""

import pandas as pd
import numpy as np
import joblib
import json
from pathlib import Path
from typing import Dict, Any, List, Tuple

# Get models directory
MODELS_DIR = Path(__file__).resolve().parent / "models"


def load_lead_quality_model() -> Tuple[Any, Any, Dict]:
    """
    Carga el modelo de calidad de leads, su scaler y configuración de features.
    
    Returns:
        tuple: (model, scaler, feature_config)
        
    Raises:
        FileNotFoundError: Si los archivos del modelo no existen
    
    Example:
        >>> model, scaler, config = load_lead_quality_model()
        >>> print(config['feature_columns'])
    """
    model_path = MODELS_DIR / 'lead_quality_model.joblib'
    scaler_path = MODELS_DIR / 'lead_quality_scaler.joblib'
    config_path = MODELS_DIR / 'feature_config_leads.json'
    
    if not model_path.exists():
        raise FileNotFoundError(f"Modelo no encontrado: {model_path}")
    if not scaler_path.exists():
        raise FileNotFoundError(f"Scaler no encontrado: {scaler_path}")
    if not config_path.exists():
        raise FileNotFoundError(f"Config no encontrado: {config_path}")
    
    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    
    with open(config_path, 'r', encoding='utf-8') as f:
        config = json.load(f)
    
    return model, scaler, config


def load_churn_model() -> Tuple[Any, Any, Dict]:
    """
    Carga el modelo de predicción de churn, su scaler y configuración de features.
    
    Returns:
        tuple: (model, scaler, feature_config)
        
    Raises:
        FileNotFoundError: Si los archivos del modelo no existen
    
    Example:
        >>> model, scaler, config = load_churn_model()
        >>> print(config['feature_columns'])
    """
    model_path = MODELS_DIR / 'churn_model.joblib'
    scaler_path = MODELS_DIR / 'churn_scaler.joblib'
    config_path = MODELS_DIR / 'feature_config_churn.json'
    
    if not model_path.exists():
        raise FileNotFoundError(f"Modelo no encontrado: {model_path}")
    if not scaler_path.exists():
        raise FileNotFoundError(f"Scaler no encontrado: {scaler_path}")
    if not config_path.exists():
        raise FileNotFoundError(f"Config no encontrado: {config_path}")
    
    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    
    with open(config_path, 'r', encoding='utf-8') as f:
        config = json.load(f)
    
    return model, scaler, config


def predict_lead_quality(sample_dict: dict) -> Dict[str, Any]:
    """
    Predice la calidad de un lead individual.
    
    Args:
        sample_dict: Diccionario con los siguientes campos:
            - presupuesto (str): 'Menos de 5M', '5M-10M', '10M-20M', '20M-50M', 'Más de 50M'
            - urgencia (str): 'Baja', 'Media', 'Alta', 'Inmediata'
            - tipo_servicio (str): Tipo de servicio solicitado
            - ciudad (str): Ciudad del lead
    
    Returns:
        dict: Diccionario con:
            - quality_label (str): 'caliente', 'tibio', o 'frío'
            - quality_score (float): Score de probabilidad (0-1) de ser de alta calidad
            - probabilities (dict): Probabilidades para cada clase
    
    Example:
        >>> lead = {
        ...     'presupuesto': '10M-20M',
        ...     'urgencia': 'Alta',
        ...     'tipo_servicio': 'Desarrollo',
        ...     'ciudad': 'Bogotá'
        ... }
        >>> result = predict_lead_quality(lead)
        >>> print(f"Calidad: {result['quality_label']}, Score: {result['quality_score']:.2f}")
    """
    model, scaler, config = load_lead_quality_model()
    
    # Get mappings from config
    presupuesto_map = config['presupuesto_map']
    urgencia_map = config['urgencia_map']
    tipo_servicio_classes = config['tipo_servicio_classes']
    ciudad_classes = config['ciudad_classes']
    calidad_reverse_map = {int(k): v for k, v in config['calidad_reverse_map'].items()}
    
    # Create encoders for categorical variables
    presupuesto_val = presupuesto_map.get(sample_dict.get('presupuesto', 'Menos de 5M'), 2.5)
    urgencia_val = urgencia_map.get(sample_dict.get('urgencia', 'Baja'), 1)
    
    # Encode tipo_servicio
    tipo_servicio = sample_dict.get('tipo_servicio', tipo_servicio_classes[0])
    tipo_servicio_val = tipo_servicio_classes.index(tipo_servicio) if tipo_servicio in tipo_servicio_classes else 0
    
    # Encode ciudad
    ciudad = sample_dict.get('ciudad', ciudad_classes[0])
    ciudad_val = ciudad_classes.index(ciudad) if ciudad in ciudad_classes else 0
    
    # Prepare features
    features = np.array([[
        presupuesto_val,
        urgencia_val,
        tipo_servicio_val,
        ciudad_val
    ]])
    
    # Scale and predict
    features_scaled = scaler.transform(features)
    probabilities = model.predict_proba(features_scaled)[0]
    predicted_class = model.predict(features_scaled)[0]
    
    # Map to quality labels
    quality_labels = ['frío', 'tibio', 'caliente']
    quality_label = quality_labels[predicted_class]
    
    # Get probability of being 'caliente' (high quality)
    quality_score = float(probabilities[2])  # Probability of class 2 (caliente)
    
    return {
        'quality_label': quality_label,
        'quality_score': quality_score,
        'probabilities': {
            'frío': float(probabilities[0]),
            'tibio': float(probabilities[1]),
            'caliente': float(probabilities[2])
        }
    }


def predict_churn(sample_dict: dict) -> Dict[str, Any]:
    """
    Predice la probabilidad de churn de un cliente individual.
    
    Args:
        sample_dict: Diccionario con los siguientes campos:
            - engagement (str): 'Bajo', 'Medio', 'Alto'
            - satisfaccion (str): 'Bajo', 'Medio', 'Alto'
            - dias_ultima_compra (int): Días desde la última compra
            - total_compras (float): Suma total de compras en COP
            - promedio_compra (float): Promedio de compra por transacción
            - num_transacciones (int): Número total de transacciones
            - std_compra (float, opcional): Desviación estándar de compras
    
    Returns:
        dict: Diccionario con:
            - churn_probability (float): Probabilidad de churn (0-1)
    
    Example:
        >>> client = {
        ...     'engagement': 'Medio',
        ...     'satisfaccion': 'Alto',
        ...     'dias_ultima_compra': 45,
        ...     'total_compras': 50000000,
        ...     'promedio_compra': 10000000,
        ...     'num_transacciones': 5,
        ...     'std_compra': 2000000
        ... }
        >>> result = predict_churn(client)
        >>> print(f"Probabilidad de churn: {result['churn_probability']:.1%}")
    """
    model, scaler, config = load_churn_model()
    
    # Get mappings from config
    engagement_map = config['engagement_map']
    satisfaccion_map = config['satisfaccion_map']
    
    # Encode categorical variables
    engagement_val = engagement_map.get(sample_dict.get('engagement', 'Medio'), 1)
    satisfaccion_val = satisfaccion_map.get(sample_dict.get('satisfaccion', 'Medio'), 1)
    
    # Prepare features
    features = np.array([[
        engagement_val,
        satisfaccion_val,
        sample_dict.get('dias_ultima_compra', 30),
        sample_dict.get('total_compras', 0),
        sample_dict.get('promedio_compra', 0),
        sample_dict.get('num_transacciones', 0),
        sample_dict.get('std_compra', 0)
    ]])
    
    # Scale and predict
    features_scaled = scaler.transform(features)
    churn_probability = model.predict_proba(features_scaled)[0][1]
    
    return {
        'churn_probability': float(churn_probability)
    }


def batch_predict_leads(leads_list: List[Dict[str, Any]]) -> pd.DataFrame:
    """
    Predice calidad para múltiples leads en batch.
    
    Args:
        leads_list: Lista de diccionarios con datos de leads
    
    Returns:
        pd.DataFrame: DataFrame con leads originales + columnas de predicción:
            - predicted_quality_label
            - predicted_quality_score
            - prob_frio, prob_tibio, prob_caliente
    
    Example:
        >>> leads = [
        ...     {'presupuesto': '10M-20M', 'urgencia': 'Alta', 'tipo_servicio': 'Desarrollo', 'ciudad': 'Bogotá'},
        ...     {'presupuesto': '5M-10M', 'urgencia': 'Media', 'tipo_servicio': 'Consultoría', 'ciudad': 'Medellín'}
        ... ]
        >>> df_results = batch_predict_leads(leads)
        >>> print(df_results[['predicted_quality_label', 'predicted_quality_score']])
    """
    results = []
    for lead in leads_list:
        prediction = predict_lead_quality(lead)
        results.append({
            **lead,
            'predicted_quality_label': prediction['quality_label'],
            'predicted_quality_score': prediction['quality_score'],
            'prob_frio': prediction['probabilities']['frío'],
            'prob_tibio': prediction['probabilities']['tibio'],
            'prob_caliente': prediction['probabilities']['caliente']
        })
    
    return pd.DataFrame(results)


def batch_predict_churn(clients_list: List[Dict[str, Any]]) -> pd.DataFrame:
    """
    Predice churn para múltiples clientes en batch.
    
    Args:
        clients_list: Lista de diccionarios con datos de clientes
    
    Returns:
        pd.DataFrame: DataFrame con clientes originales + columna 'churn_probability'
    
    Example:
        >>> clients = [
        ...     {'engagement': 'Bajo', 'satisfaccion': 'Medio', 'dias_ultima_compra': 120, 
        ...      'total_compras': 5000000, 'promedio_compra': 1000000, 'num_transacciones': 5, 'std_compra': 200000},
        ...     {'engagement': 'Alto', 'satisfaccion': 'Alto', 'dias_ultima_compra': 15,
        ...      'total_compras': 50000000, 'promedio_compra': 10000000, 'num_transacciones': 5, 'std_compra': 2000000}
        ... ]
        >>> df_churn = batch_predict_churn(clients)
        >>> print(df_churn[['churn_probability']])
    """
    results = []
    for client in clients_list:
        prediction = predict_churn(client)
        results.append({
            **client,
            'churn_probability': prediction['churn_probability']
        })
    
    return pd.DataFrame(results)
