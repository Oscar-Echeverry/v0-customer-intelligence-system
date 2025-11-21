import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import (
    classification_report, 
    confusion_matrix, 
    roc_auc_score, 
    roc_curve,
    precision_score,
    recall_score,
    f1_score,
    accuracy_score
)
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
import json
import warnings
warnings.filterwarnings('ignore')

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "public" / "data"
MODELS_DIR = Path(__file__).resolve().parent / "models"

# Create models directory if it doesn't exist
MODELS_DIR.mkdir(exist_ok=True)

print("=" * 70)
print("ENTRENAMIENTO DE MODELOS - CUSTOMER INTELLIGENCE SYSTEM")
print("=" * 70)
print(f"\n📁 Directorio base: {BASE_DIR}")
print(f"📁 Directorio de datos: {DATA_DIR}")
print(f"📁 Directorio de modelos: {MODELS_DIR}")

# ============================================================================
# 1. MODELO DE CALIDAD DE LEADS (LEAD SCORING)
# ============================================================================
print("\n" + "=" * 70)
print("[1/2] MODELO DE CALIDAD DE LEADS (LEAD SCORING)")
print("=" * 70)

leads_csv = DATA_DIR / "leads_historicos.csv"
if not leads_csv.exists():
    print(f"\n⚠️  No se encontró {leads_csv}")
    print("   Por favor, asegúrate de que el archivo existe en public/data/")
    print("   Saltando entrenamiento del modelo de leads...")
