// Data types for the system
export interface LeadHistorico {
  lead_id: string
  fecha_lead: string
  industria: string
  programa_producto_interes: string
  tipo_campana: string
  fuente_meta: string
  dispositivo: string
  hora_generacion: string
  cargo_lead: string
  empresa_lead: string
  ciudad: string
  urgencia_compra: number
  interaccion_previa: string
  horas_hasta_contacto: number
  lead_respondio: string
  intentos_contacto: number
  observacion_asesor: string
  status: string
  compro: string
}

export interface ClienteComportamiento {
  id_cliente: number
  frecuencia_compra: number
  engagement: number
  valor_historico: number
  satisfaccion: number
  categoria_cliente: string
  dias_desde_ultima_compra: number
  canal_preferido: string
}

export interface ClienteTransaccion {
  id_cliente: number
  presupuesto: number
  tamaño_empresa: string
  industria: string
}

export interface NewLead {
  name: string
  city: string
  budget: number
  urgency: number
  service_type: string
  channel: string
}

export interface LeadPrediction {
  quality_label: "caliente" | "tibio" | "frío"
  quality_score: number
}

export interface StoredLead extends NewLead, LeadPrediction {
  id: string
  created_at: string
}

export interface ChurnClient {
  client_id: number
  name: string
  monthly_investment: number
  months_as_client: number
  churn_probability: number
  potential_loss: number
  engagement: number
  satisfaction: number
  days_since_last_purchase: number
  industry: string
  company_size: string
}
