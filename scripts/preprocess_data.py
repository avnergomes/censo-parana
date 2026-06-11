#!/usr/bin/env python3
"""
Preprocessamento dos dados do Censo IBGE para o dashboard
Gera JSONs otimizados para visualização a partir dos dados reais da API SIDRA
"""

import pandas as pd
import json
from pathlib import Path

# Diretórios
DATA_DIR = Path(__file__).parent.parent / "data"
OUTPUT_DIR = Path(__file__).parent.parent / "dashboard" / "public" / "data"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def load_population_data() -> pd.DataFrame:
    """Carrega dados de população dos censos"""
    filepath = DATA_DIR / "populacao_censos.csv"
    if filepath.exists():
        df = pd.read_csv(filepath)
        print(f"Carregado: {len(df)} registros de população")
        return df
    print("AVISO: Arquivo populacao_censos.csv não encontrado")
    return pd.DataFrame()


def load_municipalities() -> dict:
    """Carrega lista de municípios"""
    filepath = DATA_DIR / "municipios_pr.json"
    if filepath.exists():
        with open(filepath, "r", encoding="utf-8") as f:
            municipios = json.load(f)
        return {str(m["id"]): m["nome"] for m in municipios}
    return {}


def process_population_by_municipality(df: pd.DataFrame) -> list:
    """
    Processa dados de população por município
    Retorna lista de municípios com dados históricos
    """
    if df.empty:
        return []

    municipios = []

    for cod, grupo in df.groupby("cod_municipio"):
        # Extrair nome do município (remover "(PR)" se existir)
        nome = grupo["municipio"].iloc[0]
        if " (PR)" in nome:
            nome = nome.replace(" (PR)", "")

        mun_data = {
            "codigo": str(cod),
            "nome": nome,
            "dados": [],
        }

        # Processar cada ano
        for ano in sorted(grupo["ano"].unique()):
            ano_data = grupo[grupo["ano"] == ano]

            # Extrair valores por situação
            total = ano_data[ano_data["situacao"] == "Total"]["populacao"].sum()
            urbana = ano_data[ano_data["situacao"] == "Urbana"]["populacao"].sum()
            rural = ano_data[ano_data["situacao"] == "Rural"]["populacao"].sum()

            # Se não tem breakdown, usar total
            if total == 0 and urbana == 0 and rural == 0:
                total = ano_data["populacao"].sum()

            # Calcular taxa de urbanização
            taxa_urb = round(urbana / total * 100, 1) if total > 0 else 0

            mun_data["dados"].append({
                "ano": int(ano),
                "total": int(total) if total > 0 else int(urbana + rural),
                "urbana": int(urbana),
                "rural": int(rural),
                "taxa_urbanizacao": taxa_urb,
            })

        municipios.append(mun_data)

    return municipios


def calculate_variations(municipios: list) -> list:
    """
    Calcula variações percentuais entre censos
    """
    for mun in municipios:
        dados = mun.get("dados", [])
        if len(dados) >= 2:
            # Encontrar primeiro e último censo com dados
            dados_validos = [d for d in dados if d.get("total", 0) > 0]

            if len(dados_validos) >= 2:
                primeiro = dados_validos[0]
                ultimo = dados_validos[-1]

                pop_inicial = primeiro.get("total", 0)
                pop_final = ultimo.get("total", 0)

                if pop_inicial > 0:
                    variacao_pct = round((pop_final - pop_inicial) / pop_inicial * 100, 1)
                else:
                    variacao_pct = 0

                mun["variacao_total"] = variacao_pct
                mun["pop_inicial"] = pop_inicial
                mun["pop_final"] = pop_final
                mun["ano_inicial"] = primeiro.get("ano")
                mun["ano_final"] = ultimo.get("ano")

                # Classificação
                if variacao_pct < -10:
                    mun["classificacao"] = "evasao"
                elif variacao_pct > 20:
                    mun["classificacao"] = "crescimento_alto"
                elif variacao_pct > 0:
                    mun["classificacao"] = "crescimento_moderado"
                else:
                    mun["classificacao"] = "estavel"

    return municipios


def generate_aggregations(municipios: list) -> dict:
    """
    Gera agregações para KPIs e rankings
    """
    # Totais do estado por ano
    totais = {}
    anos = set()

    for mun in municipios:
        for d in mun.get("dados", []):
            ano = d.get("ano")
            anos.add(ano)
            if ano not in totais:
                totais[ano] = {"total": 0, "urbana": 0, "rural": 0}
            totais[ano]["total"] += d.get("total", 0)
            totais[ano]["urbana"] += d.get("urbana", 0)
            totais[ano]["rural"] += d.get("rural", 0)

    # Calcular taxa de urbanização por ano
    for ano in totais:
        total = totais[ano]["total"]
        urbana = totais[ano]["urbana"]
        totais[ano]["taxa_urbanizacao"] = round(urbana / total * 100, 1) if total > 0 else 0

    # Rankings
    mun_com_variacao = [m for m in municipios if "variacao_total" in m]

    top_evasao = sorted(mun_com_variacao, key=lambda x: x.get("variacao_total", 0))[:20]
    top_crescimento = sorted(mun_com_variacao, key=lambda x: x.get("variacao_total", 0), reverse=True)[:20]

    # Contagens
    n_evasao = len([m for m in mun_com_variacao if m.get("classificacao") == "evasao"])
    n_crescimento = len([m for m in mun_com_variacao if m.get("classificacao") in ["crescimento_alto", "crescimento_moderado"]])

    return {
        "totais_estado": {str(ano): totais[ano] for ano in sorted(totais.keys())},
        "rankings": {
            "top_evasao": [
                {
                    "nome": m.get("nome"),
                    "codigo": m.get("codigo"),
                    "variacao": m.get("variacao_total"),
                    "pop_inicial": m.get("pop_inicial"),
                    "pop_final": m.get("pop_final"),
                }
                for m in top_evasao
            ],
            "top_crescimento": [
                {
                    "nome": m.get("nome"),
                    "codigo": m.get("codigo"),
                    "variacao": m.get("variacao_total"),
                    "pop_inicial": m.get("pop_inicial"),
                    "pop_final": m.get("pop_final"),
                }
                for m in top_crescimento
            ],
        },
        "contagens": {
            "total_municipios": len(municipios),
            "municipios_evasao": n_evasao,
            "municipios_crescimento": n_crescimento,
        },
    }


