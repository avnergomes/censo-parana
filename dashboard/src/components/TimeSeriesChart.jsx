import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatNumber } from '../utils/format'

export default function TimeSeriesChart({ data, title }) {
  const chartData = useMemo(() => {
    if (!data) return []
    return data.map(d => ({
      ano: d.ano,
      total: d.total,
      urbana: d.urbana,
      rural: d.rural,
    }))
  }, [data])

  if (!chartData.length) {
    return (
      <div className="chart-container">
        <h3 className="text-lg font-semibold text-dark-800 mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center text-dark-400">
          Dados não disponíveis
        </div>
      </div>
    )
  }

  return (
    <div className="chart-container">
      <h3 className="text-lg font-semibold text-dark-800 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="ano"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#d1d5db' }}
          />
          <YAxis
            tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#d1d5db' }}
          />
          <Tooltip
            formatter={(value) => formatNumber(value)}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="total"
            name="Total"
            stroke="#0c8be7"
            strokeWidth={2}
            dot={{ fill: '#0c8be7', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="urbana"
            name="Urbana"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ fill: '#22c55e', r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="rural"
            name="Rural"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ fill: '#f59e0b', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
