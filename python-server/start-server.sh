#!/bin/bash

# Script para iniciar el servidor FastAPI de ML
# Customer Intelligence System

set -e

echo "🚀 Iniciando servidor Python FastAPI para modelos ML..."
echo ""

# Verificar si estamos en el directorio correcto
if [ ! -d "ml/models" ]; then
    echo "⚠️  Advertencia: Directorio ml/models no encontrado"
    echo "   Ejecuta primero: python ml/train_leads_and_churn.py"
    echo ""
fi

# Verificar si el entorno virtual existe
if [ ! -d "python-server/venv" ]; then
    echo "📦 Creando entorno virtual..."
    cd python-server
    python3 -m venv venv
    cd ..
fi

# Activar entorno virtual
echo "🔌 Activando entorno virtual..."
source python-server/venv/bin/activate

# Instalar dependencias
echo "📥 Instalando dependencias..."
pip install -q -r python-server/requirements.txt

# Iniciar servidor
echo ""
echo "✅ Todo listo!"
echo "🌐 Servidor escuchando en http://localhost:8000"
echo "📖 Documentación interactiva: http://localhost:8000/docs"
echo "🛑 Presiona Ctrl+C para detener el servidor"
echo ""

cd python-server
python main.py
