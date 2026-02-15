/**
 * Formata número com separador de milhares brasileiro
 */
export function formatNumber(value) {
  if (value === null || value === undefined) return '-'
  return new Intl.NumberFormat('pt-BR').format(value)
}

/**
 * Formata valor como porcentagem
 */
export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined) return '-'
  return `${value.toFixed(decimals)}%`
}

/**
 * Formata variação com sinal (+/-)
 */
export function formatVariation(value) {
  if (value === null || value === undefined) return '-'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

/**
 * Retorna cor baseada na variação
 */
export function getVariationColor(value) {
  if (value < -10) return '#ef4444' // danger
  if (value < 0) return '#f59e0b' // warning
  if (value > 20) return '#22c55e' // success strong
  if (value > 0) return '#86efac' // success light
  return '#6b7280' // neutral
}

/**
 * Retorna classe de cor baseada na classificação
 */
export function getClassificationStyle(classification) {
  switch (classification) {
    case 'evasao':
      return { bg: 'bg-red-100', text: 'text-red-700', label: 'Evasão' }
    case 'crescimento_alto':
      return { bg: 'bg-green-100', text: 'text-green-700', label: 'Crescimento Alto' }
    case 'crescimento_moderado':
      return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Crescimento' }
    case 'estavel':
      return { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Estável' }
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-600', label: '-' }
  }
}
