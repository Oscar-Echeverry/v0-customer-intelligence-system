import { NextResponse } from "next/server"

const PYTHON_SERVER_URL = process.env.PYTHON_SERVER_URL || "http://localhost:8000"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.city) {
      return NextResponse.json({ error: "Missing required fields: name, city" }, { status: 400 })
    }

    const response = await fetch(`${PYTHON_SERVER_URL}/predict/lead-quality`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Python server error:", errorText)

      // Return fallback response if Python server is down
      return NextResponse.json({
        quality_label: "tibio",
        quality_score: 0.5,
        probabilities: {
          frío: 0.3,
          tibio: 0.5,
          caliente: 0.2,
        },
      })
    }

    const prediction = await response.json()
    return NextResponse.json(prediction)
  } catch (error) {
    console.error("[v0] Error calling Python ML server:", error)

    return NextResponse.json({
      quality_label: "tibio",
      quality_score: 0.5,
      probabilities: {
        frío: 0.3,
        tibio: 0.5,
        caliente: 0.2,
      },
    })
  }
}
