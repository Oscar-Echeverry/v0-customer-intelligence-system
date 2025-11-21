import { NextResponse } from "next/server"
import { parseCSV } from "@/lib/csv-parser"

async function generateInsights() {
  const baseUrl =
    typeof window === "undefined"
      ? process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000"
      : window.location.origin

  const response = await fetch(`${baseUrl}/data/leads_historicos.csv`)

  if (!response.ok) {
    throw new Error("Failed to fetch leads CSV")
  }

  const csvText = await response.text()
  const rows = parseCSV(csvText)

  const leads = rows.map((row) => ({
    nombre: row.nombre,
    ciudad: row.ciudad,
    presupuesto: Number.parseInt(row.presupuesto) || 0,
    urgencia: row.urgencia,
    servicio: row.servicio,
    canal: row.canal,
    convertido: row.convertido === "1" || row.convertido === "true",
  }))

  // Calculate conversion rates by channel
  const channelStats = leads.reduce(
    (acc, lead) => {
      if (!acc[lead.canal]) {
        acc[lead.canal] = { total: 0, converted: 0 }
      }
      acc[lead.canal].total++
      if (lead.convertido) acc[lead.canal].converted++
      return acc
    },
    {} as Record<string, { total: number; converted: number }>,
  )

  const conversionByChannel = Object.entries(channelStats).map(([canal, stats]) => ({
    canal,
    conversion_rate: (stats.converted / stats.total) * 100,
    total_leads: stats.total,
  }))

  // Generate insights text
  const bestChannel = conversionByChannel.reduce((a, b) => (a.conversion_rate > b.conversion_rate ? a : b))

  const avgBudget = leads.reduce((sum, l) => sum + l.presupuesto, 0) / leads.length

  const highBudgetConversion =
    leads.filter((l) => l.presupuesto > avgBudget && l.convertido).length /
    leads.filter((l) => l.presupuesto > avgBudget).length

  const insights = `### Análisis de Performance de Canales

**Canal Más Efectivo**: ${bestChannel.canal} con ${bestChannel.conversion_rate.toFixed(1)}% de conversión

**Hallazgos Clave**:
- Los leads de ${bestChannel.canal} tienen la mejor tasa de conversión
- El presupuesto promedio es $${avgBudget.toFixed(0)}
- Los leads con presupuesto superior al promedio convierten al ${(highBudgetConversion * 100).toFixed(1)}%
- Total de leads analizados: ${leads.length}

**Recomendaciones**:
1. Incrementar inversión en ${bestChannel.canal}
2. Priorizar leads con presupuesto > $${avgBudget.toFixed(0)}
3. Mejorar seguimiento en canales con baja conversión`

  return {
    insights,
    conversionByChannel,
  }
}

export async function GET() {
  try {
    const data = await generateInsights()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error generating insights:", error)
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 })
  }
}
