import { useState, useEffect, useMemo } from 'react'

const BASE_URL = import.meta.env.BASE_URL || '/censo-parana/'

/**
 * Hook principal para carregar dados do censo
 */
export function useData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Carregar dados agregados
        const aggResponse = await fetch(`${BASE_URL}data/aggregated.json`)
        if (!aggResponse.ok) throw new Error('Erro ao carregar dados agregados')
        const aggregated = await aggResponse.json()

        // Carregar dados detalhados (opcional)
        let detailed = null
        try {
          const detResponse = await fetch(`${BASE_URL}data/detailed.json`)
          if (detResponse.ok) {
            detailed = await detResponse.json()
          }
        } catch (e) {
          console.warn('Dados detalhados não disponíveis:', e)
        }

        // Carregar GeoJSON para obter regionais
        let geoData = null
        let municipiosComRegional = []
        let regionais = []

        try {
          const geoResponse = await fetch(`${BASE_URL}assets/mun_PR.json`)
          if (geoResponse.ok) {
            geoData = await geoResponse.json()

            // Extrair lista de municipios com suas regionais
            const munMap = new Map()
            geoData.features.forEach(f => {
              const codigo = f.properties.CodIbge
              const nome = f.properties.Municipio
              const regional = f.properties.RegIdr
              munMap.set(codigo, { codigo, nome, regional })
            })

            // Combinar com dados dos municipios do censo
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

            // Extrair lista unica de regionais ordenada
            regionais = [...new Set(municipiosComRegional.map(m => m.regional))]
              .filter(r => r && r !== 'Desconhecida')
              .sort((a, b) => a.localeCompare(b, 'pt-BR'))
          }
        } catch (e) {
          console.warn('GeoJSON não disponível:', e)
        }

        setData({
          ...aggregated,
          detailed,
          geoData,
          municipiosComRegional,
          regionais
        })
        setError(null)
      } catch (err) {
        console.error('Erro ao carregar dados:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}

/**
 * Hook para filtrar dados por período, regional e municipio
 */
export function useFilteredData(data, filters) {
  return useMemo(() => {
    if (!data?.municipios && !data?.municipiosComRegional) return null

    const { anoInicial, anoFinal, classificacao, regional, municipio } = filters

    // Usar municipiosComRegional se disponível
    let municipios = data.municipiosComRegional || data.municipios || []

    // Filtrar por municipio específico
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
    if (anoInicial && anoFinal && (anoInicial !== 1991 || anoFinal !== 2022)) {
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
    const totaisFiltrados = calcularTotaisFiltrados(municipios, data.agregacoes?.totais_estado, anoInicial, anoFinal)

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
 * Calcula totais para os municipios filtrados
 */
function calcularTotaisFiltrados(municipios, totaisEstado, anoInicial, anoFinal) {
  if (!municipios || municipios.length === 0) return null

  const anos = [1991, 2000, 2010, 2022].filter(a => a >= anoInicial && a <= anoFinal)
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
