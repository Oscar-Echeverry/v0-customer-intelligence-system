import { type NextRequest, NextResponse } from "next/server"

const mockInsights = {
  text: `Basado en el análisis de los datos recientes:

• Los leads provenientes de WhatsApp Bot tienen una tasa de conversión del 34%, superando a otras fuentes.

• El 42% de los leads se clasifican como "calientes", indicando una alta calidad en la captación.

• Los servicios de Social Ads son los más demandados, representando el 45% de las solicitudes.

• Se detectaron 8 clientes en alto riesgo de abandono, con una pérdida potencial de $12.5M COP.

• La calidad promedio de los leads es de 68%, excelente para conversión.

Recomendaciones:
- Intensificar esfuerzos en canales de alto rendimiento como WhatsApp Bot
- Implementar estrategia de retención para los 8 clientes en riesgo
- Optimizar recursos hacia servicios de mayor demanda`,
  stats: {
    conversion_by_channel: {
      "WhatsApp Bot": 0.34,
      "Meta Ads": 0.28,
      "Google Ads": 0.31,
      Referidos: 0.42,
    },
    avg_lead_score: 0.68,
    top_service: "Social Ads",
    high_risk_count: 8,
  },
}

export async function GET(request: NextRequest) {
  return NextResponse.json(mockInsights)
}
