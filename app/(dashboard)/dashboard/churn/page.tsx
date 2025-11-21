"use client"

import { useEffect, useMemo, useState } from "react"
import { KpiCard } from "@/components/kpi-card"
import { ChartCard } from "@/components/chart-card"
import { DataTable } from "@/components/data-table"
import { apiClient } from "@/lib/api-client"
import { Users, AlertTriangle, DollarSign, Loader2, Activity } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface ChurnClient {
  client_id: number
  name: string
  monthly_investment: number
  months_as_client: number
  churn_probability: number
  potential_loss: number
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value)

const formatCompactCurrency = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    notation: "compact",
    compactDisplay: "short",
  }).format(value)

export default function ChurnDashboardPage() {
  const [clients, setClients] = useState<ChurnClient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchChurnData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await apiClient.get<ChurnClient[]>("/churn/at-risk")
        setClients(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("[v0] Error fetching churn data:", err)
        setError("No se pudo cargar la información de churn. Intenta más tarde.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchChurnData()
  }, [])

  const { totalClients, highRiskClients, totalPotentialLoss, top10ByLoss, sortedClients } = useMemo(() => {
    const total = clients.length
    const highRisk = clients.filter((c) => c.churn_probability > 0.7)
    const potentialLoss = highRisk.reduce((sum, c) => sum + c.potential_loss, 0)

    const sorted = [...clients].sort((a, b) => b.churn_probability - a.churn_probability)

    const top10 = [...clients]
      .sort((a, b) => b.potential_loss - a.potential_loss)
      .slice(0, 10)
      .map((c) => ({
        name: c.name.length > 22 ? c.name.slice(0, 22).trim() + "…" : c.name,
        loss: c.potential_loss,
      }))

    return {
      totalClients: total,
      highRiskClients: highRisk,
      totalPotentialLoss: potentialLoss,
      top10ByLoss: top10,
      sortedClients: sorted,
    }
  }, [clients])

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-900 text-slate-300">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
        <p className="text-sm">Calculando riesgo de churn…</p>
      </div>
    )
  }

  const highRiskPercentage = totalClients > 0 ? ((highRiskClients.length / totalClients) * 100).toFixed(1) : "0.0"

  const columns = [
    {
      key: "name",
      header: "Cliente",
    },
    {
      key: "monthly_investment",
      header: "Inversión mensual",
      render: (row: ChurnClient) => formatCurrency(row.monthly_investment),
    },
    {
      key: "months_as_client",
      header: "Meses como cliente",
    },
    {
      key: "churn_probability",
      header: "Probabilidad de churn",
      render: (row: ChurnClient) => {
        const prob = row.churn_probability
        const percent = (prob * 100).toFixed(0)

        const barColor = prob > 0.7 ? "bg-red-500" : prob > 0.4 ? "bg-yellow-400" : "bg-emerald-500"

        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 max-w-[120px] rounded-full bg-slate-800">
              <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${Math.min(prob * 100, 100)}%` }} />
            </div>
            <span className="min-w-[45px] text-right text-sm font-semibold tabular-nums">{percent}%</span>
          </div>
        )
      },
    },
    {
      key: "potential_loss",
      header: "Pérdida potencial",
      render: (row: ChurnClient) => formatCurrency(row.potential_loss),
    },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-900 px-4 py-6 text-slate-50 lg:px-8 lg:py-8">
      {/* HEADER */}
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-semibold">
            <Activity className="h-7 w-7 text-emerald-400" />
            Dashboard de Churn
          </h1>
          <p className="max-w-2xl text-sm text-slate-300 mt-1">
            Analiza el riesgo de abandono y el impacto económico potencial.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-slate-900/60 px-3 py-1 text-xs text-slate-300 ring-1 ring-emerald-500/40">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.4)]" />
          Modelos activos · Datos en tiempo real
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-300">{error}</div>
      )}

      {/* KPI CARDS */}
      <section className="grid gap-4 md:grid-cols-3">
        <KpiCard title="Total clientes" value={totalClients} icon={Users} />
        <KpiCard
          title="En alto riesgo"
          value={highRiskClients.length}
          subtitle={`${highRiskPercentage}% del total`}
          icon={AlertTriangle}
        />
        <KpiCard
          title="Pérdida potencial"
          value={formatCompactCurrency(totalPotentialLoss)}
          subtitle="Clientes de mayor riesgo"
          icon={DollarSign}
        />
      </section>

      {/* CHART */}
      <section>
        <ChartCard
          title="Top 10 por pérdida potencial"
          description="Clientes con mayor impacto económico en caso de abandono"
          className="border-0 bg-slate-900/70 text-slate-50 shadow-lg shadow-emerald-900/40"
        >
          {top10ByLoss.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-slate-400">
              No hay datos disponibles.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={top10ByLoss} layout="vertical">
                <CartesianGrid strokeDasharray="3" stroke="#1f2937" />
                <XAxis type="number" tickFormatter={(v: number) => formatCompactCurrency(v)} stroke="#9ca3af" />
                <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 12, fill: "#e5e7eb" }} />
                <Tooltip
                  formatter={(v: any) => formatCurrency(Number(v))}
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #1f2937",
                    borderRadius: 8,
                    color: "#e5e7eb",
                  }}
                />
                <Bar dataKey="loss" fill="oklch(0.75 0.25 150)" radius={[6, 6, 6, 6]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </section>

      {/* TABLE */}
      <section>
        <ChartCard
          title="Clientes en riesgo"
          description="Ordenados por probabilidad de churn"
          className="border-0 bg-slate-900/70 shadow-lg shadow-emerald-900/40"
        >
          <DataTable
            data={sortedClients}
            columns={columns}
            searchKey="name"
            searchPlaceholder="Buscar cliente…"
            emptyMessage="No hay clientes para mostrar."
          />
        </ChartCard>
      </section>
    </div>
  )
}
