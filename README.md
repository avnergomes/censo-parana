# Censo Paraná

Dashboard demográfico interativo do estado do Paraná com dados dos Censos Demográficos do IBGE de 1991, 2000, 2010 e 2022. Permite analisar a evolução populacional, urbanização, pirâmide etária e dinâmica municipal ao longo de três décadas.

**🔗 [Acessar](https://avnergomes.github.io/censo-parana/)**

Parte do ecossistema **[Datageo Paraná](https://datageoparana.github.io)**.

---

## Sobre

O **Censo Paraná** consolida dados dos quatro últimos censos demográficos brasileiros para os 399 municípios paranaenses. O painel permite identificar tendências de crescimento e retração populacional, o avanço da urbanização, a estrutura etária da população e os municípios com evasão populacional — informações essenciais para planejamento territorial e políticas públicas.

### KPIs principais

| Indicador | Descrição |
|-----------|-----------|
| **População atual** | Total de habitantes no censo mais recente (2022) |
| **Crescimento total** | Variação absoluta e percentual entre 1991 e 2022 |
| **Taxa de urbanização** | Percentual de população residente em áreas urbanas |
| **Municípios com evasão** | Quantidade de municípios com população menor que no censo anterior |

---

## Fonte de Dados

| Fonte | Sistema | Acesso |
|-------|---------|--------|
| **IBGE** | Censos Demográficos 1991, 2000, 2010 e 2022 | [API SIDRA/IBGE](https://sidra.ibge.gov.br/) |

Os dados são coletados via API SIDRA pelo script `download_sidra.py` e processados localmente.

---

## Tecnologias

| Categoria | Tecnologia | Versão |
|-----------|-----------|--------|
| Framework UI | React | 18 |
| Build tool | Vite | 5 |
| Estilização | Tailwind CSS | 3 |
| Gráficos | Recharts | — |
| Gráficos | D3.js | — |
| Mapa | Leaflet / React-Leaflet | — |
| Pipeline de dados | Python | 3.x |
| CI/CD | GitHub Actions | — |

---

## Estrutura do Projeto

```
censo-parana/
├── data/                           # Dados brutos
│   ├── populacao_censos.csv        # Série histórica populacional
│   ├── piramide_2022.json          # Estrutura etária por faixa e sexo
│   └── municipios_pr.json          # Metadados dos municípios
├── dashboard/                      # Aplicação React (Vite)
│   ├── public/
│   │   ├── assets/
│   │   │   └── mun_PR.json         # GeoJSON dos municípios do PR
│   │   └── data/
│   │       ├── aggregated.json     # Dados agregados por censo
│   │       ├── detailed.json       # Dados detalhados por município
│   │       └── map_data.json       # Dados para o mapa coroplético
│   └── src/
│       ├── components/
│       │   ├── ErrorBoundary.jsx
│       │   ├── Filters.jsx
│       │   ├── Footer.jsx
│       │   ├── Header.jsx
│       │   ├── KpiCards.jsx
│       │   ├── Loading.jsx
│       │   ├── PopulationMap.jsx
│       │   ├── PyramidChart.jsx
│       │   ├── RankingTable.jsx
│       │   ├── RuralUrbanChart.jsx
│       │   ├── Tabs.jsx
│       │   └── TimeSeriesChart.jsx
│       ├── hooks/
│       │   └── useData.js
│       └── utils/
│           └── format.js
├── scripts/
│   ├── download_sidra.py           # Coleta dados da API IBGE/SIDRA
│   └── preprocess_data.py          # Processamento e exportação dos JSONs
└── .github/
    └── workflows/
        └── deploy.yml              # Deploy no GitHub Pages
```

---

## Funcionalidades

- **Mapa coroplético** — visualização da densidade e variação populacional por município
- **Pirâmide etária** — distribuição da população por faixa etária e sexo (censo 2022)
- **Evolução rural vs. urbano** — série histórica de urbanização entre os quatro censos
- **Séries temporais** — crescimento populacional por município ou região ao longo das décadas
- **Ranking de municípios** — tabela ordenável por população, crescimento ou taxa de urbanização
- **Filtros por região e período** — análise segmentada por mesorregiões e censos
- **Identificação de evasão populacional** — destaque para municípios que perderam habitantes
- **399 municípios** cobertos em **4 censos** (1991, 2000, 2010, 2022)

---

## Desenvolvimento Local

### Pré-requisitos

- Node.js 18+
- Python 3.x (para o pipeline de dados)

### Instalação e execução

```bash
# Clonar o repositório
git clone https://github.com/avnergomes/censo-parana.git
cd censo-parana/dashboard

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

```bash
# Build de produção
npm run build

# Pré-visualizar build
npm run preview
```

---

## Pipeline de Dados

```bash
# Instalar dependências Python
pip install -r scripts/requirements.txt

# 1. Baixar dados da API IBGE/SIDRA
python scripts/download_sidra.py

# 2. Processar e gerar os JSONs para o dashboard
python scripts/preprocess_data.py
```

Os arquivos são exportados para `dashboard/public/data/` e `dashboard/public/assets/`.

---

## Licença

MIT License — consulte o arquivo `LICENSE` no repositório para detalhes.
