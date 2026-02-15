import { useMemo, useState } from 'react'

export default function PyramidChart({ data, title }) {
  const [selectedYear, setSelectedYear] = useState('2022')

  // Anos disponiveis
  const years = useMemo(() => {
    if (!data) return []
    return Object.keys(data)
  }, [data])

  // Dados formatados para a piramide
  const pyramidData = useMemo(() => {
    if (!data || !data[selectedYear]) return []

    // A estrutura depende dos dados reais da API
    // Este e um exemplo de como seria processado
    const yearData = data[selectedYear]

    if (Array.isArray(yearData)) {
      // Se for array, tentar extrair faixas etarias
      return yearData
    }

    return []
  }, [data, selectedYear])

  if (!data || years.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="text-lg font-semibold text-dark-800 mb-4">{title}</h3>
        <div className="h-96 flex flex-col items-center justify-center text-dark-400">
          <p>Dados da piramide etaria nao disponiveis</p>
          <p className="text-sm mt-2">
            Execute o script de download para obter os dados do IBGE
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-dark-800">{title}</h3>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-3 py-1.5 text-sm border border-dark-200 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      <div className="h-96 flex items-center justify-center">
        {pyramidData.length > 0 ? (
          <div className="w-full">
            {/* Piramide sera renderizada aqui com D3 */}
            <p className="text-dark-500 text-center">
              Piramide para {selectedYear} sera renderizada apos processar dados
            </p>
          </div>
        ) : (
          <div className="text-center text-dark-400">
            <p>Processando dados da piramide...</p>
          </div>
        )}
      </div>

      {/* Explicacao */}
      <div className="mt-4 text-sm text-dark-500 text-center">
        <p>A piramide etaria mostra a distribuicao da populacao por idade e sexo.</p>
        <p>Homens a esquerda (azul) e mulheres a direita (rosa).</p>
      </div>
    </div>
  )
}
