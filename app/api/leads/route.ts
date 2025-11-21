import { NextResponse } from "next/server"
import type { StoredLead } from "@/lib/types"

// In-memory storage for captured leads
const capturedLeads: StoredLead[] = []

export async function GET() {
  return NextResponse.json(capturedLeads)
}

export async function POST(request: Request) {
  try {
    const lead = await request.json()

    const storedLead: StoredLead = {
      ...lead,
      id: `LEAD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
    }

    capturedLeads.push(storedLead)

    return NextResponse.json(storedLead)
  } catch (error) {
    console.error("[v0] Error saving lead:", error)
    return NextResponse.json({ error: "Failed to save lead" }, { status: 500 })
  }
}
