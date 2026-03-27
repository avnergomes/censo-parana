import { Database, ExternalLink } from 'lucide-react';

export default function Footer({ metadata }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-accent-200 bg-gradient-to-b from-neutral-50 to-accent-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Fonte de Dados */}
          <div className="space-y-3">
            <h4 className="font-semibold text-dark-900 text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-accent-600" />
              Fonte de Dados
            </h4>
            <ul className="space-y-1.5 text-xs text-dark-600">
              <li>IBGE - Instituto Brasileiro de Geografia e Estatística</li>
              <li>Censos Demográficos: 1991, 2000, 2010, 2022</li>
              <li>API SIDRA - Tabelas 202 e 9923</li>
            </ul>
            <p className="text-xs text-dark-400">399 municípios do Paraná</p>
          </div>

          {/* Datageo Paraná */}
          <div className="space-y-3">
            <h4 className="font-semibold text-dark-900 text-sm">
              <a
                href="https://datageoparana.github.io"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent-600 transition-colors inline-flex items-center gap-1"
              >
                Datageo Paraná
                <ExternalLink className="w-3 h-3" />
              </a>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              <a
                href="https://avnergomes.github.io/vbp-parana/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-2.5 py-1 text-[10px] rounded-full border border-accent-200 bg-white/70 text-dark-600 hover:text-accent-600 hover:border-accent-300 transition-colors"
              >
                VBP Paraná
              </a>
              <a
                href="https://avnergomes.github.io/precos-diarios/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-2.5 py-1 text-[10px] rounded-full border border-accent-200 bg-white/70 text-dark-600 hover:text-accent-600 hover:border-accent-300 transition-colors"
              >
                Precos Diarios
              </a>
              <a
                href="https://avnergomes.github.io/precos-florestais/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-2.5 py-1 text-[10px] rounded-full border border-accent-200 bg-white/70 text-dark-600 hover:text-accent-600 hover:border-accent-300 transition-colors"
              >
                Precos Florestais
              </a>
              <a
                href="https://avnergomes.github.io/precos-de-terras/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-2.5 py-1 text-[10px] rounded-full border border-accent-200 bg-white/70 text-dark-600 hover:text-accent-600 hover:border-accent-300 transition-colors"
              >
                Precos de Terras
              </a>
              <a
                href="https://avnergomes.github.io/comexstat-parana/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-2.5 py-1 text-[10px] rounded-full border border-accent-200 bg-white/70 text-dark-600 hover:text-accent-600 hover:border-accent-300 transition-colors"
              >
                ComexStat Paraná
              </a>
              <a
                href="https://avnergomes.github.io/emprego-agro-parana/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-2.5 py-1 text-[10px] rounded-full border border-accent-200 bg-white/70 text-dark-600 hover:text-accent-600 hover:border-accent-300 transition-colors"
              >
                Emprego Agro
              </a>
              <a
                href="https://avnergomes.github.io/credito-rural-parana/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-2.5 py-1 text-[10px] rounded-full border border-accent-200 bg-white/70 text-dark-600 hover:text-accent-600 hover:border-accent-300 transition-colors"
              >
                Crédito Rural
              </a>
              <a
                href="https://avnergomes.github.io/saude-parana/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-2.5 py-1 text-[10px] rounded-full border border-accent-200 bg-white/70 text-dark-600 hover:text-accent-600 hover:border-accent-300 transition-colors"
              >
                Saúde Paraná
              </a>
              <a
                href="https://avnergomes.github.io/seguranca-parana/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-2.5 py-1 text-[10px] rounded-full border border-accent-200 bg-white/70 text-dark-600 hover:text-accent-600 hover:border-accent-300 transition-colors"
              >
                Seguranca Parana
              </a>
            </div>
          </div>

          {/* Developer */}
          <div className="space-y-3 flex flex-col items-start md:items-end">
            <a
              href="https://avnergomes.github.io/portfolio"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-dark-500 hover:text-accent-600 transition-colors group"
              title="Portfolio"
            >
              <img
                src={`${import.meta.env.BASE_URL}assets/logo.png`}
                alt="Avner Gomes"
                className="w-8 h-8 rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
                onError={(e) => { e.target.style.display = 'none' }}
              />
              <span className="text-xs">Desenvolvido por Avner Gomes</span>
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-6 pt-4 border-t border-accent-200 flex flex-wrap items-center justify-between gap-2 text-[10px] text-dark-400">
          <p>&copy; {currentYear} Censo Paraná. Dados públicos.</p>
          <div className="flex gap-2">
            <span className="px-2 py-0.5 bg-accent-100 text-accent-700 rounded-full">4 censos</span>
            <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full">399 municípios</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
