import { useState, useMemo } from 'react'
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
  { id: 'visao-geral', label: 'Visao Geral', icon: 'LayoutDashboard' },
  { id: 'mapa', label: 'Mapa', icon: 'Map' },
  { id: 'rural-urbano', label: 'Rural vs Urbano', icon: 'Building2' },
  { id: 'ranking', label: 'Ranking', icon: 'Trophy' },
  { id: 'piramide', label: 'Piramide Etaria', icon: 'Users' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('visao-geral')
  const [filters, setFilters] = useState({
    anoInicial: 1991,
    anoFinal: 2022,
    classificacao: 'todos',
  })

  // Carregar dados
  const { data, loading, error } = useData()

  // Filtrar dados
  const filteredData = useFilteredData(data, filters)

  // Totais do estado
  const stateTotals = useStateTotals(data)

  // Anos disponíveis para filtro
  const availableYears = useMemo(() => {
    if (!data?.metadata?.anos_censos) return [1991, 2000, 2010, 2022]
    return data.metadata.anos_censos
  }, [data])

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
    <div className="min-h-screen bg-gradient-to-br from-dark-50 to-primary-50/30">
      <Header metadata={data?.metadata} />

      <main className="container mx-auto px-4 py-8">
        {/* Filtros */}
        <Filters
          filters={filters}
          onChange={setFilters}
          availableYears={availableYears}
        />

        {/* KPIs */}
        <KpiCards
          stateTotals={stateTotals}
          contagens={data?.agregacoes?.contagens}
        />

        {/* Tabs */}
        <Tabs
          tabs={TABS}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {/* Conteudo das Tabs */}
        <div className="mt-6">
          {/* Visao Geral */}
          {activeTab === 'visao-geral' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TimeSeriesChart
                  data={stateTotals?.serieHistorica}
                  title="Evolucao Populacional do Parana"
                />
                <RuralUrbanChart
                  data={stateTotals?.serieHistorica}
                  title="Populacao Rural vs Urbana"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RankingTable
                  data={data?.agregacoes?.rankings?.top_evasao}
                  title="Top 10 - Maior Evasao Populacional"
                  type="evasao"
                  limit={10}
                />
                <RankingTable
                  data={data?.agregacoes?.rankings?.top_crescimento}
                  title="Top 10 - Maior Crescimento"
                  type="crescimento"
                  limit={10}
                />
              </div>
            </div>
          )}

          {/* Mapa */}
          {activeTab === 'mapa' && (
            <PopulationMap
              data={filteredData?.municipios || data?.map_data}
              title="Variacao Populacional por Municipio"
              periodo={`${filters.anoInicial} - ${filters.anoFinal}`}
            />
          )}

          {/* Rural vs Urbano */}
          {activeTab === 'rural-urbano' && (
            <div className="space-y-6">
              <RuralUrbanChart
                data={stateTotals?.serieHistorica}
                title="Evolucao da Taxa de Urbanizacao"
                showPercentage
              />

              <div className="chart-container">
                <h3 className="text-lg font-semibold text-dark-800 mb-4">
                  Analise do Exodo Rural
                </h3>
                <div className="prose prose-sm text-dark-600">
                  <p>
                    O Parana passou por uma intensa transformacao demografica nas ultimas decadas.
                    A populacao urbana cresceu de {stateTotals?.taxaUrbanizacaoInicial?.toFixed(1)}%
                    em {stateTotals?.anoInicial} para {stateTotals?.taxaUrbanizacaoAtual?.toFixed(1)}%
                    em {stateTotals?.anoFinal}.
                  </p>
                  <p className="mt-2">
                    Esta urbanizacao foi acompanhada pela reducao significativa da populacao rural,
                    especialmente em municipios do interior do estado, caracterizando o fenomeno
                    conhecido como exodo rural.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Ranking */}
          {activeTab === 'ranking' && (
            <div className="space-y-6">
              <RankingTable
                data={data?.agregacoes?.rankings?.top_evasao}
                title="Municipios com Maior Evasao Populacional"
                type="evasao"
                limit={20}
              />
              <RankingTable
                data={data?.agregacoes?.rankings?.top_crescimento}
                title="Municipios com Maior Crescimento"
                type="crescimento"
                limit={20}
              />
            </div>
          )}

          {/* Piramide Etaria */}
          {activeTab === 'piramide' && (
            <div className="space-y-6">
              <PyramidChart
                data={data?.detailed?.piramide}
                title="Piramide Etaria do Parana"
              />

              <div className="chart-container">
                <h3 className="text-lg font-semibold text-dark-800 mb-4">
                  Envelhecimento Populacional
                </h3>
                <div className="prose prose-sm text-dark-600">
                  <p>
                    A piramide etaria do Parana tem se transformado ao longo das decadas,
                    refletindo a queda na taxa de natalidade e o aumento da expectativa de vida.
                    A base mais estreita e o topo mais largo indicam o envelhecimento da populacao.
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
