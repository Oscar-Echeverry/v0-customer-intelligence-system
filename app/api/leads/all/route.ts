import { NextResponse } from "next/server"
import { parseCSV } from "@/lib/csv-parser"
import { scoreLead } from "@/lib/lead-scoring"
import type { LeadHistorico } from "@/lib/types"

let cachedLeads: LeadHistorico[] | null = null

async function getHistoricalLeads() {
  if (cachedLeads) return cachedLeads

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

  cachedLeads = rows.map((row) => {
    const lead = {
      nombre: row.nombre,
      ciudad: row.ciudad,
      presupuesto: Number.parseInt(row.presupuesto) || 0,
      urgencia: row.urgencia,
      servicio: row.servicio,
      canal: row.canal,
      convertido: row.convertido === "1" || row.convertido === "true",
    }

    const score = scoreLead(lead)

    return {
      ...lead,
      id: `HIST-${Math.random().toString(36).substr(2, 9)}`,
      calidad_predicha: score.quality,
      score: score.score,
      created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    }
  })

  return cachedLeads
}

export async function GET() {
  try {
    const leads = await getHistoricalLeads()
    return NextResponse.json(leads)
  } catch (error) {
    console.error("[v0] Error fetching historical leads:", error)
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 })
  }
}
