// ATLAS-A11Y-HEX-SWEPT
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
  if (value < -10) return '#D55E00' // danger
  if (value < 0) return '#c89b3c' // warning
  if (value > 20) return '#0072B2' // success strong
  if (value > 0) return '#87afcd' // success light
  return '#6b7280' // neutral
}

/**
 * Retorna classe de cor baseada na classificação
 */
export function getClassificationStyle(classification) {
  switch (classification) {
    case 'evasao':
      return { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Evasão' }
    case 'crescimento_alto':
      return { bg: 'bg-sky-100', text: 'text-sky-800', label: 'Crescimento Alto' }
    case 'crescimento_moderado':
      return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Crescimento' }
    case 'estavel':
      return { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Estável' }
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-600', label: '-' }
  }
}

// ATLAS-PALETTE-V1
// Re-export the shared Atlas Editorial palette (daltonic-safe).
export { CHART_COLORS, MAP_GRADIENTS, ATLAS_CATEGORICAL, ATLAS_FOREST, ATLAS_WATER, ATLAS_CLAY, ATLAS_EARTH, ATLAS_HARVEST, ATLAS_DIVERGING, ATLAS_CHROME, categoricalColor, sequentialColor } from './chart-palette.js';