else:
    # Load data
    leads_df = pd.read_csv(leads_csv)
    print(f"\n✅ Cargados {len(leads_df)} leads históricos")
    print(f"   Columnas: {list(leads_df.columns)}")

    presupuesto_map = {
        'Menos de 5M': 2.5,
        '5M-10M': 7.5,
        '10M-20M': 15,
        '20M-50M': 35,
        'Más de 50M': 75
    }

    urgencia_map = {
        'Baja': 1,
        'Media': 2,
        'Alta': 3,
        'Inmediata': 4
    }

    tipo_servicio_encoder = LabelEncoder()
    ciudad_encoder = LabelEncoder()

    leads_df['presupuesto_numeric'] = leads_df['presupuesto'].map(presupuesto_map)
    leads_df['urgencia_numeric'] = leads_df['urgencia'].map(urgencia_map)
    leads_df['tipo_servicio_encoded'] = tipo_servicio_encoder.fit_transform(leads_df['tipo_servicio'])
    leads_df['ciudad_encoded'] = ciudad_encoder.fit_transform(leads_df['ciudad'])

    calidad_map = {'Alta': 2, 'Media': 1, 'Baja': 0}
    leads_df['calidad_encoded'] = leads_df['calidad'].map(calidad_map)

    # Features
    feature_cols_leads = ['presupuesto_numeric', 'urgencia_numeric', 'tipo_servicio_encoded', 'ciudad_encoded']
    X_leads = leads_df[feature_cols_leads]
    y_leads = leads_df['calidad_encoded']

    print(f"\n📊 Distribución de calidad:")
    print(leads_df['calidad'].value_counts())

    # Split data
    X_train_leads, X_test_leads, y_train_leads, y_test_leads = train_test_split(
        X_leads, y_leads, test_size=0.2, random_state=42, stratify=y_leads
    )

    # Scale features
    scaler_leads = StandardScaler()
    X_train_leads_scaled = scaler_leads.fit_transform(X_train_leads)
    X_test_leads_scaled = scaler_leads.transform(X_test_leads)

    print("\n🔄 Comparando modelos...")
    
    models_to_compare = {
        'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42, multi_class='multinomial'),
        'Random Forest': RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            random_state=42,
            class_weight='balanced'
        )
    }

    best_model = None
    best_score = 0
    best_name = ""

    for name, model in models_to_compare.items():
        model.fit(X_train_leads_scaled, y_train_leads)
        score = accuracy_score(y_test_leads, model.predict(X_test_leads_scaled))
        f1 = f1_score(y_test_leads, model.predict(X_test_leads_scaled), average='macro')
        print(f"   • {name}: Accuracy={score:.3f}, F1-macro={f1:.3f}")
        
        if score > best_score:
            best_score = score
            best_model = model
            best_name = name

    print(f"\n✅ Mejor modelo: {best_name} (Accuracy: {best_score:.3f})")
    model_leads = best_model

    y_pred_leads = model_leads.predict(X_test_leads_scaled)
    accuracy_leads = accuracy_score(y_test_leads, y_pred_leads)
    f1_macro_leads = f1_score(y_test_leads, y_pred_leads, average='macro')

    print(f"\n📈 Métricas finales:")
    print(f"   • Accuracy: {accuracy_leads:.3f}")
    print(f"   • F1-Score (macro): {f1_macro_leads:.3f}")
    print(f"\n📋 Classification Report:")
    print(classification_report(y_test_leads, y_pred_leads, target_names=['Frío', 'Tibio', 'Caliente']))

    plt.figure(figsize=(8, 6))
    cm_leads = confusion_matrix(y_test_leads, y_pred_leads)
    sns.heatmap(cm_leads, annot=True, fmt='d', cmap='Blues', 
                xticklabels=['Frío', 'Tibio', 'Caliente'],
                yticklabels=['Frío', 'Tibio', 'Caliente'])
    plt.title(f'Matriz de Confusión - Modelo de Leads ({best_name})', fontsize=14, fontweight='bold')
    plt.xlabel('Predicción')
    plt.ylabel('Real')
    plt.tight_layout()
    plt.savefig(MODELS_DIR / 'lead_quality_confusion_matrix.png', dpi=150)
    print(f"   💾 Guardado: {MODELS_DIR / 'lead_quality_confusion_matrix.png'}")
    plt.close()

    if hasattr(model_leads, 'feature_importances_'):
        plt.figure(figsize=(10, 6))
        feature_importance = pd.DataFrame({
            'feature': feature_cols_leads,
            'importance': model_leads.feature_importances_
        }).sort_values('importance', ascending=False)

        sns.barplot(data=feature_importance, x='importance', y='feature', palette='viridis')
        plt.title('Importancia de Features - Modelo de Leads', fontsize=14, fontweight='bold')
        plt.xlabel('Importancia')
        plt.ylabel('Feature')
        plt.tight_layout()
        plt.savefig(MODELS_DIR / 'lead_quality_feature_importance.png', dpi=150)
        print(f"   💾 Guardado: {MODELS_DIR / 'lead_quality_feature_importance.png'}")
        plt.close()

    joblib.dump(model_leads, MODELS_DIR / 'lead_quality_model.joblib')
    joblib.dump(scaler_leads, MODELS_DIR / 'lead_quality_scaler.joblib')
    
    # Save feature configuration
    feature_config_leads = {
        'feature_columns': feature_cols_leads,
        'presupuesto_map': presupuesto_map,
        'urgencia_map': urgencia_map,
        'tipo_servicio_classes': tipo_servicio_encoder.classes_.tolist(),
        'ciudad_classes': ciudad_encoder.classes_.tolist(),
        'calidad_map': calidad_map,
        'calidad_reverse_map': {v: k for k, v in calidad_map.items()}
    }
    
    with open(MODELS_DIR / 'feature_config_leads.json', 'w', encoding='utf-8') as f:
        json.dump(feature_config_leads, f, indent=2, ensure_ascii=False)
    
    print(f"   💾 Modelo guardado: {MODELS_DIR / 'lead_quality_model.joblib'}")
    print(f"   💾 Scaler guardado: {MODELS_DIR / 'lead_quality_scaler.joblib'}")
    print(f"   💾 Config guardado: {MODELS_DIR / 'feature_config_leads.json'}")

# ============================================================================
# 2. MODELO DE PREDICCIÓN DE CHURN
# ============================================================================
print("\n" + "=" * 70)
print("[2/2] MODELO DE PREDICCIÓN DE CHURN")
print("=" * 70)

comportamiento_csv = DATA_DIR / "clientes_comportamiento.csv"
transacciones_csv = DATA_DIR / "clientes_transacciones.csv"

if not comportamiento_csv.exists():
    print(f"\n⚠️  No se encontró {comportamiento_csv}")
    print("   Por favor, asegúrate de que el archivo existe en public/data/")
    print("   Saltando entrenamiento del modelo de churn...")
elif not transacciones_csv.exists():
    print(f"\n⚠️  No se encontró {transacciones_csv}")
    print("   Por favor, asegúrate de que el archivo existe en public/data/")
    print("   Saltando entrenamiento del modelo de churn...")
