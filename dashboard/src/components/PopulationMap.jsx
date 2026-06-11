// ATLAS-A11Y-HEX-SWEPT
import { useEffect, useMemo } from 'react'
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

export default function PopulationMap({ data, geoData, title, periodo }) {
  // GeoJSON vem por prop (useData já converte o TopoJSON do hub).
  // O fetch local de assets/mun_PR.json quebrava em produção: o arquivo
  // está no .gitignore e nunca era deployado (404 ao vivo).
  const loading = !geoData
  const error = null

  // Centro do Paraná
  const center = [-24.5, -51.5]
  const defaultBounds = [
    [-26.5, -55],
    [-22.5, -48],
  ]

  // Criar mapa de dados para lookup rápido
  const dataMap = useMemo(() => {
    if (!data) return {}
    const map = {}
    data.forEach(item => {
      map[item.codigo] = item
    })
    return map
  }, [data])

  // Estilo do GeoJSON baseado na variação
  const getStyle = (feature) => {
    const codigo = feature.properties?.CodIbge
    const munData = dataMap[codigo]
    const variacao = munData?.variacao || munData?.variacao_total || 0

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
    const codigo = feature.properties?.CodIbge
    const nome = feature.properties?.Municipio
    const regional = feature.properties?.RegIdr
    const munData = dataMap[codigo]

    if (munData) {
      const popupContent = `
        <div class="text-sm min-w-[200px]">
          <strong class="text-dark-800 text-base">${nome}</strong>
          <p class="text-dark-500 text-xs mb-2">${regional || ''}</p>
          <div class="space-y-1">
            <div class="flex justify-between">
              <span class="text-dark-600">Pop. ${periodo?.split('-')[0] || '1991'}:</span>
              <span class="font-medium">${formatNumber(munData.pop_inicial)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-dark-600">Pop. ${periodo?.split('-')[1] || '2022'}:</span>
              <span class="font-medium">${formatNumber(munData.pop_final)}</span>
            </div>
            <div class="flex justify-between pt-1 border-t border-dark-200">
              <span class="text-dark-600">Variação:</span>
              <span class="font-bold" style="color: ${getVariationColor(munData.variacao || munData.variacao_total)}">
                ${formatVariation(munData.variacao || munData.variacao_total)}
              </span>
            </div>
          </div>
        </div>
      `
      layer.bindPopup(popupContent)
      layer.bindTooltip(nome, { permanent: false, direction: 'top' })
    } else {
      layer.bindTooltip(nome || 'Município', { permanent: false, direction: 'top' })
    }

    // Hover effect
    layer.on({
      mouseover: (e) => {
        const layer = e.target
        layer.setStyle({
          weight: 2,
          color: '#333',
          fillOpacity: 0.9,
        })
        layer.bringToFront()
      },
      mouseout: (e) => {
        const layer = e.target
        layer.setStyle({
          weight: 1,
          color: '#fff',
          fillOpacity: 0.7,
        })
      },
    })
  }

  // Key para forçar re-render do GeoJSON quando dados mudam
  const geoJsonKey = useMemo(() => {
    return `geojson-${periodo}-${data?.length || 0}`
  }, [periodo, data])

  if (loading) {
    return (
      <div className="chart-container">
        <h3 className="text-lg font-semibold text-dark-800 mb-4">{title}</h3>
        <div className="h-[500px] flex items-center justify-center text-dark-400">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Carregando mapa...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="chart-container">
        <h3 className="text-lg font-semibold text-dark-800 mb-4">{title}</h3>
        <div className="h-[500px] flex items-center justify-center text-danger-500">
          Erro ao carregar mapa: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-dark-800">{title}</h3>
        {periodo && (
          <span className="text-sm text-dark-500 bg-dark-100 px-3 py-1 rounded-full">
            Período: {periodo}
          </span>
        )}
      </div>

      <div className="h-[500px] rounded-lg overflow-hidden border border-dark-200 shadow-sm">
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

          {geoData && (
            <GeoJSON
              key={geoJsonKey}
              data={geoData}
              style={getStyle}
              onEachFeature={onEachFeature}
            />
          )}
        </MapContainer>
      </div>

      {/* Legenda */}
      <div className="mt-4 p-4 bg-dark-50 rounded-lg">
        <p className="text-xs text-dark-500 mb-3 font-medium">Variação populacional no período:</p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded shadow-sm" style={{ backgroundColor: '#D55E00' }}></div>
            <span className="text-dark-600">Evasão (&lt;-10%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded shadow-sm" style={{ backgroundColor: '#c89b3c' }}></div>
            <span className="text-dark-600">Redução leve (-10% a 0%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded shadow-sm" style={{ backgroundColor: '#87afcd' }}></div>
            <span className="text-dark-600">Crescimento (0% a 20%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded shadow-sm" style={{ backgroundColor: '#0072B2' }}></div>
            <span className="text-dark-600">Crescimento alto (&gt;20%)</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-dark-400 mt-3 text-center">
        Clique em um município para ver detalhes. Dados: IBGE - Censos Demográficos.
      </p>
    </div>
  )
}
