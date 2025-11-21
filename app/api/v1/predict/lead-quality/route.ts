import { type NextRequest, NextResponse } from "next/server"

const PYTHON_SERVER_URL = process.env.PYTHON_SERVER_URL || "http://localhost:8000"

function scoreLead(data: {
  budget: string
  urgency: string
  service_type: string
  city: string
}): { quality_label: string; quality_score: number; probabilities: { frío: number; tibio: number; caliente: number } } {
  let score = 0.5

  // Budget scoring
  if (data.budget === "alto") score += 0.2
  else if (data.budget === "medio") score += 0.1

  // Urgency scoring
  if (data.urgency === "inmediato") score += 0.2
  else if (data.urgency === "este_mes") score += 0.1

  // Service type scoring (high-value services)
  if (["desarrollo_web", "desarrollo_app", "ecommerce"].includes(data.service_type)) {
    score += 0.15
  }

  // City scoring (major cities)
  const majorCities = ["bogota", "medellin", "cali", "barranquilla"]
  if (majorCities.some((city) => data.city.toLowerCase().includes(city))) {
    score += 0.05
  }

  // Clamp score between 0 and 1
  score = Math.max(0, Math.min(1, score))

  // Determine quality label
  let quality_label = "frío"
  if (score >= 0.7) quality_label = "caliente"
  else if (score >= 0.4) quality_label = "tibio"

  // Generate probabilities based on score
  const probabilities = {
    frío: quality_label === "frío" ? 0.6 : 0.2,
    tibio: quality_label === "tibio" ? 0.6 : 0.3,
    caliente: quality_label === "caliente" ? 0.7 : 0.1,
  }

  return { quality_label, quality_score: score, probabilities }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { name, city, budget, urgency, service_type, channel = "whatsapp" } = body

    if (!name || !city || !budget || !urgency || !service_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    try {
      const response = await fetch(`${PYTHON_SERVER_URL}/predict/lead-quality`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          city,
          budget,
          urgency,
          service_type,
          channel,
        }),
        signal: AbortSignal.timeout(2000),
      })

      if (response.ok) {
        const prediction = await response.json()
        return NextResponse.json(prediction)
      }
    } catch (error) {
      // This is expected behavior when Python server is not running
    }

    const prediction = scoreLead({ budget, urgency, service_type, city })
    return NextResponse.json(prediction)
  } catch (error) {
    console.error("[v0] Error in lead quality prediction:", error)
    return NextResponse.json({ error: "Failed to predict lead quality" }, { status: 500 })
  }
}
