import { useEffect, useRef, useMemo } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import { formatNumber, formatVariation, getVariationColor } from '../utils/format'

// Componente para ajustar o mapa ao carregar
function MapController({ bounds }) {
  const map = useMap()

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds)
    }
  }, [map, bounds])

  return null
}

export default function PopulationMap({ data, title, periodo }) {
  const geoJsonRef = useRef(null)

  // Centro do Parana
  const center = [-24.5, -51.5]
  const defaultBounds = [
    [-26.5, -55],
    [-22.5, -48],
  ]

  // Estilo do GeoJSON baseado na variacao
  const getStyle = (feature) => {
    const codigo = feature.properties?.CD_MUN || feature.properties?.codigo
    const munData = data?.find(m => m.codigo === codigo)
    const variacao = munData?.variacao_total || munData?.variacao || 0

    return {
      fillColor: getVariationColor(variacao),
      weight: 1,
      opacity: 1,
      color: '#fff',
      fillOpacity: 0.7,
    }
  }

  // Tooltip ao passar o mouse
  const onEachFeature = (feature, layer) => {
    const codigo = feature.properties?.CD_MUN || feature.properties?.codigo
    const nome = feature.properties?.NM_MUN || feature.properties?.nome
    const munData = data?.find(m => m.codigo === codigo)

    if (munData) {
      const popupContent = `
        <div class="text-sm">
          <strong class="text-dark-800">${nome}</strong><br/>
          <span class="text-dark-600">Pop. Inicial: ${formatNumber(munData.pop_inicial)}</span><br/>
          <span class="text-dark-600">Pop. Final: ${formatNumber(munData.pop_final)}</span><br/>
          <span class="font-medium" style="color: ${getVariationColor(munData.variacao_total || munData.variacao)}">
            Variacao: ${formatVariation(munData.variacao_total || munData.variacao)}
          </span>
        </div>
      `
      layer.bindPopup(popupContent)
      layer.bindTooltip(nome, { permanent: false, direction: 'top' })
    }
  }

  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="text-lg font-semibold text-dark-800 mb-4">{title}</h3>
        <div className="h-96 flex items-center justify-center text-dark-400">
          Carregue o GeoJSON dos municipios do Parana
        </div>
      </div>
    )
  }

  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-dark-800">{title}</h3>
        {periodo && (
          <span className="text-sm text-dark-500">Periodo: {periodo}</span>
        )}
      </div>

      <div className="h-[500px] rounded-lg overflow-hidden border border-dark-200">
        <MapContainer
          center={center}
          zoom={7}
          className="h-full w-full"
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <MapController bounds={defaultBounds} />
        </MapContainer>
      </div>

      {/* Legenda */}
      <div className="mt-4 flex items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
          <span className="text-dark-600">Evasao (&lt;-10%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
          <span className="text-dark-600">Reducao (0 a -10%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#86efac' }}></div>
          <span className="text-dark-600">Crescimento (0 a 20%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#22c55e' }}></div>
          <span className="text-dark-600">Crescimento alto (&gt;20%)</span>
        </div>
      </div>

      <p className="text-xs text-dark-400 mt-2 text-center">
        Nota: Para visualizar o mapa completo, adicione o arquivo municipios.geojson ao diretorio public/data
      </p>
    </div>
  )
}
