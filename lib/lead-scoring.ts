import type { LeadHistorico, NewLead, LeadPrediction } from "./types"

// Calculate lead quality score using heuristic rules
export function calculateLeadScore(lead: NewLead, historicalData: LeadHistorico[]): LeadPrediction {
  let score = 0.5 // Base score

  // Urgency factor (1-5 scale, weight: 0.3)
  const urgencyScore = lead.urgency / 5
  score += urgencyScore * 0.3

  // Budget factor (higher budget = better lead, weight: 0.25)
  const avgBudget = 300000 // Average budget in COP
  const budgetScore = Math.min(lead.budget / (avgBudget * 2), 1)
  score += budgetScore * 0.25

  // Channel quality (based on historical conversion, weight: 0.2)
  const channelConversions: Record<string, { total: number; converted: number }> = {}
  historicalData.forEach((historicalLead) => {
    if (!channelConversions[historicalLead.fuente_meta]) {
      channelConversions[historicalLead.fuente_meta] = { total: 0, converted: 0 }
    }
    channelConversions[historicalLead.fuente_meta].total++
    if (historicalLead.compro === "Sí") {
      channelConversions[historicalLead.fuente_meta].converted++
    }
  })

  const channelRate = channelConversions[lead.channel]
    ? channelConversions[lead.channel].converted / channelConversions[lead.channel].total
    : 0.3
  score += channelRate * 0.2

  // Service type preference (weight: 0.15)
  const serviceConversions: Record<string, { total: number; converted: number }> = {}
  historicalData.forEach((historicalLead) => {
    const service = historicalLead.programa_producto_interes
    if (!serviceConversions[service]) {
      serviceConversions[service] = { total: 0, converted: 0 }
    }
    serviceConversions[service].total++
    if (historicalLead.compro === "Sí") {
      serviceConversions[service].converted++
    }
  })

  // City factor (weight: 0.1)
  const cityConversions: Record<string, { total: number; converted: number }> = {}
  historicalData.forEach((historicalLead) => {
    if (!cityConversions[historicalLead.ciudad]) {
      cityConversions[historicalLead.ciudad] = { total: 0, converted: 0 }
    }
    cityConversions[historicalLead.ciudad].total++
    if (historicalLead.compro === "Sí") {
      cityConversions[historicalLead.ciudad].converted++
    }
  })

  const cityRate = cityConversions[lead.city]
    ? cityConversions[lead.city].converted / cityConversions[lead.city].total
    : 0.3
  score += cityRate * 0.1

  // Normalize to 0-1
  score = Math.max(0, Math.min(1, score))

  // Determine quality label
  let quality_label: "caliente" | "tibio" | "frío"
  if (score >= 0.7) {
    quality_label = "caliente"
  } else if (score >= 0.4) {
    quality_label = "tibio"
  } else {
    quality_label = "frío"
  }

  return {
    quality_label,
    quality_score: Math.round(score * 100) / 100,
  }
}

export function scoreLead(lead: any): LeadPrediction {
  // Map input to NewLead structure if needed
  const newLead: NewLead = {
    name: lead.nombre || lead.name || "",
    city: lead.ciudad || lead.city || "",
    budget: lead.presupuesto || lead.budget || 0,
    urgency: lead.urgencia || lead.urgency || 0,
    service_type: lead.servicio || lead.service_type || "",
    channel: lead.canal || lead.channel || "",
  }

  // Simplified scoring without historical data dependency
  let score = 0.5

  // Urgency (0-5)
  score += (newLead.urgency / 5) * 0.3

  // Budget
  const avgBudget = 300000
  score += Math.min(newLead.budget / (avgBudget * 2), 1) * 0.25

  // Normalize
  score = Math.max(0, Math.min(1, score))

  let quality_label: "caliente" | "tibio" | "frío"
  if (score >= 0.7) {
    quality_label = "caliente"
  } else if (score >= 0.4) {
    quality_label = "tibio"
  } else {
    quality_label = "frío"
  }

  return {
    quality_label,
    quality_score: Math.round(score * 100) / 100,
  }
}
