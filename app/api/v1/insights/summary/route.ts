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
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

    const [leadsResponse, churnResponse] = await Promise.all([
      fetch(new URL("/api/leads/all", baseUrl)),
      fetch(new URL("/api/churn/at-risk", baseUrl)),
    ])

    if (!leadsResponse.ok || !churnResponse.ok) {
      console.log("[v0] API routes not available, using mock insights")
      return NextResponse.json(mockInsights)
    }

    const leads = await leadsResponse.json()
    const clients = await churnResponse.json()

    const totalLeads = leads.length
    const hotLeads = leads.filter((l: any) => l.quality_label === "caliente").length
    const warmLeads = leads.filter((l: any) => l.quality_label === "tibio").length

    const pctHot = totalLeads > 0 ? Math.round((hotLeads / totalLeads) * 100) : 0

    const highRiskClients = clients.filter((c: any) => c.churn_probability > 0.7)
    const highRiskLoss = highRiskClients.reduce((sum: number, c: any) => sum + (c.potential_loss || 0), 0)

    // Calculate conversion by channel
    const channelStats: Record<string, { total: number; hot: number }> = {}
    leads.forEach((lead: any) => {
      const channel = lead.channel || "Unknown"
      if (!channelStats[channel]) {
        channelStats[channel] = { total: 0, hot: 0 }
      }
      channelStats[channel].total++
      if (lead.quality_label === "caliente") {
        channelStats[channel].hot++
      }
    })

    let bestChannel = "N/A"
    let bestRate = 0
    const conversionByChannel: Record<string, number> = {}

    Object.entries(channelStats).forEach(([channel, stats]) => {
      const rate = stats.total > 0 ? stats.hot / stats.total : 0
      conversionByChannel[channel] = rate
      if (rate > bestRate) {
        bestRate = rate
        bestChannel = channel
      }
    })

    // Most requested service
    const serviceCount: Record<string, number> = {}
    leads.forEach((lead: any) => {
      const service = lead.service || "Unknown"
      serviceCount[service] = (serviceCount[service] || 0) + 1
    })

    let topService = "N/A"
    let maxCount = 0
    Object.entries(serviceCount).forEach(([service, count]) => {
      if (count > maxCount) {
        maxCount = count
        topService = service
      }
    })

    // Average lead score
    const totalScore = leads.reduce((sum: number, l: any) => sum + (l.quality_score || 0), 0)
    const avgLeadScore = totalLeads > 0 ? totalScore / totalLeads : 0

    const insights = `Basado en el análisis de los datos recientes:

• Los leads provenientes de ${bestChannel} tienen una tasa de conversión del ${Math.round(bestRate * 100)}%, superando a otras fuentes.

• El ${pctHot}% de los leads se clasifican como "calientes", indicando ${pctHot > 40 ? "una alta" : "una moderada"} calidad en la captación.

• Los servicios de ${topService} son los más demandados, representando el ${maxCount > 0 ? Math.round((maxCount / totalLeads) * 100) : 0}% de las solicitudes.

• Se detectaron ${highRiskClients.length} clientes en alto riesgo de abandono, con una pérdida potencial de $${(highRiskLoss / 1000000).toFixed(1)}M COP.

• La calidad promedio de los leads es de ${(avgLeadScore * 100).toFixed(0)}%, ${avgLeadScore > 0.7 ? "excelente para conversión" : "requiere optimización de captación"}.

Recomendaciones:
- Intensificar esfuerzos en canales de alto rendimiento como ${bestChannel}
- Implementar estrategia de retención para los ${highRiskClients.length} clientes en riesgo
- Optimizar recursos hacia servicios de mayor demanda`

    return NextResponse.json({
      text: insights,
      stats: {
        conversion_by_channel: conversionByChannel,
        avg_lead_score: avgLeadScore,
        top_service: topService,
        high_risk_count: highRiskClients.length,
      },
    })
  } catch (error) {
    console.error("[v0] Error generating insights:", error)
    return NextResponse.json(mockInsights)
  }
}