else:
    # Load data
    comportamiento_df = pd.read_csv(comportamiento_csv)
    transacciones_df = pd.read_csv(transacciones_csv)
    print(f"\n✅ Cargados {len(comportamiento_df)} clientes con comportamiento")
    print(f"✅ Cargadas {len(transacciones_df)} transacciones")

    # Aggregate transactions per client
    trans_agg = transacciones_df.groupby('cliente_id').agg({
        'monto_cop': ['sum', 'mean', 'count', 'std'],
        'fecha_transaccion': 'max'
    }).reset_index()

    trans_agg.columns = ['cliente_id', 'total_compras', 'promedio_compra', 'num_transacciones', 'std_compra', 'fecha_ultima_transaccion']
    trans_agg['std_compra'] = trans_agg['std_compra'].fillna(0)

    # Merge datasets
    churn_df = comportamiento_df.merge(trans_agg, on='cliente_id', how='left')

    # Encode categorical features
    engagement_map = {'Bajo': 0, 'Medio': 1, 'Alto': 2}
    satisfaccion_map = {'Bajo': 0, 'Medio': 1, 'Alto': 2}

    churn_df['engagement_encoded'] = churn_df['nivel_engagement'].map(engagement_map)
    churn_df['satisfaccion_encoded'] = churn_df['nivel_satisfaccion'].map(satisfaccion_map)

    # Fill NaN for clients without transactions
    churn_df['total_compras'] = churn_df['total_compras'].fillna(0)
    churn_df['promedio_compra'] = churn_df['promedio_compra'].fillna(0)
    churn_df['num_transacciones'] = churn_df['num_transacciones'].fillna(0)
    churn_df['std_compra'] = churn_df['std_compra'].fillna(0)

    churn_df['churn'] = (
        (churn_df['engagement_encoded'] == 0) | 
        (churn_df['satisfaccion_encoded'] == 0) | 
        (churn_df['dias_ultima_compra'] > 90)
    ).astype(int)

    print(f"\n📊 Distribución de churn:")
    print(churn_df['churn'].value_counts())
    print(f"   Tasa de churn: {churn_df['churn'].mean():.1%}")

    # Features
    feature_cols_churn = [
        'engagement_encoded', 
        'satisfaccion_encoded', 
        'dias_ultima_compra',
        'total_compras', 
        'promedio_compra', 
        'num_transacciones',
        'std_compra'
    ]
    X_churn = churn_df[feature_cols_churn]
    y_churn = churn_df['churn']

    # Split data
    X_train_churn, X_test_churn, y_train_churn, y_test_churn = train_test_split(
        X_churn, y_churn, test_size=0.2, random_state=42, stratify=y_churn
    )

    # Scale features
    scaler_churn = StandardScaler()
    X_train_churn_scaled = scaler_churn.fit_transform(X_train_churn)
    X_test_churn_scaled = scaler_churn.transform(X_test_churn)

    print("\n🔄 Comparando modelos...")
    
    models_churn_to_compare = {
        'Random Forest': RandomForestClassifier(
            n_estimators=150,
            max_depth=8,
            random_state=42,
            class_weight='balanced'
        ),
        'Gradient Boosting': GradientBoostingClassifier(
            n_estimators=150,
            learning_rate=0.1,
            max_depth=5,
            random_state=42
        )
    }

    best_model_churn = None
    best_auc = 0
    best_name_churn = ""

    for name, model in models_churn_to_compare.items():
        model.fit(X_train_churn_scaled, y_train_churn)
        y_proba = model.predict_proba(X_test_churn_scaled)[:, 1]
        auc = roc_auc_score(y_test_churn, y_proba)
        print(f"   • {name}: ROC-AUC={auc:.3f}")
        
        if auc > best_auc:
            best_auc = auc
            best_model_churn = model
            best_name_churn = name

    print(f"\n✅ Mejor modelo: {best_name_churn} (ROC-AUC: {best_auc:.3f})")
    model_churn = best_model_churn

    y_pred_churn = model_churn.predict(X_test_churn_scaled)
    y_proba_churn = model_churn.predict_proba(X_test_churn_scaled)[:, 1]
    
    precision_churn = precision_score(y_test_churn, y_pred_churn)
    recall_churn = recall_score(y_test_churn, y_pred_churn)
    f1_churn = f1_score(y_test_churn, y_pred_churn)
    auc_churn = roc_auc_score(y_test_churn, y_proba_churn)

    print(f"\n📈 Métricas finales:")
    print(f"   • ROC-AUC: {auc_churn:.3f}")
    print(f"   • Precision: {precision_churn:.3f}")
    print(f"   • Recall: {recall_churn:.3f}")
    print(f"   • F1-Score: {f1_churn:.3f}")
    print(f"\n📋 Classification Report:")
    print(classification_report(y_test_churn, y_pred_churn, target_names=['No Churn', 'Churn']))

    plt.figure(figsize=(8, 6))
    cm_churn = confusion_matrix(y_test_churn, y_pred_churn)
    sns.heatmap(cm_churn, annot=True, fmt='d', cmap='Reds',
                xticklabels=['No Churn', 'Churn'],
                yticklabels=['No Churn', 'Churn'])
    plt.title(f'Matriz de Confusión - Modelo de Churn ({best_name_churn})', fontsize=14, fontweight='bold')
    plt.xlabel('Predicción')
    plt.ylabel('Real')
    plt.tight_layout()
    plt.savefig(MODELS_DIR / 'churn_confusion_matrix.png', dpi=150)
    print(f"   💾 Guardado: {MODELS_DIR / 'churn_confusion_matrix.png'}")
    plt.close()

    plt.figure(figsize=(10, 6))
    feature_importance_churn = pd.DataFrame({
        'feature': feature_cols_churn,
        'importance': model_churn.feature_importances_
    }).sort_values('importance', ascending=False)

    sns.barplot(data=feature_importance_churn, x='importance', y='feature', palette='rocket')
    plt.title('Importancia de Features - Modelo de Churn', fontsize=14, fontweight='bold')
    plt.xlabel('Importancia')
    plt.ylabel('Feature')
    plt.tight_layout()
    plt.savefig(MODELS_DIR / 'churn_feature_importance.png', dpi=150)
    print(f"   💾 Guardado: {MODELS_DIR / 'churn_feature_importance.png'}")
    plt.close()

    plt.figure(figsize=(8, 6))
    fpr, tpr, _ = roc_curve(y_test_churn, y_proba_churn)
    plt.plot(fpr, tpr, color='darkorange', lw=2, label=f'ROC curve (AUC = {auc_churn:.3f})')
    plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--', label='Random')
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title('Curva ROC - Modelo de Churn', fontsize=14, fontweight='bold')
    plt.legend(loc="lower right")
    plt.grid(alpha=0.3)
    plt.tight_layout()
    plt.savefig(MODELS_DIR / 'churn_roc_curve.png', dpi=150)
    print(f"   💾 Guardado: {MODELS_DIR / 'churn_roc_curve.png'}")
    plt.close()

    plt.figure(figsize=(10, 6))
    plt.hist(y_proba_churn[y_test_churn == 0], bins=30, alpha=0.6, label='No Churn', color='green')
    plt.hist(y_proba_churn[y_test_churn == 1], bins=30, alpha=0.6, label='Churn', color='red')
    plt.xlabel('Probabilidad de Churn')
    plt.ylabel('Frecuencia')
    plt.title('Distribución de Probabilidades de Churn', fontsize=14, fontweight='bold')
    plt.legend()
    plt.grid(alpha=0.3)
    plt.tight_layout()
    plt.savefig(MODELS_DIR / 'churn_probability_distribution.png', dpi=150)
    print(f"   💾 Guardado: {MODELS_DIR / 'churn_probability_distribution.png'}")
    plt.close()

    joblib.dump(model_churn, MODELS_DIR / 'churn_model.joblib')
    joblib.dump(scaler_churn, MODELS_DIR / 'churn_scaler.joblib')
    
    # Save feature configuration
    feature_config_churn = {
        'feature_columns': feature_cols_churn,
        'engagement_map': engagement_map,
        'satisfaccion_map': satisfaccion_map
    }
    
    with open(MODELS_DIR / 'feature_config_churn.json', 'w', encoding='utf-8') as f:
        json.dump(feature_config_churn, f, indent=2, ensure_ascii=False)
    
    print(f"   💾 Modelo guardado: {MODELS_DIR / 'churn_model.joblib'}")
    print(f"   💾 Scaler guardado: {MODELS_DIR / 'churn_scaler.joblib'}")
    print(f"   💾 Config guardado: {MODELS_DIR / 'feature_config_churn.json'}")

# ============================================================================
# RESUMEN FINAL
# ============================================================================
print("\n" + "=" * 70)
print("✅ ENTRENAMIENTO COMPLETADO")
print("=" * 70)
print(f"\n📁 Todos los archivos guardados en: {MODELS_DIR}")
print("\n🎯 Para ejecutar este script desde la raíz del proyecto:")
print("   python ml/train_leads_and_churn.py")
print("\n" + "=" * 70)
