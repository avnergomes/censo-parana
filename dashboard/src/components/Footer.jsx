import { Github, ExternalLink } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-dark-100 mt-12">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-dark-500">
            <p>
              Dados: <a
                href="https://www.ibge.gov.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:underline"
              >
                IBGE - Instituto Brasileiro de Geografia e Estatistica
              </a>
            </p>
            <p className="mt-1">
              Censos Demograficos: 1991, 2000, 2010, 2022
            </p>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://datageoparana.github.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-dark-600 hover:text-primary-600 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              DataGeo Parana
            </a>
            <a
              href="https://github.com/datageoparana/censo-parana"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-dark-600 hover:text-primary-600 transition-colors"
            >
              <Github className="w-4 h-4" />
              Codigo Fonte
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
