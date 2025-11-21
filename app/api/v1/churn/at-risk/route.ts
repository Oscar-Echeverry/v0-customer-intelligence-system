import { NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabase-server"

const mockChurnClients = [
  {
    client_id: 1,
    name: "Inversiones Globales S.A.",
    monthly_investment: 8500000,
    months_as_client: 24,
    churn_probability: 0.85,
    potential_loss: 204000000,
  },
  {
    client_id: 2,
    name: "Tecnología Avanzada Ltda",
    monthly_investment: 6200000,
    months_as_client: 18,
    churn_probability: 0.78,
    potential_loss: 111600000,
  },
  {
    client_id: 3,
    name: "Servicios Financieros del Pacífico",
    monthly_investment: 5800000,
    months_as_client: 36,
    churn_probability: 0.72,
    potential_loss: 208800000,
  },
  {
    client_id: 4,
    name: "Grupo Industrial del Norte",
    monthly_investment: 4500000,
    months_as_client: 12,
    churn_probability: 0.88,
    potential_loss: 54000000,
  },
  {
    client_id: 5,
    name: "Comercializadora Internacional",
    monthly_investment: 7100000,
    months_as_client: 28,
    churn_probability: 0.65,
    potential_loss: 198800000,
  },
  {
    client_id: 6,
    name: "Soluciones Empresariales Premium",
    monthly_investment: 3200000,
    months_as_client: 8,
    churn_probability: 0.91,
    potential_loss: 25600000,
  },
  {
    client_id: 7,
    name: "Constructora del Valle",
    monthly_investment: 5500000,
    months_as_client: 32,
    churn_probability: 0.58,
    potential_loss: 176000000,
  },
  {
    client_id: 8,
    name: "Retail y Consumo Masivo",
    monthly_investment: 4800000,
    months_as_client: 16,
    churn_probability: 0.75,
    potential_loss: 76800000,
  },
  {
    client_id: 9,
    name: "Logística y Transporte S.A.S.",
    monthly_investment: 3900000,
    months_as_client: 20,
    churn_probability: 0.69,
    potential_loss: 78000000,
  },
  {
    client_id: 10,
    name: "Energía Renovable Colombia",
    monthly_investment: 6800000,
    months_as_client: 44,
    churn_probability: 0.42,
    potential_loss: 299200000,
  },
  {
    client_id: 11,
    name: "Telecomunicaciones Andinas",
    monthly_investment: 9200000,
    months_as_client: 52,
    churn_probability: 0.38,
    potential_loss: 478400000,
  },
  {
    client_id: 12,
    name: "Agro Inversiones del Caribe",
    monthly_investment: 2800000,
    months_as_client: 6,
    churn_probability: 0.94,
    potential_loss: 16800000,
  },
  {
    client_id: 13,
    name: "Farmacéutica Nacional",
    monthly_investment: 5200000,
    months_as_client: 40,
    churn_probability: 0.45,
    potential_loss: 208000000,
  },
  {
    client_id: 14,
    name: "Consultoría Estratégica Global",
    monthly_investment: 4100000,
    months_as_client: 14,
    churn_probability: 0.82,
    potential_loss: 57400000,
  },
  {
    client_id: 15,
    name: "Manufactura y Producción Industrial",
    monthly_investment: 7500000,
    months_as_client: 48,
    churn_probability: 0.51,
    potential_loss: 360000000,
  },
  {
    client_id: 16,
    name: "Educación Superior Privada",
    monthly_investment: 3600000,
    months_as_client: 22,
    churn_probability: 0.67,
    potential_loss: 79200000,
  },
  {
    client_id: 17,
    name: "Hotelería y Turismo Premium",
    monthly_investment: 5900000,
    months_as_client: 30,
    churn_probability: 0.61,
    potential_loss: 177000000,
  },
  {
    client_id: 18,
    name: "Seguros y Reaseguros del Sur",
    monthly_investment: 4400000,
    months_as_client: 26,
    churn_probability: 0.73,
    potential_loss: 114400000,
  },
  {
    client_id: 19,
    name: "Medios Digitales y Publicidad",
    monthly_investment: 3100000,
    months_as_client: 10,
    churn_probability: 0.89,
    potential_loss: 31000000,
  },
  {
    client_id: 20,
    name: "Banca de Inversión Regional",
    monthly_investment: 8900000,
    months_as_client: 38,
    churn_probability: 0.48,
    potential_loss: 338200000,
  },
]

export async function GET() {
  try {
    const supabase = getSupabaseClient()

    if (!supabase) {
      return NextResponse.json(mockChurnClients.sort((a, b) => b.churn_probability - a.churn_probability))
    }

    const { data, error } = await supabase
      .from("churn_clients")
      .select("*")
      .order("churn_probability", { ascending: false })

    if (!error && data && data.length > 0) {
      return NextResponse.json(data)
    }

    return NextResponse.json(mockChurnClients.sort((a, b) => b.churn_probability - a.churn_probability))
  } catch (error) {
    console.error("[v0] Error fetching churn clients:", error)
    return NextResponse.json(
      mockChurnClients.sort((a, b) => b.churn_probability - a.churn_probability),
      { status: 200 },
    )
  }
}
