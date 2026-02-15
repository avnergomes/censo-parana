import { Calendar, Filter } from 'lucide-react'

export default function Filters({ filters, onChange, availableYears }) {
  const handleChange = (key, value) => {
    onChange(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-dark-100 p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-dark-600">
          <Filter className="w-4 h-4" />
          <span className="font-medium text-sm">Filtros:</span>
        </div>

        {/* Periodo */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-dark-400" />
          <select
            value={filters.anoInicial}
            onChange={(e) => handleChange('anoInicial', Number(e.target.value))}
            className="px-3 py-1.5 text-sm border border-dark-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {availableYears.map(ano => (
              <option key={ano} value={ano}>{ano}</option>
            ))}
          </select>
          <span className="text-dark-400">ate</span>
          <select
            value={filters.anoFinal}
            onChange={(e) => handleChange('anoFinal', Number(e.target.value))}
            className="px-3 py-1.5 text-sm border border-dark-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {availableYears.map(ano => (
              <option key={ano} value={ano}>{ano}</option>
            ))}
          </select>
        </div>

        {/* Classificacao */}
        <select
          value={filters.classificacao}
          onChange={(e) => handleChange('classificacao', e.target.value)}
          className="px-3 py-1.5 text-sm border border-dark-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="todos">Todos os municipios</option>
          <option value="evasao">Apenas com evasao</option>
          <option value="crescimento_alto">Crescimento alto</option>
          <option value="crescimento_moderado">Crescimento moderado</option>
          <option value="estavel">Estaveis</option>
        </select>
      </div>
    </div>
  )
}