def process_piramide(filepath: Path) -> dict:
    """
    Processa dados da pirâmide etária
    """
    if not filepath.exists():
        return {}

    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)

    if not data:
        return {}

    # Grupos 80+ vêm separados na classificação c287 do SIDRA; a pirâmide
    # do dashboard exibe a faixa agregada '80 anos ou mais'.
    faixas_80_mais = {
        "80 a 84 anos", "85 a 89 anos", "90 a 94 anos",
        "95 a 99 anos", "100 anos ou mais",
    }

    # Processar por município e faixa etária
    piramide = {}

    for row in data:
        cod_mun = row.get("D1C", "")
        sexo = row.get("D4N", "")
        faixa = row.get("D5N", "")
        valor = row.get("V", "0")

        if valor == "-" or valor == "...":
            continue

        try:
            valor = int(float(valor))
        except (ValueError, TypeError):
            continue

        if faixa in faixas_80_mais:
            faixa = "80 anos ou mais"

        if cod_mun not in piramide:
            piramide[cod_mun] = {"homens": {}, "mulheres": {}}

        if sexo == "Homens":
            piramide[cod_mun]["homens"][faixa] = piramide[cod_mun]["homens"].get(faixa, 0) + valor
        elif sexo == "Mulheres":
            piramide[cod_mun]["mulheres"][faixa] = piramide[cod_mun]["mulheres"].get(faixa, 0) + valor

    return piramide


def main():
    """
    Pipeline principal de processamento
    """
    print("=" * 60)
    print("PREPROCESSAMENTO DE DADOS DO CENSO - PARANÁ")
    print("=" * 60)
    print()

    # 1. Carregar dados brutos
    print("Carregando dados...")
    df_pop = load_population_data()
    municipios_dict = load_municipalities()

    if df_pop.empty:
        print("ERRO: Não há dados para processar")
        return

    # 2. Processar população por município
    print("Processando população por município...")
    municipios = process_population_by_municipality(df_pop)
    print(f"  {len(municipios)} municípios processados")

    # 3. Calcular variações
    print("Calculando variações...")
    municipios = calculate_variations(municipios)

    # 4. Gerar agregações
    print("Gerando agregações...")
    agregacoes = generate_aggregations(municipios)

    # 5. Processar pirâmide etária
    print("Processando pirâmide etária...")
    piramide = process_piramide(DATA_DIR / "piramide_2022.json")
    print(f"  {len(piramide)} municípios com pirâmide")

    # 6. Determinar anos disponíveis
    anos = set()
    for mun in municipios:
        for d in mun.get("dados", []):
            anos.add(d.get("ano"))
    anos_list = sorted(anos)

    # 7. Montar output final
    output = {
        "metadata": {
            "fonte": "IBGE - Censos Demográficos via API SIDRA",
            "anos_censos": anos_list,
            "total_municipios": len(municipios),
            "data_processamento": pd.Timestamp.now().isoformat(),
        },
        "municipios": municipios,
        "agregacoes": agregacoes,
    }

    # 8. Salvar JSONs
    print()
    print("Salvando arquivos...")

    # Dados agregados (principal)
    with open(OUTPUT_DIR / "aggregated.json", "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False)
    print(f"  Salvo: aggregated.json")

    # Dados detalhados (pirâmide)
    detailed = {
        "piramide": {"2022": piramide} if piramide else {},
    }
    with open(OUTPUT_DIR / "detailed.json", "w", encoding="utf-8") as f:
        json.dump(detailed, f, ensure_ascii=False)
    print(f"  Salvo: detailed.json")

    # Dados do mapa (otimizado)
    map_data = [
        {
            "codigo": m.get("codigo"),
            "nome": m.get("nome"),
            "variacao": m.get("variacao_total", 0),
            "classificacao": m.get("classificacao", ""),
            "pop_inicial": m.get("pop_inicial", 0),
            "pop_final": m.get("pop_final", 0),
        }
        for m in municipios
    ]
    with open(OUTPUT_DIR / "map_data.json", "w", encoding="utf-8") as f:
        json.dump(map_data, f, ensure_ascii=False)
    print(f"  Salvo: map_data.json")

    print()
    print("=" * 60)
    print("Preprocessamento concluído!")
    print(f"Arquivos gerados em: {OUTPUT_DIR}")
    print("=" * 60)

    # Resumo
    print()
    print("RESUMO:")
    print(f"  - Municípios: {len(municipios)}")
    print(f"  - Anos: {anos_list}")
    print(f"  - Municípios com evasão: {agregacoes['contagens']['municipios_evasao']}")
    print(f"  - Municípios com crescimento: {agregacoes['contagens']['municipios_crescimento']}")


if __name__ == "__main__":
    main()
