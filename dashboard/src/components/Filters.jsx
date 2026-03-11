import { useState, useMemo, useRef, useEffect } from 'react'
import { Calendar, Filter, MapPin, Building2, X, Search, ChevronDown } from 'lucide-react'

export default function Filters({
  filters,
  onChange,
  availableYears,
  municipios = [],
  regionais = []
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)

  const handleChange = (key, value) => {
    onChange(prev => ({ ...prev, [key]: value }))
  }

  // Filtrar municipios baseado na regional selecionada e termo de busca
  const filteredMunicipios = useMemo(() => {
    let result = municipios

    // Filtrar por regional se selecionada
    if (filters.regional && filters.regional !== 'todas') {
      result = result.filter(m => m.regional === filters.regional)
    }

    // Filtrar por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      result = result.filter(m => {
        const nome = m.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        return nome.includes(term)
      })
    }

    return result.slice(0, 20) // Limitar a 20 resultados
  }, [municipios, filters.regional, searchTerm])

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Selecionar município
  const selectMunicipio = (mun) => {
    handleChange('municipio', mun.codigo)
    handleChange('municipioNome', mun.nome)
    setSearchTerm('')
    setShowDropdown(false)
  }

  // Limpar município selecionado
  const clearMunicipio = () => {
    handleChange('municipio', null)
    handleChange('municipioNome', null)
    setSearchTerm('')
  }

  // Quando muda a regional, limpar município se não pertence à regional
  const handleRegionalChange = (regional) => {
    handleChange('regional', regional)

    // Se tem um município selecionado, verificar se pertence à nova regional
    if (filters.municipio && regional !== 'todas') {
      const mun = municipios.find(m => m.codigo === filters.municipio)
      if (mun && mun.regional !== regional) {
        clearMunicipio()
      }
    }
  }

  const [collapsed, setCollapsed] = useState(false)

  // Count active filters (beyond defaults)
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.regional && filters.regional !== 'todas') count++
    if (filters.municipio) count++
    if (filters.classificacao && filters.classificacao !== 'todos') count++
    return count
  }, [filters.regional, filters.municipio, filters.classificacao])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-dark-100 p-4 mb-6">
      <button
        onClick={() => setCollapsed(prev => !prev)}
        aria-label={collapsed ? 'Expandir filtros' : 'Recolher filtros'}
        className="flex items-center gap-2 text-dark-600 w-full"
      >
        <Filter className="w-4 h-4" />
        <span className="font-medium text-sm">Filtros</span>
        {activeFilterCount > 0 && (
          <span className="active-filter-badge">{activeFilterCount}</span>
        )}
        <ChevronDown
          className={`w-4 h-4 ml-auto transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`}
        />
      </button>

      <div className={`filter-panel ${collapsed ? 'collapsed' : ''}`}>
        <div>
      <div className="flex flex-wrap items-start gap-4 mt-3 pt-3 border-t border-dark-100">

        {/* Periodo */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-dark-400" />
          <select
            value={filters.anoInicial}
            onChange={(e) => handleChange('anoInicial', Number(e.target.value))}
            className="px-3 py-1.5 text-sm border border-dark-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
          >
            {availableYears.map(ano => (
              <option key={ano} value={ano}>{ano}</option>
            ))}
          </select>
          <span className="text-dark-400">até</span>
          <select
            value={filters.anoFinal}
            onChange={(e) => handleChange('anoFinal', Number(e.target.value))}
            className="px-3 py-1.5 text-sm border border-dark-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
          >
            {availableYears.map(ano => (
              <option key={ano} value={ano}>{ano}</option>
            ))}
          </select>
        </div>

        {/* Regional */}
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-dark-400" />
          <select
            value={filters.regional || 'todas'}
            onChange={(e) => handleRegionalChange(e.target.value)}
            className="px-3 py-1.5 text-sm border border-dark-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 min-w-[180px]"
          >
            <option value="todas">Todas as regionais</option>
            {regionais.map(reg => (
              <option key={reg} value={reg}>{reg}</option>
            ))}
          </select>
        </div>

        {/* Município - Autocomplete */}
        <div className="relative" ref={dropdownRef}>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-dark-400" />

            {filters.municipio ? (
              // Município selecionado
              <div className="flex items-center gap-2 px-3 py-1.5 bg-accent-100 text-accent-800 rounded-lg text-sm">
                <span>{filters.municipioNome}</span>
                <button
                  onClick={clearMunicipio}
                  className="hover:text-accent-600 transition-colors"
                  title="Limpar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              // Campo de busca
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setShowDropdown(true)
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Buscar município..."
                  className="pl-9 pr-3 py-1.5 text-sm border border-dark-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 w-[200px]"
                />
              </div>
            )}
          </div>

          {/* Dropdown de municipios */}
          {showDropdown && !filters.municipio && (
            <div className="absolute top-full left-0 mt-1 w-[280px] bg-white border border-dark-200 rounded-lg shadow-lg z-50 max-h-[300px] overflow-y-auto">
              {filteredMunicipios.length > 0 ? (
                filteredMunicipios.map(mun => (
                  <button
                    key={mun.codigo}
                    onClick={() => selectMunicipio(mun)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-accent-50 transition-colors flex items-center justify-between"
                  >
                    <span className="text-dark-800">{mun.nome}</span>
                    <span className="text-xs text-dark-400">{mun.regional}</span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-dark-400 text-center">
                  {searchTerm ? 'Nenhum município encontrado' : 'Digite para buscar...'}
                </div>
              )}

              {filteredMunicipios.length === 20 && (
                <div className="px-4 py-2 text-xs text-dark-400 text-center border-t border-dark-100">
                  Mostrando os primeiros 20 resultados
                </div>
              )}
            </div>
          )}
        </div>

        {/* Classificação */}
        <select
          value={filters.classificacao}
          onChange={(e) => handleChange('classificacao', e.target.value)}
          className="px-3 py-1.5 text-sm border border-dark-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
        >
          <option value="todos">Todos os tipos</option>
          <option value="evasao">Apenas com evasão</option>
          <option value="crescimento_alto">Crescimento alto</option>
          <option value="crescimento_moderado">Crescimento moderado</option>
          <option value="estavel">Estáveis</option>
        </select>

        {/* Botao limpar filtros */}
        {(filters.regional !== 'todas' || filters.municipio || filters.classificacao !== 'todos') && (
          <button
            onClick={() => {
              onChange(prev => ({
                ...prev,
                regional: 'todas',
                municipio: null,
                municipioNome: null,
                classificacao: 'todos'
              }))
              setSearchTerm('')
            }}
            className="px-3 py-1.5 text-sm text-accent-600 hover:text-accent-700 hover:bg-accent-50 rounded-lg transition-colors flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Limpar filtros
          </button>
        )}
      </div>
      </div>
      </div>

      {/* Resumo dos filtros ativos */}
      {(filters.regional !== 'todas' || filters.municipio) && (
        <div className="mt-3 pt-3 border-t border-dark-100 flex flex-wrap gap-2">
          {filters.regional !== 'todas' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent-100 text-accent-700 rounded-full text-xs">
              <MapPin className="w-3 h-3" />
              Regional: {filters.regional}
            </span>
          )}
          {filters.municipio && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs">
              <Building2 className="w-3 h-3" />
              {filters.municipioNome}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
