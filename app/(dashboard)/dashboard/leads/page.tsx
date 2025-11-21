"use client"

import { useEffect, useMemo, useState } from "react"
import { KpiCard } from "@/components/kpi-card"
import { ChartCard } from "@/components/chart-card"
import { DataTable } from "@/components/data-table"
import { apiClient } from "@/lib/api-client"
import { Users, Flame, Loader2, PieChart } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface Lead {
  id?: string
  name: string
  city: string
  channel: string
  budget: number
  urgency: number
  service_type: string
  quality_label: "caliente" | "tibio" | "frío" | string
  quality_score: number
  created_at?: string
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value)

export default function LeadsDashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await apiClient.get<Lead[]>("/leads")
        setLeads(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("[v0] Error fetching leads:", err)
        setError("No se pudo cargar la información de leads. Intenta nuevamente más tarde.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeads()
  }, [])

  const {
    totalLeads,
    hotLeads,
    avgScore,
    avgBudget,
    leadsByService,
    leadsByChannel,
    sortedLeads,
  } = useMemo(() => {
    const total = leads.length
    const hot = leads.filter((l) => l.quality_label === "caliente")

    const score =
      total > 0
        ? leads.reduce((s, l) => s + (l.quality_score ?? 0), 0) / total
        : 0

    const budget =
      total > 0
        ? leads.reduce((s, l) => s + (l.budget ?? 0), 0) / total
        : 0

    const byServiceMap: Record<string, number> = {}
    const byChannelMap: Record<string, number> = {}

    leads.forEach((l) => {
      const s = l.service_type || "Otro"
      const c = l.channel || "Desconocido"
      byServiceMap[s] = (byServiceMap[s] || 0) + 1
      byChannelMap[c] = (byChannelMap[c] || 0) + 1
    })

    const byService = Object.entries(byServiceMap).map(([service, count]) => ({
      service,
      count,
    }))

    const byChannel = Object.entries(byChannelMap).map(([channel, count]) => ({
      channel,
      count,
    }))

    const sorted = [...leads].sort(
      (a, b) => (b.quality_score ?? 0) - (a.quality_score ?? 0),
    )

    return {
      totalLeads: total,
      hotLeads: hot.length,
      avgScore: score,
      avgBudget: budget,
      leadsByService: byService,
      leadsByChannel: byChannel,
      sortedLeads: sorted,
    }
  }, [leads])

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-900 text-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
        <p className="text-sm">Cargando leads…</p>
      </div>
    )
  }

  const hotPercentage =
    totalLeads > 0 ? ((hotLeads / totalLeads) * 100).toFixed(1) : "0.0"

  const columns = [
    { key: "name", header: "Nombre" },
    { key: "city", header: "Ciudad" },
    { key: "channel", header: "Canal" },
    { key: "service_type", header: "Servicio" },
    {
      key: "budget",
      header: "Presupuesto",
      render: (row: Lead) => formatCurrency(row.budget ?? 0),
    },
    {
      key: "urgency",
      header: "Urgencia",
      render: (row: Lead) => `${row.urgency}/5`,
    },
    {
      key: "quality_label",
      header: "Calidad",
      render: (row: Lead) => {
        const label = row.quality_label
        const css =
          label === "caliente"
            ? "bg-red-100 text-red-700"
            : label === "tibio"
            ? "bg-amber-100 text-amber-700"
            : "bg-sky-100 text-sky-700"

        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${css}`}>
            {label.toUpperCase()}
          </span>
        )
      },
    },
    {
      key: "quality_score",
      header: "Score",
      render: (row: Lead) => {
        const score = row.quality_score ?? 0
        const percent = (score * 100).toFixed(0)

        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 max-w-[120px] rounded-full bg-slate-800">
              <div
                className="h-2 rounded-full bg-emerald-400"
                style={{ width: `${Math.min(score * 100, 100)}%` }}
              />
            </div>
            <span className="min-w-[40px] text-right text-sm">{percent}%</span>
          </div>
        )
      },
    },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-900 px-6 py-6 text-slate-50">
      {/* Header */}
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-semibold">
            <PieChart className="h-7 w-7 text-emerald-400" />
            Dashboard de Leads
          </h1>
          <p className="max-w-2xl text-sm text-slate-300 mt-1">
            Visualiza los leads capturados, su calidad de conversión y los servicios más solicitados.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-slate-900/60 px-3 py-1 text-xs text-slate-300 ring-1 ring-emerald-500/40">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.4)]" />
          Leads clasificados · Datos en tiempo real
        </div>
      </header>

      {/* KPI Cards */}
      <section className="grid gap-4 md:grid-cols-3">
        <KpiCard title="Leads totales" value={totalLeads} icon={Users} />
        <KpiCard
          title="Leads calientes"
          value={hotLeads}
          subtitle={`${hotPercentage}% del total`}
          icon={Flame}
        />
        <KpiCard
          title="Presupuesto promedio"
          value={formatCurrency(avgBudget)}
          subtitle="Promedio de todos los leads"
          icon={PieChart}
        />
      </section>

      {/* Charts */}
      <section className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Distribución por servicio"
          description="Servicios más solicitados por los leads"
          className="border-0 bg-slate-900/80 text-slate-50 shadow-lg shadow-emerald-900/40"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={leadsByService}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="service" tick={{ fill: "#e5e7eb", fontSize: 12 }} />
              <YAxis tick={{ fill: "#e5e7eb", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  border: "1px solid #1f2937",
                  borderRadius: 8,
                  color: "#e5e7eb",
                }}
              />
              <Bar dataKey="count" fill="oklch(0.72 0.25 150)" radius={[6, 6, 6, 6]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Leads por canal"
          description="Canales que más están generando leads"
          className="border-0 bg-slate-900/80 text-slate-50 shadow-lg shadow-emerald-900/40"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={leadsByChannel}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="channel" tick={{ fill: "#e5e7eb", fontSize: 12 }} />
              <YAxis tick={{ fill: "#e5e7eb", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  border: "1px solid #1f2937",
                  borderRadius: 8,
                  color: "#e5e7eb",
                }}
              />
              <Bar dataKey="count" fill="oklch(0.65 0.28 160)" radius={[6, 6, 6, 6]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      {/* Table */}
      <section>
        <ChartCard
          title="Leads clasificados"
          description="Listado completo de leads y su score"
          className="border-0 bg-slate-900/80 shadow-lg shadow-emerald-900/40"
        >
          <DataTable
            data={sortedLeads}
            columns={columns}
            searchKey="name"
            searchPlaceholder="Buscar lead…"
            emptyMessage="Aún no hay leads registrados."
          />
        </ChartCard>
      </section>
    </div>
  )
}
