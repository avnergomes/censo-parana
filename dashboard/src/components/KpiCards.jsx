import { Users, TrendingUp, TrendingDown, Building2 } from 'lucide-react'
import { formatNumber, formatPercent, formatVariation } from '../utils/format'

export default function KpiCards({ stateTotals, contagens }) {
  const cards = [
    {
      title: 'Populacao Atual',
      value: formatNumber(stateTotals?.populacaoAtual),
      subtitle: `Censo ${stateTotals?.anoFinal || 2022}`,
      icon: Users,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
    },
    {
      title: 'Crescimento Total',
      value: formatVariation(stateTotals?.crescimentoTotal),
      subtitle: `${stateTotals?.anoInicial || 1991} - ${stateTotals?.anoFinal || 2022}`,
      icon: TrendingUp,
      color: 'text-success-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Taxa de Urbanizacao',
      value: formatPercent(stateTotals?.taxaUrbanizacaoAtual),
      subtitle: `Era ${formatPercent(stateTotals?.taxaUrbanizacaoInicial)} em ${stateTotals?.anoInicial || 1991}`,
      icon: Building2,
      color: 'text-warning-600',
      bgColor: 'bg-amber-100',
    },
    {
      title: 'Municipios com Evasao',
      value: contagens?.municipios_evasao || 0,
      subtitle: `De ${contagens?.total_municipios || 399} municipios`,
      icon: TrendingDown,
      color: 'text-danger-600',
      bgColor: 'bg-red-100',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <div key={index} className="kpi-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-dark-500 font-medium">{card.title}</p>
                <p className="text-2xl font-bold text-dark-800 mt-1">{card.value}</p>
                <p className="text-xs text-dark-400 mt-1">{card.subtitle}</p>
              </div>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
