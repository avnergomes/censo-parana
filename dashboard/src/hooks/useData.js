import { useState, useEffect, useMemo } from 'react'
import { feature } from 'topojson-client'

const BASE_URL = import.meta.env.BASE_URL || '/censo-parana/'
const TOPO_URL = 'https://cdn.jsdelivr.net/gh/datageoparana/datageoparana.github.io@main/assets/parana-municipalities.topojson'

/**
 * Extract available years from municipality data (fallback when metadata.anos_censos is missing)
 */
function extractAnosFromData(data) {
  if (!data?.municipios) return []
  const anosSet = new Set()
  data.municipios.forEach(mun => {
    (mun.dados || []).forEach(d => { if (d.ano) anosSet.add(d.ano) })
  })
  return Array.from(anosSet).sort((a, b) => a - b)
}

/**
 * Hook principal para carregar dados do censo
 */
export function useData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    async function fetchData() {
      try {
        setLoading(true)

        // Carregar todos os dados em paralelo
        const [aggResponse, detResponse, geoResponse] = await Promise.all([
          fetch(`${BASE_URL}data/aggregated.json`, { signal }),
          fetch(`${BASE_URL}data/detailed.json`, { signal }).catch(() => null),
          fetch(TOPO_URL, { signal }).catch(() => null)
        ])

        if (signal.aborted) return

        if (!aggResponse.ok) throw new Error('Erro ao carregar dados agregados')
        const aggregated = await aggResponse.json()

        if (signal.aborted) return

        // Processar dados detalhados (opcional)
        let detailed = null
        if (detResponse?.ok) {
          try {
            detailed = await detResponse.json()
          } catch (e) {
            console.warn('Dados detalhados não disponíveis:', e)
          }
        }

        if (signal.aborted) return

        // Processar GeoJSON para obter regionais
        let geoData = null
        let municipiosComRegional = []
        let regionais = []

        if (geoResponse?.ok) {
          try {
            const topo = await geoResponse.json()
            geoData = feature(topo, topo.objects.municipalities)

            // Extrair lista de municípios com suas regionais
            const munMap = new Map()
            geoData.features.forEach(f => {
              const codigo = f.properties.CodIbge
              const nome = f.properties.Municipio
              const regional = f.properties.RegIdr
              munMap.set(codigo, { codigo, nome, regional })
            })

            // Combinar com dados dos municípios do censo
            if (aggregated.municipios) {
              municipiosComRegional = aggregated.municipios.map(mun => {
                const geoInfo = munMap.get(mun.codigo)
                return {
                  ...mun,
                  regional: geoInfo?.regional || 'Desconhecida'
                }
              })
            } else {
              municipiosComRegional = Array.from(munMap.values())
            }

            // Extrair lista única de regionais ordenada
            regionais = [...new Set(municipiosComRegional.map(m => m.regional))]
              .filter(r => r && r !== 'Desconhecida')
              .sort((a, b) => a.localeCompare(b, 'pt-BR'))
          } catch (e) {
            console.warn('GeoJSON não disponível:', e)
          }
        }

        if (!signal.aborted) {
          setData({
            ...aggregated,
            detailed,
            geoData,
            municipiosComRegional,
            regionais
          })
          setError(null)
        }
      } catch (err) {
        if (err.name !== 'AbortError' && !signal.aborted) {
          console.error('Erro ao carregar dados:', err)
          setError(err.message)
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchData()
    return () => controller.abort()
  }, [])

  return { data, loading, error }
}

/**
 * Hook para filtrar dados por período, regional e município
 */
