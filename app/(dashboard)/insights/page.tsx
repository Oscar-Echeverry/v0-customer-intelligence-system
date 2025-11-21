"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChartCard } from "@/components/chart-card"
import { apiClient } from "@/lib/api-client"
import {
  RefreshCw,
  Lightbulb,
  Loader2,
  TrendingUp,
  LineChart,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface InsightsSummary {
  text: string
  stats?: {
    conversion_by_channel?: Record<string, number>
    avg_lead_score?: number
    top_service?: string
    high_risk_count?: number
  }
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<InsightsSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    fetchInsights()
  }, [])

  const fetchInsights = async () => {
    try {
      const data = await apiClient.get<InsightsSummary>("/api/v1/insights/summary")
      setInsights(data)
    } catch (error) {
      console.error("[v0] Error fetching insights:", error)
      // Fallback de demo
      setInsights({
        text: `Basado en el análisis de los datos recientes:

• Los leads provenientes de WhatsApp Bot tienen una tasa de conversión del 34%, superando a otras fuentes.

• El 42% de los leads se clasifican como "calientes", indicando una alta calidad en la captación.

• Los servicios de Social Ads son los más demandados, representando el 45% de las solicitudes.

• Se detectaron 8 clientes en alto riesgo de abandono, con una pérdida potencial de $12.5M COP.

• La urgencia promedio de los leads es de 3.8/5, sugiriendo un mercado con necesidades inmediatas.

Recomendaciones:
- Intensificar esfuerzos en canales de alto rendimiento como WhatsApp Bot
- Implementar estrategia de retención para los 8 clientes en riesgo
- Optimizar recursos hacia servicios de mayor demanda`,
        stats: {
          conversion_by_channel: {
            "WhatsApp Bot": 0.34,
            "Meta Ads": 0.28,
            "Google Ads": 0.31,
            Referidos: 0.42,
          },
          avg_lead_score: 0.68,
          top_service: "Social Ads",
          high_risk_count: 8,
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchInsights()
    setIsRefreshing(false)
  }

  const formatInsightText = (text: string) => {
    return text.split("\n").map((line, index) => {
      const trimmed = line.trim()

      if (trimmed.startsWith("•")) {
        return (
          <li key={index} className="ml-4 mb-2">
            {trimmed.replace("•", "").trim()}
          </li>
        )
      }

      if (trimmed === "") {
        return <br key={index} />
      }

      if (trimmed.toLowerCase().includes("recomendaciones:")) {
        return (
          <h3
            key={index}
            className="mt-4 mb-2 flex items-center gap-2 text-lg font-semibold"
          >
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            {trimmed}
          </h3>
        )
      }

      if (trimmed.startsWith("-")) {
        return (
          <li key={index} className="ml-4 mb-2 text-emerald-300 font-medium">
            {trimmed.replace("-", "").trim()}
          </li>
        )
      }

      return (
        <p key={index} className="mb-2">
          {line}
        </p>
      )
    })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-900">
        <div className="flex flex-col items-center gap-3 text-slate-200">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          <p className="text-sm">Generando insights en tiempo real…</p>
        </div>
      </div>
    )
  }

  const conversionData = insights?.stats?.conversion_by_channel
    ? Object.entries(insights.stats.conversion_by_channel).map(
        ([channel, rate]) => ({
          channel,
          conversion: rate * 100,
        }),
      )
    : []

  return (
    <div className="mx-auto max-w-6xl space-y-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-900 px-4 py-6 text-slate-50 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="mb-2 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
            <LineChart className="h-7 w-7 text-emerald-400" />
            Insights automáticos
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-300">
            Resumen ejecutivo generado con IA a partir del comportamiento de leads y clientes.
          </p>
        </div>

        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          className="border-emerald-400/60 bg-slate-900/60 text-slate-50 hover:bg-slate-800/80 hover:text-slate-50"
        >
          {isRefreshing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-emerald-400" />
              Actualizando…
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4 text-emerald-400" />
              Refrescar insights
            </>
          )}
        </Button>
      </div>

      {/* Main Insights Card */}
      <Card className="border-0 bg-slate-900/80 shadow-xl shadow-emerald-900/30 backdrop-blur">
        <CardHeader className="border-b border-slate-800 bg-gradient-to-r from-emerald-500/10 via-slate-900 to-sky-500/10">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-500 p-2 text-emerald-950 shadow-md shadow-emerald-900/40">
              <Lightbulb className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold">
                Análisis inteligente
              </CardTitle>
              <CardDescription className="text-xs text-slate-200/80">
                Insights generados automáticamente con base en tus datos de leads,
                clientes y riesgo de churn.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="prose prose-sm max-w-none text-slate-100 prose-invert">
            {insights ? (
              formatInsightText(insights.text)
            ) : (
              <p className="text-sm text-slate-300">
                No hay insights disponibles en este momento.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conversion Chart */}
      {conversionData.length > 0 && (
        <ChartCard
          title="Tasa de conversión por canal"
          description="Comparación del rendimiento de los principales canales de captación"
          className="border-0 bg-slate-900/80 text-slate-50 shadow-xl shadow-emerald-900/30"
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={conversionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis
                dataKey="channel"
                tick={{ fill: "#e5e7eb", fontSize: 12 }}
              />
              <YAxis
                tick={{ fill: "#e5e7eb", fontSize: 12 }}
                tickFormatter={(v: number) => `${v.toFixed(0)}%`}
              />
              <Tooltip
                formatter={(value: any) =>
                  `${Number(value).toFixed(1)}%`
                }
                contentStyle={{
                  backgroundColor: "#020617",
                  border: "1px solid #1f2937",
                  borderRadius: 8,
                  color: "#e5e7eb",
                  fontSize: 12,
                }}
                cursor={{ fill: "rgba(148, 163, 184, 0.10)" }}
              />
              <Bar
                dataKey="conversion"
                radius={[6, 6, 6, 6]}
                fill="oklch(0.72 0.24 150)"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Additional Stats */}
      {insights?.stats && (
        <div className="grid gap-4 md:grid-cols-3">
          {insights.stats.avg_lead_score !== undefined && (
            <Card className="border-0 bg-slate-900/80 text-slate-50 shadow-md shadow-emerald-900/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-slate-400">
                  Score promedio de leads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-emerald-300">
                  {(insights.stats.avg_lead_score * 100).toFixed(0)}%
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Calidad global de la captación actual.
                </p>
              </CardContent>
            </Card>
          )}

          {insights.stats.top_service && (
            <Card className="border-0 bg-slate-900/80 text-slate-50 shadow-md shadow-emerald-900/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-slate-400">
                  Servicio más demandado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold">
                  {insights.stats.top_service}
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Principal foco de interés del mercado.
                </p>
              </CardContent>
            </Card>
          )}

          {insights.stats.high_risk_count !== undefined && (
            <Card className="border-0 bg-slate-900/80 text-slate-50 shadow-md shadow-emerald-900/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-slate-400">
                  Clientes en alto riesgo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-red-400">
                  {insights.stats.high_risk_count}
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Requieren acciones de retención inmediatas.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
