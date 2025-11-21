import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { parseCSV } from "@/lib/csv-parser"

const mockInsights = {
  summary:
    "De 12 leads capturados en el período de demostración, 7 son calientes (58.3%). El canal con mejor rendimiento es Web con 65.0% de conversión.",
  total_leads: 12,
  hot_leads: 7,
  conversion_rate: 58.3,
  best_channel: "Web",
  best_channel_rate: 65.0,
  active_clients: 15,
  total_clients: 20,
  total_revenue: 45000000,
  channel_performance: [
    { channel: "Web", total: 6, conversion_rate: 65.0 },
    { channel: "Referido", total: 4, conversion_rate: 55.0 },
    { channel: "Email", total: 2, conversion_rate: 40.0 },
  ],
}

export async function GET(request: NextRequest) {
  try {
    let leadsPath = path.join(process.cwd(), "public", "data", "leads_historicos.csv")
    let behaviorPath = path.join(process.cwd(), "public", "data", "clientes_comportamiento.csv")
    let transactionsPath = path.join(process.cwd(), "public", "data", "clientes_transacciones.csv")

    try {
      await fs.access(leadsPath)
    } catch {
      try {
        leadsPath = path.join(process.cwd(), "data", "leads_historicos.csv")
        behaviorPath = path.join(process.cwd(), "data", "clientes_comportamiento.csv")
        transactionsPath = path.join(process.cwd(), "data", "clientes_transacciones.csv")
        await fs.access(leadsPath)
      } catch {
        console.log("[v0] CSV files not found, using mock insights")
        return NextResponse.json(mockInsights)
      }
    }

    const [leadsContent, behaviorContent, transactionsContent] = await Promise.all([
      fs.readFile(leadsPath, "utf-8"),
      fs.readFile(behaviorPath, "utf-8"),
      fs.readFile(transactionsPath, "utf-8"),
    ])

    const leads = parseCSV(leadsContent)
    const behavior = parseCSV(behaviorContent)
    const transactions = parseCSV(transactionsContent)

    const totalLeads = leads.length
    const calienteLeads = leads.filter((l: any) => l.quality_label === "caliente").length
    const conversionRate = totalLeads > 0 ? (calienteLeads / totalLeads) * 100 : 0

    const channelStats = leads.reduce((acc: any, lead: any) => {
      if (!acc[lead.channel]) {
        acc[lead.channel] = { total: 0, caliente: 0 }
      }
      acc[lead.channel].total++
      if (lead.quality_label === "caliente") {
        acc[lead.channel].caliente++
      }
      return acc
    }, {})

    const channelInsights = Object.entries(channelStats).map(([channel, stats]: [string, any]) => ({
      channel,
      total: stats.total,
      conversion_rate: (stats.caliente / stats.total) * 100,
    }))

    const bestChannel = channelInsights.reduce(
      (best, current) => (current.conversion_rate > best.conversion_rate ? current : best),
      channelInsights[0],
    )

    const activeClients = behavior.filter((c: any) => Number.parseInt(c.dias_desde_ultima_interaccion) < 30).length

    const totalRevenue = transactions.reduce((sum: number, t: any) => sum + Number.parseFloat(t.valor_total || 0), 0)

    const insights = {
      summary: `De ${totalLeads} leads capturados, ${calienteLeads} son calientes (${conversionRate.toFixed(1)}%). El canal con mejor rendimiento es ${bestChannel?.channel || "N/A"} con ${bestChannel?.conversion_rate.toFixed(1)}% de conversión.`,
      total_leads: totalLeads,
      hot_leads: calienteLeads,
      conversion_rate: conversionRate,
      best_channel: bestChannel?.channel || "N/A",
      best_channel_rate: bestChannel?.conversion_rate || 0,
      active_clients: activeClients,
      total_clients: behavior.length,
      total_revenue: totalRevenue,
      channel_performance: channelInsights,
    }

    return NextResponse.json(insights)
  } catch (error) {
    console.error("[v0] Error generating insights:", error)
    return NextResponse.json(mockInsights)
  }
}
