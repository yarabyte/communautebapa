"use client"

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts"

import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { formatMoney } from "@/lib/format"
import { paymentMethodLabels } from "@/lib/labels"
import type { PaymentMethod } from "@/lib/types"

const monthConfig = { amountXaf: { label: "Collecté", color: "var(--color-terre)" } } satisfies ChartConfig

const methodColors: Record<PaymentMethod, string> = {
  ORANGE_MONEY: "#FF7900",
  MTN_MOMO: "#E6B800",
  CARD: "var(--color-indigo-bapa)",
  PAYPAL: "#003087",
  CASH: "var(--color-olive)",
}

const methodConfig = Object.fromEntries(
  Object.entries(paymentMethodLabels).map(([k, label]) => [k, { label, color: methodColors[k as PaymentMethod] }])
) satisfies ChartConfig

export function MonthlyChart({ data }: { data: { label: string; amountXaf: number }[] }) {
  return (
    <ChartContainer config={monthConfig} className="aspect-auto h-64 w-full">
      <BarChart data={data} margin={{ left: 4, right: 4 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} width={44} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(v) => formatMoney(Number(v))} />} />
        <Bar dataKey="amountXaf" fill="var(--color-amountXaf)" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}

export function MethodChart({ data }: { data: { method: PaymentMethod; amountXaf: number }[] }) {
  return (
    <ChartContainer config={methodConfig} className="mx-auto aspect-square h-64">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="method" hideLabel formatter={(v, name) => `${paymentMethodLabels[name as PaymentMethod]} : ${formatMoney(Number(v))}`} />} />
        <Pie data={data} dataKey="amountXaf" nameKey="method" innerRadius={55} strokeWidth={4}>
          {data.map((d) => (
            <Cell key={d.method} fill={methodColors[d.method]} />
          ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="method" />} className="flex-wrap gap-2" />
      </PieChart>
    </ChartContainer>
  )
}
