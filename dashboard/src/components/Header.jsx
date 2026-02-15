import { BarChart3 } from 'lucide-react'

export default function Header({ metadata }) {
  return (
    <header className="bg-white shadow-sm border-b border-dark-100">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-600 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-dark-800">
                Censo Parana
              </h1>
              <p className="text-sm text-dark-500">
                Evolucao Demografica Municipal
              </p>
            </div>
          </div>

          <div className="text-right text-sm text-dark-500">
            <p>Fonte: IBGE - Censos Demograficos</p>
            {metadata?.total_municipios && (
              <p>{metadata.total_municipios} municipios</p>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
