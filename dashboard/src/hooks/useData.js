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

        setData({ ...aggregated, detailed })
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
 * Hook para filtrar dados por período
 */
export function useFilteredData(data, filters) {
  return useMemo(() => {
    if (!data?.municipios) return null

    const { anoInicial, anoFinal, classificacao } = filters

    let municipios = data.municipios

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

        return {
          ...mun,
          variacao_periodo: variacao,
          pop_periodo_inicial: popInicial,
          pop_periodo_final: popFinal,
        }
      })
    }

    return {
      ...data,
      municipios,
      filteredCount: municipios.length,
    }
  }, [data, filters])
}

/**
 * Hook para calcular totais do estado
 */
export function useStateTotals(data) {
  return useMemo(() => {
    if (!data?.agregacoes?.totais_estado) return null

    const totais = data.agregacoes.totais_estado
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
  }, [data])
}
