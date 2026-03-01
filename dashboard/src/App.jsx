import { useState, useMemo, useEffect } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import Loading from './components/Loading'
import Filters from './components/Filters'
import Tabs from './components/Tabs'
import KpiCards from './components/KpiCards'
import PopulationMap from './components/PopulationMap'
import RuralUrbanChart from './components/RuralUrbanChart'
import TimeSeriesChart from './components/TimeSeriesChart'
import RankingTable from './components/RankingTable'
import PyramidChart from './components/PyramidChart'
import { useData, useFilteredData, useStateTotals } from './hooks/useData'

const TABS = [
  { id: 'visao-geral', label: 'Visão Geral', icon: 'LayoutDashboard' },
  { id: 'mapa', label: 'Mapa', icon: 'Map' },
  { id: 'rural-urbano', label: 'Rural vs Urbano', icon: 'Building2' },
  { id: 'ranking', label: 'Ranking', icon: 'Trophy' },
  { id: 'piramide', label: 'Pirâmide Etária', icon: 'Users' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('visao-geral')
  const [filters, setFilters] = useState({
    anoInicial: 1991,
    anoFinal: 2022,
    classificacao: 'todos',
    regional: 'todas',
    municipio: null,
    municipioNome: null,
  })

  // Carregar dados
  const { data, loading, error } = useData()

  // Inicializar anos dos filtros a partir do metadata
  useEffect(() => {
    if (data?.metadata?.anos_censos?.length) {
      const anos = data.metadata.anos_censos
      setFilters(prev => ({
        ...prev,
        anoInicial: anos[0],
        anoFinal: anos[anos.length - 1],
      }))
    }
  }, [data?.metadata?.anos_censos])

  // Filtrar dados
  const filteredData = useFilteredData(data, filters)

  // Totais do estado ou da seleção filtrada
  const stateTotals = useStateTotals(data, filteredData?.isFiltered ? filteredData : null)

  // Anos disponíveis para filtro
  const availableYears = useMemo(() => {
    if (!data?.metadata?.anos_censos) return [1991, 2000, 2010, 2022]
    return data.metadata.anos_censos
  }, [data])

  // Título dinâmico baseado nos filtros
  const filterTitle = useMemo(() => {
    if (filters.municipio) {
      return filters.municipioNome
    }
    if (filters.regional && filters.regional !== 'todas') {
      return `Regional ${filters.regional}`
    }
    return 'Paraná'
  }, [filters])

  // Rankings filtrados
  const filteredRankings = useMemo(() => {
    if (!filteredData?.municipios) return { top_evasao: [], top_crescimento: [] }

    const sorted = [...filteredData.municipios].sort((a, b) =>
      (a.variacao_total || a.variacao || 0) - (b.variacao_total || b.variacao || 0)
    )

    const top_evasao = sorted.slice(0, 20).map(m => ({
      nome: m.nome,
      codigo: m.codigo,
      regional: m.regional,
      variacao: m.variacao_total || m.variacao,
      pop_inicial: m.pop_inicial,
      pop_final: m.pop_final,
    }))

    const top_crescimento = [...sorted].reverse().slice(0, 20).map(m => ({
      nome: m.nome,
      codigo: m.codigo,
      regional: m.regional,
      variacao: m.variacao_total || m.variacao,
      pop_inicial: m.pop_inicial,
      pop_final: m.pop_final,
    }))

    return { top_evasao, top_crescimento }
  }, [filteredData])

  if (loading) {
    return <Loading />
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-50">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-2">Erro ao carregar dados</p>
          <p className="text-dark-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-50 to-accent-50/30">
      <Header metadata={data?.metadata} />

      <main className="container mx-auto px-4 py-8">
        {/* Filtros */}
        <Filters
          filters={filters}
          onChange={setFilters}
          availableYears={availableYears}
          municipios={data?.municipiosComRegional || []}
          regionais={data?.regionais || []}
        />

        {/* Indicador de filtro ativo */}
        {filteredData?.isFiltered && (
          <div className="mb-4 p-3 bg-accent-50 border border-accent-200 rounded-lg flex items-center justify-between">
            <div className="text-sm text-accent-700">
              <span className="font-medium">Visualizando:</span> {filterTitle}
              {filteredData.filteredCount !== data?.municipios?.length && (
                <span className="ml-2 text-accent-500">
                  ({filteredData.filteredCount} de {data?.municipios?.length} municípios)
                </span>
              )}
            </div>
          </div>
        )}

        {/* KPIs */}
        <KpiCards
          stateTotals={stateTotals}
          contagens={
            filteredData?.isFiltered
              ? {
                  total_municipios: filteredData.filteredCount,
                  municipios_evasao: filteredData.municipios.filter(m => m.classificacao === 'evasao').length,
                  municipios_crescimento: filteredData.municipios.filter(m =>
                    ['crescimento_alto', 'crescimento_moderado'].includes(m.classificacao)
                  ).length,
                }
              : data?.agregacoes?.contagens
          }
        />

        {/* Tabs */}
        <Tabs
          tabs={TABS}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {/* Conteúdo das Tabs */}
        <div className="mt-6">
          {/* Visão Geral */}
          {activeTab === 'visao-geral' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TimeSeriesChart
                  data={stateTotals?.serieHistorica}
                  title={`Evolução Populacional - ${filterTitle}`}
                />
                <RuralUrbanChart
                  data={stateTotals?.serieHistorica}
                  title={`População Rural vs Urbana - ${filterTitle}`}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RankingTable
                  data={filteredRankings.top_evasao}
                  title={`Top 10 - Maior Evasão${filteredData?.isFiltered ? ` (${filterTitle})` : ''}`}
                  type="evasao"
                  limit={10}
                  showRegional={!filters.regional || filters.regional === 'todas'}
                />
                <RankingTable
                  data={filteredRankings.top_crescimento}
                  title={`Top 10 - Maior Crescimento${filteredData?.isFiltered ? ` (${filterTitle})` : ''}`}
                  type="crescimento"
                  limit={10}
                  showRegional={!filters.regional || filters.regional === 'todas'}
                />
              </div>
            </div>
          )}

          {/* Mapa */}
          {activeTab === 'mapa' && (
            <PopulationMap
              data={filteredData?.municipios || data?.municipiosComRegional || data?.municipios}
              title={`Variação Populacional - ${filterTitle}`}
              periodo={`${filters.anoInicial} - ${filters.anoFinal}`}
              highlightRegional={filters.regional !== 'todas' ? filters.regional : null}
              highlightMunicipio={filters.municipio}
            />
          )}

          {/* Rural vs Urbano */}
          {activeTab === 'rural-urbano' && (
            <div className="space-y-6">
              <RuralUrbanChart
                data={stateTotals?.serieHistorica}
                title={`Evolução da Taxa de Urbanização - ${filterTitle}`}
                showPercentage
              />

              <div className="chart-container">
                <h3 className="text-lg font-semibold text-dark-800 mb-4">
                  Análise do Êxodo Rural {filteredData?.isFiltered ? `- ${filterTitle}` : ''}
                </h3>
                <div className="prose prose-sm text-dark-600">
                  {stateTotals && (
                    <>
                      <p>
                        {filters.municipio ? `O município de ${filters.municipioNome}` :
                         filters.regional !== 'todas' ? `A regional de ${filters.regional}` :
                         'O Paraná'} passou por uma intensa transformação demográfica nas últimas décadas.
                        A população urbana cresceu de {stateTotals.taxaUrbanizacaoInicial?.toFixed(1)}%
                        em {stateTotals.anoInicial} para {stateTotals.taxaUrbanizacaoAtual?.toFixed(1)}%
                        em {stateTotals.anoFinal}.
                      </p>
                      <p className="mt-2">
                        Esta urbanização foi acompanhada pela redução significativa da população rural,
                        especialmente em municípios do interior do estado, caracterizando o fenômeno
                        conhecido como êxodo rural.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Ranking */}
          {activeTab === 'ranking' && (
            <div className="space-y-6">
              <RankingTable
                data={filteredRankings.top_evasao}
                title={`Municípios com Maior Evasão${filteredData?.isFiltered ? ` - ${filterTitle}` : ''}`}
                type="evasao"
                limit={20}
                showRegional={!filters.regional || filters.regional === 'todas'}
              />
              <RankingTable
                data={filteredRankings.top_crescimento}
                title={`Municípios com Maior Crescimento${filteredData?.isFiltered ? ` - ${filterTitle}` : ''}`}
                type="crescimento"
                limit={20}
                showRegional={!filters.regional || filters.regional === 'todas'}
              />
            </div>
          )}

          {/* Pirâmide Etária */}
          {activeTab === 'piramide' && (
            <div className="space-y-6">
              <PyramidChart
                data={data?.detailed?.piramide}
                title={`Pirâmide Etária - ${filterTitle}`}
                filterMunicipios={filters.municipio ? [filters.municipio] :
                  filteredData?.isFiltered ? filteredData.municipios.map(m => m.codigo) : null}
              />

              <div className="chart-container">
                <h3 className="text-lg font-semibold text-dark-800 mb-4">
                  Envelhecimento Populacional
                </h3>
                <div className="prose prose-sm text-dark-600">
                  <p>
                    A pirâmide etária {filters.municipio ? `de ${filters.municipioNome}` :
                    filters.regional !== 'todas' ? `da regional ${filters.regional}` :
                    'do Paraná'} tem se transformado ao longo das décadas,
                    refletindo a queda na taxa de natalidade e o aumento da expectativa de vida.
                    A base mais estreita e o topo mais largo indicam o envelhecimento da população.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
