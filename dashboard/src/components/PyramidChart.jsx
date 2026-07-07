// ATLAS-A11Y-HEX-SWEPT
import { useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts'
import { formatNumber } from '../utils/format'

// Okabe-Ito (paleta acessível compartilhada do ecossistema, chart-palette.js)
const COLOR_HOMENS = '#0072B2'   // azul
const COLOR_MULHERES = '#CC79A7' // rosa arroxeado

// Ordem das faixas etárias
const FAIXAS_ORDEM = [
  '0 a 4 anos',
  '5 a 9 anos',
  '10 a 14 anos',
  '15 a 19 anos',
  '20 a 24 anos',
  '25 a 29 anos',
  '30 a 34 anos',
  '35 a 39 anos',
  '40 a 44 anos',
  '45 a 49 anos',
  '50 a 54 anos',
  '55 a 59 anos',
  '60 a 64 anos',
  '65 a 69 anos',
  '70 a 74 anos',
  '75 a 79 anos',
  '80 anos ou mais',
]

export default function PyramidChart({ data, title, filterMunicipios = null }) {
  const [viewMode, setViewMode] = useState('absoluto') // 'absoluto' ou 'percentual'

  // Agregar dados dos municípios selecionados (ou todos se não filtrado)
  const pyramidData = useMemo(() => {
    if (!data || !data['2022']) return []

    const municipiosData = data['2022']
    const totais = {
      homens: {},
      mulheres: {},
    }

    // Filtrar municípios se necessário
    let municipiosCodes = Object.keys(municipiosData)
    if (filterMunicipios && filterMunicipios.length > 0) {
      municipiosCodes = municipiosCodes.filter(code => filterMunicipios.includes(code))
    }

    // Somar municípios selecionados
    municipiosCodes.forEach(code => {
      const mun = municipiosData[code]
      if (!mun) return

      // Homens
      if (mun.homens) {
        Object.entries(mun.homens).forEach(([faixa, valor]) => {
          totais.homens[faixa] = (totais.homens[faixa] || 0) + valor
        })
      }
      // Mulheres
      if (mun.mulheres) {
        Object.entries(mun.mulheres).forEach(([faixa, valor]) => {
          totais.mulheres[faixa] = (totais.mulheres[faixa] || 0) + valor
        })
      }
    })

    // Calcular total geral para percentuais
    const totalGeral = Object.values(totais.homens).reduce((a, b) => a + b, 0) +
                       Object.values(totais.mulheres).reduce((a, b) => a + b, 0)

    // Se não tem dados, retornar vazio
    if (totalGeral === 0) return []

    // Formatar para o gráfico
    const chartData = FAIXAS_ORDEM
      .filter(faixa => totais.homens[faixa] || totais.mulheres[faixa])
      .map(faixa => {
        const homens = totais.homens[faixa] || 0
        const mulheres = totais.mulheres[faixa] || 0

        return {
          faixa,
          faixaLabel: faixa.replace(' anos', '').replace(' ou mais', '+'),
          homens: -homens, // Negativo para ir para a esquerda
          mulheres: mulheres,
          homensAbs: homens,
          mulheresAbs: mulheres,
          homensPct: totalGeral > 0 ? (homens / totalGeral * 100) : 0,
          mulheresPct: totalGeral > 0 ? (mulheres / totalGeral * 100) : 0,
        }
      })
      .reverse() // Inverter para faixas mais velhas em cima

    return chartData
  }, [data, filterMunicipios])

  // Valor máximo para o eixo X (dinâmico baseado nos dados)
  const maxValue = useMemo(() => {
    if (pyramidData.length === 0) return 100000

    const max = Math.max(
      ...pyramidData.map(d => Math.abs(d.homens)),
      ...pyramidData.map(d => d.mulheres)
    )

    // Arredondar para um valor bonito
    if (max >= 1000000) return Math.ceil(max / 500000) * 500000
    if (max >= 100000) return Math.ceil(max / 50000) * 50000
    if (max >= 10000) return Math.ceil(max / 5000) * 5000
    if (max >= 1000) return Math.ceil(max / 500) * 500
    return Math.ceil(max / 100) * 100
  }, [pyramidData])

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null

    const data = payload[0]?.payload
    if (!data) return null

    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-dark-200">
        <p className="font-semibold text-dark-800 mb-2">{data.faixa}</p>
        <div className="space-y-1 text-sm">
          <p style={{ color: COLOR_HOMENS }}>
            Homens: {formatNumber(data.homensAbs)} ({data.homensPct.toFixed(1)}%)
          </p>
          <p style={{ color: COLOR_MULHERES }}>
            Mulheres: {formatNumber(data.mulheresAbs)} ({data.mulheresPct.toFixed(1)}%)
          </p>
        </div>
      </div>
    )
  }

  // Formatar eixo X
  const formatXAxis = (value) => {
    if (viewMode === 'percentual') {
      return `${Math.abs(value).toFixed(1)}%`
    }
    const absValue = Math.abs(value)
    if (absValue >= 1000000) return `${(absValue / 1000000).toFixed(1)}M`
    if (absValue >= 1000) return `${(absValue / 1000).toFixed(0)}K`
    return absValue
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="chart-container">
        <h3 className="text-lg font-semibold text-dark-800 mb-4">{title}</h3>
        <div className="h-96 flex flex-col items-center justify-center text-dark-400">
          <p>Dados da pirâmide etária não disponíveis</p>
          <p className="text-sm mt-2">
            Tente recarregar a página mais tarde.
          </p>
        </div>
      </div>
    )
  }

  if (pyramidData.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="text-lg font-semibold text-dark-800 mb-4">{title}</h3>
        <div className="h-96 flex items-center justify-center text-dark-400">
          {filterMunicipios && filterMunicipios.length > 0
            ? 'Nenhum dado disponível para os municípios selecionados'
            : 'Processando dados da pirâmide...'}
        </div>
      </div>
    )
  }

  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-dark-800">{title}</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: COLOR_HOMENS }}></div>
              <span className="text-dark-600">Homens</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: COLOR_MULHERES }}></div>
              <span className="text-dark-600">Mulheres</span>
            </div>
          </div>
        </div>
      </div>

      <div className="h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={pyramidData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
            barGap={0}
          >
            <XAxis
              type="number"
              domain={[-maxValue, maxValue]}
              tickFormatter={formatXAxis}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              type="category"
              dataKey="faixaLabel"
              tick={{ fontSize: 11 }}
              width={55}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={0} stroke="#666" />
            <Bar dataKey="homens" fill={COLOR_HOMENS} name="Homens" radius={[4, 0, 0, 4]}>
              {pyramidData.map((entry, index) => (
                <Cell key={`homens-${index}`} fill={COLOR_HOMENS} />
              ))}
            </Bar>
            <Bar dataKey="mulheres" fill={COLOR_MULHERES} name="Mulheres" radius={[0, 4, 4, 0]}>
              {pyramidData.map((entry, index) => (
                <Cell key={`mulheres-${index}`} fill={COLOR_MULHERES} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Info sobre filtro */}
      {filterMunicipios && filterMunicipios.length > 0 && filterMunicipios.length < 399 && (
        <div className="mt-3 text-xs text-dark-400 text-center">
          Dados agregados de {filterMunicipios.length} município{filterMunicipios.length > 1 ? 's' : ''}
        </div>
      )}

      {/* Explicação */}
      <div className="mt-4 text-sm text-dark-500 text-center">
        <p>A pirâmide etária mostra a distribuição da população por idade e sexo.</p>
        <p>Homens à esquerda (azul) e mulheres à direita (rosa).</p>
      </div>
    </div>
  )
}
