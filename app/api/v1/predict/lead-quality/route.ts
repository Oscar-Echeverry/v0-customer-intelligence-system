import { type NextRequest, NextResponse } from "next/server"
import { scoreLead } from "@/lib/lead-scoring"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[v0] POST /api/v1/predict/lead-quality - Predicting for:", body)

    const { name, city, budget, urgency, service_type, channel = "whatsapp" } = body

    if (!name || !city || !budget || !urgency || !service_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Score the lead
    const result = scoreLead({
      name,
      city,
      budget,
      urgency,
      service_type,
      channel,
    })

    console.log("[v0] Prediction result:", result)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error predicting lead quality:", error)
    return NextResponse.json({ error: "Failed to predict lead quality" }, { status: 500 })
  }
}
