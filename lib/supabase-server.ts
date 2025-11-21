import { createClient } from "@supabase/supabase-js"

export interface Lead {
  id?: string
  name: string
  city: string
  channel: string
  budget: number
  urgency: number
  service_type: string
  quality_label: string
  quality_score: number
  created_at?: string
}

export interface ChurnClient {
  id?: string
  client_id: number
  name: string
  monthly_investment: number
  months_as_client: number
  churn_probability: number
  potential_loss: number
  created_at?: string
}

export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return null
  }

  return createClient(supabaseUrl, supabaseServiceKey)
}
