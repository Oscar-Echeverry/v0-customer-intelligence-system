import { type NextRequest, NextResponse } from "next/server"

// In-memory store for captured leads
const capturedLeads: any[] = []

// Mock historical leads data for when CSV files are not available
const mockHistoricalLeads = [
  {
    id: "1",
    name: "María González",
    city: "Bogotá",
    channel: "Web",
    budget: 5000000,
    urgency: 5,
    service_type: "Desarrollo de Software",
    quality_label: "caliente",
    quality_score: 0.92,
    created_at: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    name: "Carlos Rodríguez",
    city: "Medellín",
    channel: "Referido",
    budget: 3500000,
    urgency: 4,
    service_type: "Consultoría",
    quality_label: "caliente",
    quality_score: 0.85,
    created_at: "2024-01-16T14:20:00Z",
  },
  {
    id: "3",
    name: "Ana Martínez",
    city: "Cali",
    channel: "Email",
    budget: 2000000,
    urgency: 3,
    service_type: "Diseño",
    quality_label: "tibio",
    quality_score: 0.65,
    created_at: "2024-01-17T09:45:00Z",
  },
  {
    id: "4",
    name: "Jorge López",
    city: "Barranquilla",
    channel: "Web",
    budget: 8000000,
    urgency: 5,
    service_type: "Desarrollo de Software",
    quality_label: "caliente",
    quality_score: 0.95,
    created_at: "2024-01-18T11:15:00Z",
  },
  {
    id: "5",
    name: "Laura Pérez",
    city: "Bogotá",
    channel: "Redes Sociales",
    budget: 1500000,
    urgency: 2,
    service_type: "Marketing",
    quality_label: "frío",
    quality_score: 0.45,
    created_at: "2024-01-19T16:30:00Z",
  },
  {
    id: "6",
    name: "Roberto Sánchez",
    city: "Cartagena",
    channel: "Web",
    budget: 4500000,
    urgency: 4,
    service_type: "Consultoría",
    quality_label: "caliente",
    quality_score: 0.88,
    created_at: "2024-01-20T08:00:00Z",
  },
  {
    id: "7",
    name: "Patricia Ramírez",
    city: "Medellín",
    channel: "Referido",
    budget: 2500000,
    urgency: 3,
    service_type: "Diseño",
    quality_label: "tibio",
    quality_score: 0.68,
    created_at: "2024-01-21T13:45:00Z",
  },
  {
    id: "8",
    name: "Miguel Torres",
    city: "Bucaramanga",
    channel: "Email",
    budget: 1000000,
    urgency: 2,
    service_type: "Soporte",
    quality_label: "frío",
    quality_score: 0.42,
    created_at: "2024-01-22T10:20:00Z",
  },
  {
    id: "9",
    name: "Sofía Hernández",
    city: "Bogotá",
    channel: "Web",
    budget: 6000000,
    urgency: 5,
    service_type: "Desarrollo de Software",
    quality_label: "caliente",
    quality_score: 0.9,
    created_at: "2024-01-23T15:10:00Z",
  },
  {
    id: "10",
    name: "Diego Morales",
    city: "Cali",
    channel: "Redes Sociales",
    budget: 3000000,
    urgency: 3,
    service_type: "Marketing",
    quality_label: "tibio",
    quality_score: 0.7,
    created_at: "2024-01-24T09:30:00Z",
  },
  {
    id: "11",
    name: "Camila Vargas",
    city: "Pereira",
    channel: "Web",
    budget: 7000000,
    urgency: 5,
    service_type: "Desarrollo de Software",
    quality_label: "caliente",
    quality_score: 0.93,
    created_at: "2024-01-25T12:00:00Z",
  },
  {
    id: "12",
    name: "Andrés Castillo",
    city: "Manizales",
    channel: "Referido",
    budget: 2200000,
    urgency: 3,
    service_type: "Consultoría",
    quality_label: "tibio",
    quality_score: 0.62,
    created_at: "2024-01-26T14:40:00Z",
  },
]

export async function GET(request: NextRequest) {
  try {
    // Combine captured leads with mock historical data
    const allLeads = [...capturedLeads, ...mockHistoricalLeads]

    // Add quality_score and quality_label to any leads that don't have them
    const enrichedLeads = allLeads.map((lead) => ({
      ...lead,
      quality_score: lead.quality_score || 0.5,
      quality_label: lead.quality_label || "tibio",
    }))

    return NextResponse.json(enrichedLeads)
  } catch (error) {
    console.error("[v0] Error loading leads:", error)
    return NextResponse.json({ error: "Failed to load leads data" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const urgency = body.urgency || 3
    const budget = body.budget || 0

    // Simple quality scoring logic
    let quality_score = 0.5
    let quality_label = "tibio"

    if (urgency >= 4 && budget >= 4000000) {
      quality_score = 0.85 + Math.random() * 0.15
      quality_label = "caliente"
    } else if (urgency >= 3 && budget >= 2000000) {
      quality_score = 0.55 + Math.random() * 0.2
      quality_label = "tibio"
    } else {
      quality_score = 0.3 + Math.random() * 0.2
      quality_label = "frío"
    }

    const newLead = {
      id: `lead-${Date.now()}`,
      ...body,
      quality_score,
      quality_label,
      created_at: new Date().toISOString(),
    }

    capturedLeads.unshift(newLead)

    return NextResponse.json(
      {
        success: true,
        message: "Lead saved successfully",
        lead: newLead,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Error saving lead:", error)
    return NextResponse.json(
      {
        error: "Failed to save lead",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
