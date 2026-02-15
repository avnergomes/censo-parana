import { TrendingDown, TrendingUp } from 'lucide-react'
import { formatNumber, formatVariation } from '../utils/format'

export default function RankingTable({ data, title, type, limit = 10 }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="text-lg font-semibold text-dark-800 mb-4">{title}</h3>
        <div className="py-8 text-center text-dark-400">
          Dados nao disponiveis
        </div>
      </div>
    )
  }

  const isEvasao = type === 'evasao'
  const limitedData = data.slice(0, limit)

  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-dark-800">{title}</h3>
        {isEvasao ? (
          <TrendingDown className="w-5 h-5 text-red-500" />
        ) : (
          <TrendingUp className="w-5 h-5 text-green-500" />
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th className="w-12">#</th>
              <th>Municipio</th>
              <th className="text-right">Pop. Inicial</th>
              <th className="text-right">Pop. Final</th>
              <th className="text-right">Variacao</th>
            </tr>
          </thead>
          <tbody>
            {limitedData.map((item, index) => (
              <tr key={item.codigo || index}>
                <td className="text-dark-400 font-medium">{index + 1}</td>
                <td className="font-medium text-dark-800">{item.nome}</td>
                <td className="text-right text-dark-600">
                  {formatNumber(item.pop_inicial)}
                </td>
                <td className="text-right text-dark-600">
                  {formatNumber(item.pop_final)}
                </td>
                <td className="text-right">
                  <span
                    className={`
                      px-2 py-1 rounded text-sm font-medium
                      ${isEvasao ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}
                    `}
                  >
                    {formatVariation(item.variacao)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length > limit && (
        <p className="text-sm text-dark-400 mt-4 text-center">
          Mostrando {limit} de {data.length} municipios
        </p>
      )}
    </div>
  )
}
