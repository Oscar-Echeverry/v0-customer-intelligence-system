import type { ClienteComportamiento, ClienteTransaccion, ChurnClient } from "./types"

export function calculateChurnRisk(
  comportamiento: ClienteComportamiento[],
  transacciones: ClienteTransaccion[],
): ChurnClient[] {
  // Join both datasets by client_id
  const clientsMap = new Map<number, ChurnClient>()

  comportamiento.forEach((comp) => {
    const trans = transacciones.find((t) => t.id_cliente === comp.id_cliente)
    if (!trans) return

    // Calculate churn probability using heuristic rules
    let churnProb = 0

    // Days since last purchase (weight: 0.35)
    // More days = higher churn risk
    const daysFactor = Math.min(comp.dias_desde_ultima_compra / 180, 1)
    churnProb += daysFactor * 0.35

    // Frequency (weight: 0.25)
    // Lower frequency = higher churn risk
    const frequencyFactor = Math.max(0, 1 - comp.frecuencia_compra / 10)
    churnProb += frequencyFactor * 0.25

    // Satisfaction (weight: 0.2)
    // Lower satisfaction = higher churn risk
    const satisfactionFactor = 1 - comp.satisfaccion / 10
    churnProb += satisfactionFactor * 0.2

    // Engagement (weight: 0.2)
    // Lower engagement = higher churn risk
    const engagementFactor = 1 - comp.engagement
    churnProb += engagementFactor * 0.2

    // Normalize to 0-1
    churnProb = Math.max(0, Math.min(1, churnProb))

    // Calculate months as client (approximate from frequency)
    const monthsAsClient = Math.max(1, comp.frecuencia_compra * 2)

    const client: ChurnClient = {
      client_id: comp.id_cliente,
      name: `Cliente ${comp.id_cliente}`,
      monthly_investment: trans.presupuesto,
      months_as_client: monthsAsClient,
      churn_probability: Math.round(churnProb * 100) / 100,
      potential_loss: Math.round(churnProb * trans.presupuesto),
      engagement: comp.engagement,
      satisfaction: comp.satisfaccion,
      days_since_last_purchase: comp.dias_desde_ultima_compra,
      industry: trans.industria,
      company_size: trans.tamaño_empresa,
    }

    clientsMap.set(comp.id_cliente, client)
  })

  return Array.from(clientsMap.values())
}
