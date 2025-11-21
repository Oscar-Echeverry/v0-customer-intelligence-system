"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Send, Loader2, MessageCircle, Smartphone, User, MapPin, Wallet, Flame, Sparkles } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface Message {
  id: string
  text: string
  sender: "bot" | "user"
  timestamp: Date
}

interface LeadData {
  name?: string
  city?: string
  budget?: number
  urgency?: number
  service_type?: string
}

interface LeadPrediction {
  quality_label: "caliente" | "tibio" | "frío"
  quality_score: number
}

type QuestionStep = "name" | "city" | "budget" | "urgency" | "service_type" | "complete"

const QUESTIONS = {
  name: "¡Hola! Soy el asistente de Quindío AI. ¿Cuál es tu nombre?",
  city: "¿De qué ciudad nos escribes?",
  budget: "¿Cuál es tu presupuesto mensual aproximado para marketing digital? (en COP)",
  urgency: "¿Qué tan urgente es tu necesidad? (escala de 1 a 5, donde 5 es muy urgente)",
  service_type: "¿Qué tipo de servicio te interesa?",
}

const formatCurrency = (value?: number) =>
  value !== undefined
    ? new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
      }).format(value)
    : "-"

export default function BotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: QUESTIONS.name,
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [currentStep, setCurrentStep] = useState<QuestionStep>("name")
  const [leadData, setLeadData] = useState<LeadData>({})
  const [prediction, setPrediction] = useState<LeadPrediction | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showServiceSelect, setShowServiceSelect] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const addMessage = (text: string, sender: "bot" | "user") => {
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random()}`,
      text,
      sender,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const handleServiceSelect = async (value: string) => {
    const updatedLeadData = { ...leadData, service_type: value }
    setLeadData(updatedLeadData)
    addMessage(value, "user")
    setShowServiceSelect(false)
    setCurrentStep("complete")

    await predictLeadQuality(updatedLeadData)
  }

  const predictLeadQuality = async (data: LeadData) => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Step 1: Predicting lead quality")
      const predictionResult = await apiClient.post<LeadPrediction>("/predict/lead-quality", {
        name: data.name,
        city: data.city,
        channel: "WhatsApp Bot",
        budget: data.budget,
        urgency: data.urgency,
        service_type: data.service_type,
      })

      console.log("[v0] Prediction successful:", predictionResult)
      setPrediction(predictionResult)

      console.log("[v0] Step 2: Saving lead to database")
      try {
        const saveResult = await apiClient.post("/leads", {
          name: data.name,
          city: data.city,
          channel: "WhatsApp Bot",
          budget: data.budget,
          urgency: data.urgency,
          service_type: data.service_type,
          quality_label: predictionResult.quality_label,
          quality_score: predictionResult.quality_score,
        })
        console.log("[v0] Lead saved successfully:", saveResult)
      } catch (saveError) {
        console.error("[v0] Warning: Failed to save lead, but prediction was successful:", saveError)
      }

      setTimeout(() => {
        addMessage(
          `Gracias, ${data.name}. Te clasificamos como lead ${predictionResult.quality_label} (score ${predictionResult.quality_score.toFixed(
            2,
          )}). Un asesor te contactará pronto.`,
          "bot",
        )
      }, 350)
    } catch (err) {
      console.error("[v0] Error predicting lead quality:", err)
      setError("Hubo un problema al procesar la información. Intenta nuevamente.")
      addMessage("Lo siento, hubo un error al procesar tu información. Por favor, intenta de nuevo.", "bot")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userInput = input.trim()
    addMessage(userInput, "user")
    setInput("")
    setError(null)

    switch (currentStep) {
      case "name": {
        setLeadData((prev) => ({ ...prev, name: userInput }))
        setTimeout(() => {
          addMessage(QUESTIONS.city, "bot")
          setCurrentStep("city")
        }, 300)
        break
      }

      case "city": {
        setLeadData((prev) => ({ ...prev, city: userInput }))
        setTimeout(() => {
          addMessage(QUESTIONS.budget, "bot")
          setCurrentStep("budget")
        }, 300)
        break
      }

      case "budget": {
        const budget = Number.parseFloat(userInput.replace(/[^0-9.]/g, ""))
        if (Number.isNaN(budget)) {
          setTimeout(() => addMessage("Por favor, ingresa un número válido para el presupuesto.", "bot"), 250)
          return
        }
        setLeadData((prev) => ({ ...prev, budget }))
        setTimeout(() => {
          addMessage(QUESTIONS.urgency, "bot")
          setCurrentStep("urgency")
        }, 300)
        break
      }

      case "urgency": {
        const urgency = Number.parseInt(userInput)
        if (Number.isNaN(urgency) || urgency < 1 || urgency > 5) {
          setTimeout(() => addMessage("Por favor, ingresa un número entre 1 y 5.", "bot"), 250)
          return
        }
        setLeadData((prev) => ({ ...prev, urgency }))
        setTimeout(() => {
          addMessage(QUESTIONS.service_type, "bot")
          setShowServiceSelect(true)
          setCurrentStep("service_type")
        }, 300)
        break
      }
    }
  }

  const getQualityColor = (label: LeadPrediction["quality_label"]) => {
    switch (label) {
      case "caliente":
        return "bg-red-100 text-red-800 border-red-200"
      case "tibio":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "frío":
        return "bg-sky-100 text-sky-800 border-sky-200"
      default:
        return "bg-muted text-foreground border-border"
    }
  }

  const getScoreBadge = (score: number) => {
    if (score >= 0.7) return { label: "Alto", variant: "destructive" as const }
    if (score >= 0.4) return { label: "Medio", variant: "default" as const }
    return { label: "Bajo", variant: "secondary" as const }
  }

  const scoreBadge = prediction ? getScoreBadge(prediction.quality_score) : null

  const stepNumber =
    {
      name: 1,
      city: 2,
      budget: 3,
      urgency: 4,
      service_type: 5,
      complete: 5,
    }[currentStep] ?? 1

  return (
    <div className="mx-auto max-w-7xl space-y-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-900 px-4 py-6 text-slate-50 lg:px-8 lg:py-8">
      <header className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
            <MessageCircle className="h-7 w-7 text-emerald-400" />
            Bot de Leads
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-300">
            Conversación tipo WhatsApp que captura datos clave del lead y los califica con modelos de IA entrenados con
            históricos de la agencia.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-slate-900/50 px-3 py-1 text-xs text-slate-300 ring-1 ring-emerald-500/30">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.4)]" />
          Asistente en línea · análisis en tiempo real
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        {/* Chat Window */}
        <Card className="flex h-[520px] flex-col overflow-hidden border-0 bg-slate-900/70 shadow-xl shadow-emerald-900/20 backdrop-blur lg:h-[calc(100vh-230px)]">
          <CardHeader className="border-b border-slate-800 bg-slate-900/80">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/40">
                  <Smartphone className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">Chat de WhatsApp · Quindío AI</CardTitle>
                  <p className="text-xs text-slate-400">Paso {stepNumber} de 5 · experiencia guiada</p>
                </div>
              </div>
              <Badge
                variant="outline"
                className="border-emerald-500/40 bg-emerald-500/10 text-[11px] font-normal text-emerald-300"
              >
                <span className="mr-1 flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                IA Activa
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col bg-gradient-to-b from-slate-900/80 to-slate-950/90 p-4">
            <div className="flex-1 space-y-4 overflow-y-auto pr-1">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-2 text-sm shadow-md shadow-black/20 ${
                      message.sender === "user"
                        ? "rounded-br-sm bg-emerald-500 text-emerald-950"
                        : "rounded-bl-sm border border-slate-800 bg-slate-900/80 text-slate-50"
                    }`}
                  >
                    <p className="leading-relaxed">{message.text}</p>
                    <span className="mt-1 block text-[10px] text-slate-300/80">
                      {message.timestamp.toLocaleTimeString("es-CO", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-2 text-xs text-slate-200 shadow-md shadow-black/20">
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                    <span>Analizando la calidad del lead…</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Selector de servicio */}
            {showServiceSelect && (
              <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-3 shadow-inner shadow-black/30">
                <p className="mb-2 text-[11px] text-slate-300">
                  Selecciona el servicio que mejor describe lo que estás buscando:
                </p>
                <Select onValueChange={handleServiceSelect}>
                  <SelectTrigger className="w-full border-slate-700 bg-slate-900/80 text-xs text-slate-100">
                    <SelectValue placeholder="Selecciona un servicio" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-800 bg-slate-900 text-slate-50">
                    <SelectItem value="Social Ads">Social Ads</SelectItem>
                    <SelectItem value="Google Ads">Google Ads</SelectItem>
                    <SelectItem value="SEO">SEO</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Barra de input */}
            {!showServiceSelect && currentStep !== "complete" && (
              <form onSubmit={handleSubmit} className="mt-4 border-t border-slate-800 pt-3">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe tu respuesta aquí…"
                    disabled={isLoading}
                    className="flex-1 border-slate-700 bg-slate-900/80 text-sm text-slate-50 placeholder:text-slate-500"
                    autoComplete="off"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={isLoading || !input.trim()}
                    className="shrink-0 bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
                  >
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Enviar</span>
                  </Button>
                </div>
                {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
              </form>
            )}
          </CardContent>
        </Card>

        {/* Lead Summary */}
        <Card className="h-full border-0 bg-slate-900/80 shadow-xl shadow-emerald-900/20 backdrop-blur">
          <CardHeader className="border-b border-slate-800 pb-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="mt-0.5 rounded-full bg-slate-800/80 p-1.5 text-slate-200">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">Resumen del lead</CardTitle>
                  <p className="text-[11px] text-slate-400">
                    Datos capturados y score estimado por el modelo de calidad.
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 text-sm text-slate-50">
            {/* Datos básicos */}
            <div className="grid grid-cols-1 gap-3 rounded-2xl bg-slate-950/40 p-3 ring-1 ring-slate-800/80 md:grid-cols-2">
              <div className="flex items-start gap-2">
                <div className="mt-0.5 rounded-full bg-slate-800/80 p-1.5 text-slate-200">
                  <User className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">Nombre</p>
                  <p className="text-sm font-medium">{leadData.name || "Sin definir"}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="mt-0.5 rounded-full bg-slate-800/80 p-1.5 text-slate-200">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">Ciudad</p>
                  <p className="text-sm font-medium">{leadData.city || "Sin definir"}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="mt-0.5 rounded-full bg-slate-800/80 p-1.5 text-slate-200">
                  <Wallet className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">Presupuesto mensual</p>
                  <p className="text-sm font-medium">{formatCurrency(leadData.budget)}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="mt-0.5 rounded-full bg-slate-800/80 p-1.5 text-slate-200">
                  <Flame className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">Urgencia</p>
                  <p className="text-sm font-medium">{leadData.urgency ? `${leadData.urgency} / 5` : "Sin definir"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 rounded-2xl bg-slate-950/30 p-3 ring-1 ring-slate-800/80">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">Canal y servicio</p>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-300">
                  WhatsApp Bot
                </Badge>
                {leadData.service_type && (
                  <Badge variant="outline" className="border-sky-500/40 bg-sky-500/10 text-sky-200">
                    {leadData.service_type}
                  </Badge>
                )}
              </div>
            </div>

            {/* Scoring */}
            {prediction ? (
              <>
                <div className="mt-2 space-y-2 rounded-2xl bg-slate-950/30 p-3 ring-1 ring-slate-800/80">
                  <p className="mb-1 text-[11px] uppercase tracking-wide text-slate-400">Calidad del lead</p>
                  <Badge className={`border ${getQualityColor(prediction.quality_label)}`}>
                    {prediction.quality_label.toUpperCase()}
                  </Badge>
                </div>

                <div className="space-y-2 rounded-2xl bg-slate-950/30 p-3 ring-1 ring-slate-800/80">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">Score de calidad estimado</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-full bg-slate-800/80">
                      <div
                        className="h-2 rounded-full bg-emerald-400 transition-all"
                        style={{
                          width: `${Math.min(prediction.quality_score * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="min-w-[52px] text-right text-sm font-medium tabular-nums text-emerald-200">
                      {(prediction.quality_score * 100).toFixed(0)}%
                    </span>
                  </div>

                  {scoreBadge && (
                    <Badge variant={scoreBadge.variant} className="mt-1 text-[11px]">
                      Score {scoreBadge.label}
                    </Badge>
                  )}
                </div>
              </>
            ) : (
              <p className="pt-1 text-xs text-slate-400">
                Completa la conversación en el chat para que el sistema pueda estimar la calidad del lead y priorizar su
                atención.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
