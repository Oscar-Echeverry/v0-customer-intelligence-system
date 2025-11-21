import { NextResponse } from "next/server"
import { parseCSV } from "@/lib/csv-parser"
import { calculateChurnRisk } from "@/lib/churn-scoring"
import type { ClienteComportamiento, ClienteTransaccion } from "@/lib/types"

let cachedChurnData: ReturnType<typeof calculateChurnRisk> | null = null

async function getChurnData() {
  if (cachedChurnData) return cachedChurnData

  const baseUrl =
    typeof window === "undefined"
      ? process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000"
      : window.location.origin

  const [compResponse, transResponse] = await Promise.all([
    fetch(`${baseUrl}/data/clientes_comportamiento.csv`),
    fetch(`${baseUrl}/data/clientes_transacciones.csv`),
  ])

  if (!compResponse.ok || !transResponse.ok) {
    throw new Error("Failed to fetch CSV files")
  }

  const [compText, transText] = await Promise.all([compResponse.text(), transResponse.text()])

  const compRows = parseCSV(compText)
  const transRows = parseCSV(transText)

  const comportamiento: ClienteComportamiento[] = compRows.map((row) => ({
    id_cliente: Number.parseInt(row.id_cliente),
    frecuencia_compra: Number.parseInt(row.frecuencia_compra) || 0,
    engagement: Number.parseFloat(row.engagement) || 0,
    valor_historico: Number.parseInt(row.valor_historico) || 0,
    satisfaccion: Number.parseInt(row.satisfaccion) || 0,
    categoria_cliente: row.categoria_cliente,
    dias_desde_ultima_compra: Number.parseInt(row.dias_desde_ultima_compra) || 0,
    canal_preferido: row.canal_preferido,
  }))

  const transacciones: ClienteTransaccion[] = transRows.map((row) => ({
    id_cliente: Number.parseInt(row.id_cliente),
    presupuesto: Number.parseInt(row.presupuesto) || 0,
    tamaño_empresa: row.tamaño_empresa,
    industria: row.industria,
  }))

  cachedChurnData = calculateChurnRisk(comportamiento, transacciones)

  return cachedChurnData
}

export async function GET() {
  try {
    const churnData = await getChurnData()

    // Sort by potential_loss descending
    const sorted = [...churnData].sort((a, b) => b.potential_loss - a.potential_loss)

    return NextResponse.json(sorted)
  } catch (error) {
    console.error("[v0] Error calculating churn risk:", error)
    return NextResponse.json({ error: "Failed to calculate churn risk" }, { status: 500 })
  }
}
