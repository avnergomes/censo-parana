import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatNumber, formatPercent } from '../utils/format'

export default function RuralUrbanChart({ data, title, showPercentage = false }) {
  const chartData = useMemo(() => {
    if (!data) return []
    return data.map(d => {
      const total = d.total || (d.urbana + d.rural)
      return {
        ano: d.ano,
        urbana: showPercentage ? (d.urbana / total * 100) : d.urbana,
        rural: showPercentage ? (d.rural / total * 100) : d.rural,
        total: d.total,
      }
    })
  }, [data, showPercentage])

  if (!chartData.length) {
    return (
      <div className="chart-container">
        <h3 className="text-lg font-semibold text-dark-800 mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center text-dark-400">
          Dados nao disponiveis
        </div>
      </div>
    )
  }

  return (
    <div className="chart-container">
      <h3 className="text-lg font-semibold text-dark-800 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="ano"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#d1d5db' }}
          />
          <YAxis
            tickFormatter={(v) => showPercentage ? `${v.toFixed(0)}%` : `${(v / 1000000).toFixed(1)}M`}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#d1d5db' }}
            domain={showPercentage ? [0, 100] : ['auto', 'auto']}
          />
          <Tooltip
            formatter={(value) => showPercentage ? formatPercent(value) : formatNumber(value)}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="urbana"
            name="Urbana"
            stackId="1"
            stroke="#0c8be7"
            fill="#0c8be7"
            fillOpacity={0.8}
          />
          <Area
            type="monotone"
            dataKey="rural"
            name="Rural"
            stackId="1"
            stroke="#22c55e"
            fill="#22c55e"
            fillOpacity={0.8}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legenda explicativa */}
      <div className="mt-4 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-primary-600"></div>
          <span className="text-dark-600">Populacao Urbana</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500"></div>
          <span className="text-dark-600">Populacao Rural</span>
        </div>
      </div>
    </div>
  )
}