export function useFilteredData(data, filters) {
  return useMemo(() => {
    if (!data?.municipios && !data?.municipiosComRegional) return null

    const { anoInicial, anoFinal, classificacao, regional, municipio } = filters

    // Usar municipiosComRegional se disponível
    let municipios = data.municipiosComRegional || data.municipios || []

    // Filtrar por município específico
    if (municipio) {
      municipios = municipios.filter(m => m.codigo === municipio)
    }
    // Filtrar por regional
    else if (regional && regional !== 'todas') {
      municipios = municipios.filter(m => m.regional === regional)
    }

    // Filtrar por classificação
    if (classificacao && classificacao !== 'todos') {
      municipios = municipios.filter(m => m.classificacao === classificacao)
    }

    // Recalcular variações se período customizado
    const anosDisponiveis = data?.metadata?.anos_censos || extractAnosFromData(data)
    const primeiroAnoCenso = anosDisponiveis[0]
    const ultimoAnoCenso = anosDisponiveis[anosDisponiveis.length - 1]

    if (anoInicial && anoFinal && (anoInicial !== primeiroAnoCenso || anoFinal !== ultimoAnoCenso)) {
      municipios = municipios.map(mun => {
        const dadoInicial = mun.dados?.find(d => d.ano === anoInicial)
        const dadoFinal = mun.dados?.find(d => d.ano === anoFinal)

        if (!dadoInicial || !dadoFinal) return mun

        const popInicial = dadoInicial.total
        const popFinal = dadoFinal.total
        const variacao = popInicial > 0
          ? ((popFinal - popInicial) / popInicial) * 100
          : 0

        // Recalcular classificação para o período
        let classificacaoPeriodo = 'estavel'
        if (variacao < -10) classificacaoPeriodo = 'evasao'
        else if (variacao > 20) classificacaoPeriodo = 'crescimento_alto'
        else if (variacao > 0) classificacaoPeriodo = 'crescimento_moderado'

        return {
          ...mun,
          variacao_periodo: variacao,
          pop_periodo_inicial: popInicial,
          pop_periodo_final: popFinal,
          classificacao_periodo: classificacaoPeriodo,
          // Para o mapa, usar a variação do período
          variacao: variacao,
          pop_inicial: popInicial,
          pop_final: popFinal,
        }
      })
    }

    // Calcular totais filtrados
    const totaisFiltrados = calcularTotaisFiltrados(municipios, data.agregacoes?.totais_estado, anoInicial, anoFinal, anosDisponiveis)

    return {
      ...data,
      municipios,
      filteredCount: municipios.length,
      totaisFiltrados,
      isFiltered: !!(municipio || (regional && regional !== 'todas') || (classificacao && classificacao !== 'todos'))
    }
  }, [data, filters])
}

/**
 * Calcula totais para os municípios filtrados
 */
function calcularTotaisFiltrados(municipios, totaisEstado, anoInicial, anoFinal, anosDisponiveis) {
  if (!municipios || municipios.length === 0) return null

  const anos = anosDisponiveis.filter(a => a >= anoInicial && a <= anoFinal)
  const totais = {}

  anos.forEach(ano => {
    let total = 0
    let urbana = 0
    let rural = 0

    municipios.forEach(mun => {
      const dadoAno = mun.dados?.find(d => d.ano === ano)
      if (dadoAno) {
        total += dadoAno.total || 0
        urbana += dadoAno.urbana || 0
        rural += dadoAno.rural || 0
      }
    })

    totais[ano] = {
      total,
      urbana,
      rural,
      taxa_urbanizacao: total > 0 ? (urbana / total * 100) : 0
    }
  })

  return totais
}

/**
 * Hook para calcular totais do estado ou da seleção filtrada
 */
export function useStateTotals(data, filteredData = null) {
  return useMemo(() => {
    // Usar totais filtrados se disponíveis, senão usar totais do estado
    const totais = filteredData?.totaisFiltrados || data?.agregacoes?.totais_estado
    if (!totais) return null

    const anos = Object.keys(totais).map(Number).sort()

    if (anos.length < 2) return null

    const primeiroAno = anos[0]
    const ultimoAno = anos[anos.length - 1]

    const popInicial = totais[primeiroAno]?.total || 0
    const popFinal = totais[ultimoAno]?.total || 0
    const taxaInicialUrb = totais[primeiroAno]?.taxa_urbanizacao || 0
    const taxaFinalUrb = totais[ultimoAno]?.taxa_urbanizacao || 0

    const crescimento = popInicial > 0
      ? ((popFinal - popInicial) / popInicial) * 100
      : 0

    return {
      populacaoAtual: popFinal,
      populacaoInicial: popInicial,
      crescimentoTotal: crescimento,
      taxaUrbanizacaoAtual: taxaFinalUrb,
      taxaUrbanizacaoInicial: taxaInicialUrb,
      variacaoUrbanizacao: taxaFinalUrb - taxaInicialUrb,
      anoInicial: primeiroAno,
      anoFinal: ultimoAno,
      serieHistorica: anos.map(ano => ({
        ano,
        ...totais[ano],
      })),
    }
  }, [data, filteredData])
}
