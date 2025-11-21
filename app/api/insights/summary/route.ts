import { NextResponse } from "next/server"

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

    // Fetch data from other endpoints
    const [leadsResponse, churnResponse] = await Promise.all([
      fetch(new URL("/api/leads", baseUrl)),
      fetch(new URL("/api/churn/at-risk", baseUrl)),
    ])

    const leads = await leadsResponse.json()
    const clients = await churnResponse.json()

    // Calculate statistics
    const totalLeads = leads.length
    const hotLeads = leads.filter((l: any) => l.quality_label === "caliente").length
    const warmLeads = leads.filter((l: any) => l.quality_label === "tibio").length
    const coldLeads = leads.filter((l: any) => l.quality_label === "frío").length

    const pctHot = totalLeads > 0 ? Math.round((hotLeads / totalLeads) * 100) : 0
    const pctWarm = totalLeads > 0 ? Math.round((warmLeads / totalLeads) * 100) : 0
    const pctCold = totalLeads > 0 ? Math.round((coldLeads / totalLeads) * 100) : 0

    const highRiskClients = clients.filter((c: any) => c.churn_probability > 0.7)
    const highRiskLoss = highRiskClients.reduce((sum: number, c: any) => sum + c.potential_loss, 0)

    // Calculate best channel
    const channelStats: Record<string, { total: number; hot: number }> = {}
    leads.forEach((lead: any) => {
      if (!channelStats[lead.channel]) {
        channelStats[lead.channel] = { total: 0, hot: 0 }
      }
      channelStats[lead.channel].total++
      if (lead.quality_label === "caliente") {
        channelStats[lead.channel].hot++
      }
    })

    let bestChannel = "N/A"
    let bestRate = 0
    Object.entries(channelStats).forEach(([channel, stats]) => {
      const rate = stats.total > 0 ? stats.hot / stats.total : 0
      if (rate > bestRate) {
        bestRate = rate
        bestChannel = channel
      }
    })

    // Generate insights text
    const insights = `
**Análisis de Leads Capturados:**

- Del total de ${totalLeads} leads capturados, el ${pctHot}% son leads calientes (alta probabilidad de conversión), ${pctWarm}% tibios, y ${pctCold}% fríos.
${bestChannel !== "N/A" ? `- El canal con mejor desempeño es **${bestChannel}** con una tasa de conversión de ${Math.round(bestRate * 100)}% a leads calientes.` : ""}
${totalLeads > 0 ? `- Se recomienda priorizar el seguimiento inmediato de los ${hotLeads} leads calientes para maximizar conversiones.` : ""}

**Análisis de Riesgo de Churn:**

- Se han identificado **${highRiskClients.length} clientes** con alta probabilidad de churn (>70%).
- La pérdida potencial total de estos clientes de alto riesgo asciende a **$${highRiskLoss.toLocaleString("es-CO")} COP**.
- Es crítico implementar estrategias de retención inmediatas para estos clientes prioritarios.

**Recomendaciones:**

1. Contactar urgentemente a los leads calientes dentro de las primeras 24 horas.
2. Asignar un gerente de cuentas dedicado a los clientes de alto riesgo.
3. Analizar las razones de insatisfacción en clientes con baja engagement.
4. Invertir más presupuesto en ${bestChannel !== "N/A" ? bestChannel : "los canales"} de mejor desempeño.
    `.trim()

    return NextResponse.json({
      text: insights,
      stats: {
        total_leads: totalLeads,
        pct_hot_leads: pctHot,
        pct_warm_leads: pctWarm,
        pct_cold_leads: pctCold,
        total_clients: clients.length,
        high_risk_clients: highRiskClients.length,
        high_risk_potential_loss: highRiskLoss,
        best_channel: bestChannel,
      },
    })
  } catch (error) {
    console.error("[v0] Error generating insights:", error)
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 })
  }
}
