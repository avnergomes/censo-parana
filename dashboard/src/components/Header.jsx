import { Users, Info } from 'lucide-react'
import { useState } from 'react'

export default function Header({ metadata }) {
  const [showInfo, setShowInfo] = useState(false)

  return (
    <header className="bg-white shadow-sm border-b border-dark-100">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-600 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-dark-800">
                Censo Paraná
              </h1>
              <p className="text-sm text-dark-500">
                Evolução Demográfica Municipal (1991-2022)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="flex items-center gap-2 text-sm text-dark-600 hover:text-accent-600 transition-colors"
              title="Sobre o painel"
            >
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">Sobre</span>
            </button>

            <div className="text-right text-sm text-dark-500 hidden md:block">
              <p>Fonte: IBGE - Censos Demográficos</p>
              {metadata?.total_municipios && (
                <p>{metadata.total_municipios} municípios</p>
              )}
            </div>
          </div>
        </div>

        {/* Info Panel */}
        {showInfo && (
          <div className="mt-4 p-4 bg-accent-50 rounded-lg border border-accent-200">
            <h3 className="font-semibold text-dark-800 mb-2">Sobre este Painel</h3>
            <div className="text-sm text-dark-600 space-y-2">
              <p>
                Este dashboard apresenta a evolução demográfica dos 399 municípios do Paraná
                entre 1991 e 2022, com base nos dados oficiais do IBGE (Censos Demográficos).
              </p>
              <p>
                <strong>Fontes de dados:</strong> API SIDRA/IBGE - Tabela 202 (1991-2010) e Tabela 9923 (2022).
              </p>
              <p>
                <strong>Classificação dos municípios:</strong>
              </p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li><span className="text-danger-500 font-medium">Evasão:</span> Perda populacional maior que 10%</li>
                <li><span className="text-warning-500 font-medium">Estável:</span> Variação entre -10% e 0%</li>
                <li><span className="text-success-500 font-medium">Crescimento moderado:</span> Variação entre 0% e 20%</li>
                <li><span className="text-success-600 font-medium">Crescimento alto:</span> Variação maior que 20%</li>
              </ul>
              <p className="text-xs text-dark-400 mt-3">
                Os dados incluem população total, rural e urbana por município em cada censo.
              </p>
            </div>
            <button
              onClick={() => setShowInfo(false)}
              className="mt-3 text-xs text-accent-600 hover:underline"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
