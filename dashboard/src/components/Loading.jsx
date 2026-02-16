import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-50 to-primary-50/30">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
        <p className="text-dark-600 font-medium">Carregando dados do censo...</p>
        <p className="text-dark-400 text-sm mt-1">IBGE - Censos Demográficos</p>
      </div>
    </div>
  )
}
