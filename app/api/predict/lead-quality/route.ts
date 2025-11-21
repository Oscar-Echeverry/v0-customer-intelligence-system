import { NextResponse } from "next/server"
import { parseCSV } from "@/lib/csv-parser"
import { calculateLeadScore } from "@/lib/lead-scoring"
import type { NewLead, LeadHistorico } from "@/lib/types"

// Cache historical data
let cachedHistoricalData: LeadHistorico[] | null = null

async function getHistoricalData(): Promise<LeadHistorico[]> {
  if (cachedHistoricalData) return cachedHistoricalData

  const response = await fetch(
    new URL("/data/leads_historicos.csv", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  )
  const text = await response.text()
  const rows = parseCSV(text)

  cachedHistoricalData = rows.map((row) => ({
    lead_id: row.lead_id,
    fecha_lead: row.fecha_lead,
    industria: row.industria,
    programa_producto_interes: row.programa_producto_interes,
    tipo_campana: row.tipo_campana,
    fuente_meta: row.fuente_meta,
    dispositivo: row.dispositivo,
    hora_generacion: row.hora_generacion,
    cargo_lead: row.cargo_lead,
    empresa_lead: row.empresa_lead,
    ciudad: row.ciudad,
    urgencia_compra: Number.parseInt(row.urgencia_compra) || 0,
    interaccion_previa: row.interaccion_previa,
    horas_hasta_contacto: Number.parseInt(row.horas_hasta_contacto) || 0,
    lead_respondio: row.lead_respondio,
    intentos_contacto: Number.parseInt(row.intentos_contacto) || 0,
    observacion_asesor: row.observacion_asesor,
    status: row.status,
    compro: row.compro,
  }))

  return cachedHistoricalData
}

export async function POST(request: Request) {
  try {
    const lead: NewLead = await request.json()

    // Validate input
    if (!lead.name || !lead.city || !lead.urgency) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const historicalData = await getHistoricalData()
    const prediction = calculateLeadScore(lead, historicalData)

    return NextResponse.json(prediction)
  } catch (error) {
    console.error("[v0] Error predicting lead quality:", error)
    return NextResponse.json({ error: "Failed to predict lead quality" }, { status: 500 })
  }
}
