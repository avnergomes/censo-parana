#!/usr/bin/env python3
"""
Download de dados do Censo IBGE via API SIDRA
Tabelas: 202 (população rural/urbana), 4714 (censo 2022), 9514 (pirâmide etária)
"""

import requests
import pandas as pd
import json
import time
from pathlib import Path

# Configurações
BASE_URL = "https://apisidra.ibge.gov.br/values"
DATA_DIR = Path(__file__).parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)

# Código do Paraná
PR_CODE = "41"


def fetch_sidra(url: str, description: str = "") -> list:
    """
    Busca dados da API SIDRA

    Args:
        url: URL completa da API
        description: Descrição para logging

    Returns:
        Lista de dicts com os dados
    """
    print(f"Baixando: {description}")
    print(f"  URL: {url}")

    try:
        response = requests.get(url, timeout=300)
        response.raise_for_status()
        content_type = response.headers.get('Content-Type', '')
        if 'html' in content_type.lower():
            print(f"  ERRO: API retornou HTML em vez de JSON (Content-Type: {content_type})")
            return []

        data = response.json()

        if not data or len(data) <= 1:
            print(f"  AVISO: Resposta vazia ou apenas cabeçalho")
            return []

        # Primeira linha é o cabeçalho
        headers = data[0]
        rows = data[1:]

        print(f"  OK: {len(rows)} registros")
        return rows

    except requests.exceptions.RequestException as e:
        print(f"  ERRO: {e}")
        return []


def get_pr_municipalities():
    """
    Obtém lista de municípios do PR via API de localidades IBGE
    """
    url = "https://servicodados.ibge.gov.br/api/v1/localidades/estados/41/municipios"

    print("Baixando: Lista de municípios do PR")

    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()

        municipios = response.json()

        # Salvar como JSON
        with open(DATA_DIR / "municipios_pr.json", "w", encoding="utf-8") as f:
            json.dump(municipios, f, ensure_ascii=False, indent=2)

        print(f"  OK: {len(municipios)} municípios")

        # Extrair códigos
        codigos = [str(m["id"]) for m in municipios]
        return codigos

    except requests.exceptions.RequestException as e:
        print(f"  ERRO: {e}")
        return []


def download_censo_2010_rural_urbana(municipios_codes: list):
    """
    Tabela 202 - População residente por sexo e situação do domicílio
    Censo 2010 - dados por município
    """
    # Baixar em lotes de 50 municípios para evitar timeout
    all_data = []
    batch_size = 50

    for i in range(0, len(municipios_codes), batch_size):
        batch = municipios_codes[i:i + batch_size]
        codes = ",".join(batch)

        # Tabela 202: população por sexo e situação do domicílio
        # v/93 = população residente
        # c1 = situação (0=total, 1=urbana, 2=rural)
        # c2/0 = sexo total (para simplificar)
        url = f"{BASE_URL}/t/202/n6/{codes}/v/93/p/2010/c1/0,1,2/c2/0"

        data = fetch_sidra(url, f"Censo 2010 - Lote {i // batch_size + 1}")
        all_data.extend(data)
        time.sleep(1)  # Respeitar rate limit

    return all_data


def download_censo_2000_rural_urbana(municipios_codes: list):
    """
    Tabela 202 - População residente por sexo e situação do domicílio
    Censo 2000 - dados por município
    """
    all_data = []
    batch_size = 50

    for i in range(0, len(municipios_codes), batch_size):
        batch = municipios_codes[i:i + batch_size]
        codes = ",".join(batch)

        url = f"{BASE_URL}/t/202/n6/{codes}/v/93/p/2000/c1/0,1,2/c2/0"

        data = fetch_sidra(url, f"Censo 2000 - Lote {i // batch_size + 1}")
        all_data.extend(data)
        time.sleep(1)

    return all_data


def download_censo_1991_rural_urbana(municipios_codes: list):
    """
    Tabela 202 - População residente por sexo e situação do domicílio
    Censo 1991 - dados por município
    """
    all_data = []
    batch_size = 50

    for i in range(0, len(municipios_codes), batch_size):
        batch = municipios_codes[i:i + batch_size]
        codes = ",".join(batch)

        url = f"{BASE_URL}/t/202/n6/{codes}/v/93/p/1991/c1/0,1,2/c2/0"

        data = fetch_sidra(url, f"Censo 1991 - Lote {i // batch_size + 1}")
        all_data.extend(data)
        time.sleep(1)

    return all_data


def download_censo_2022_rural_urbana(municipios_codes: list):
    """
    Tabela 9923 - População residente por situação do domicílio
    Censo 2022 - dados por município com rural/urbano
    """
    all_data = []
    batch_size = 50

    for i in range(0, len(municipios_codes), batch_size):
        batch = municipios_codes[i:i + batch_size]
        codes = ",".join(batch)

        # Tabela 9923: população por situação do domicílio (rural/urbana) 2022
        # c1 = situação (0=total, 1=urbana, 2=rural)
        url = f"{BASE_URL}/t/9923/n6/{codes}/v/93/p/2022/c1/0,1,2"

        data = fetch_sidra(url, f"Censo 2022 Rural/Urbana - Lote {i // batch_size + 1}")
        all_data.extend(data)
        time.sleep(1)

    return all_data


def download_piramide_etaria_2022(municipios_codes: list):
    """
    Tabela 9514 - População por sexo e grupo de idade
    Censo 2022 - dados por município
    """
    all_data = []
    batch_size = 20  # Menor lote porque tem mais dados

    # Faixas etárias principais
    faixas = "93070,93084,93085,93086,93087,93088,93089,93090,93091,93092,93093,93094,93095,93096,93097,93098,93099,93100"

    for i in range(0, len(municipios_codes), batch_size):
        batch = municipios_codes[i:i + batch_size]
        codes = ",".join(batch)

        # c2 = sexo (4=homens, 5=mulheres)
        # c287 = faixas etárias
        url = f"{BASE_URL}/t/9514/n6/{codes}/v/93/p/2022/c2/4,5/c287/{faixas}"

        data = fetch_sidra(url, f"Pirâmide 2022 - Lote {i // batch_size + 1}")
        all_data.extend(data)
        time.sleep(2)  # Mais tempo entre requests

    return all_data


def process_rural_urbana(data_list: list, ano: int) -> pd.DataFrame:
    """
    Processa dados de população rural/urbana
    """
    if not data_list:
        return pd.DataFrame()

    records = []
    for row in data_list:
        try:
            cod_mun = row.get("D1C", "")
            nome_mun = row.get("D1N", "")
            situacao = row.get("D4N", "")
            valor = row.get("V", "0")

            # Ignorar valores não numéricos
            if valor == "-" or valor == "...":
                valor = 0
            else:
                valor = int(float(valor))

            records.append({
                "cod_municipio": cod_mun,
                "municipio": nome_mun,
                "ano": ano,
                "situacao": situacao,
                "populacao": valor,
            })
        except (ValueError, TypeError):
            continue

    return pd.DataFrame(records)


def process_censo_2022(data_list: list) -> pd.DataFrame:
    """
    Processa dados do censo 2022 com rural/urbano
    """
    if not data_list:
        return pd.DataFrame()

    records = []
    for row in data_list:
        try:
            cod_mun = row.get("D1C", "")
            nome_mun = row.get("D1N", "")
            situacao_cod = row.get("D4C", "")
            situacao = row.get("D4N", "")
            valor = row.get("V", "0")

            # Mapear código para situação
            if situacao_cod == "0" or situacao == "":
                situacao = "Total"
            elif situacao_cod == "1":
                situacao = "Urbana"
            elif situacao_cod == "2":
                situacao = "Rural"

            if valor == "-" or valor == "..." or valor == "":
                valor = 0
            else:
                valor = int(float(valor))

            records.append({
                "cod_municipio": cod_mun,
                "municipio": nome_mun,
                "ano": 2022,
                "situacao": situacao,
                "populacao": valor,
            })
        except (ValueError, TypeError):
            continue

    return pd.DataFrame(records)


def download_all():
    """
    Executa todos os downloads
    """
    print("=" * 60)
    print("DOWNLOAD DE DADOS DO CENSO IBGE - PARANÁ")
    print("=" * 60)
    print()

    # 1. Lista de municípios
    municipios_codes = get_pr_municipalities()
    if not municipios_codes:
        print("ERRO: Não foi possível obter lista de municípios")
        return
    print()

    # 2. Censo 1991
    print("-" * 40)
    data_1991 = download_censo_1991_rural_urbana(municipios_codes)
    df_1991 = process_rural_urbana(data_1991, 1991)
    print()

    # 3. Censo 2000
    print("-" * 40)
    data_2000 = download_censo_2000_rural_urbana(municipios_codes)
    df_2000 = process_rural_urbana(data_2000, 2000)
    print()

    # 4. Censo 2010
    print("-" * 40)
    data_2010 = download_censo_2010_rural_urbana(municipios_codes)
    df_2010 = process_rural_urbana(data_2010, 2010)
    print()

    # 5. Censo 2022 (com rural/urbano - tabela 9923)
    print("-" * 40)
    data_2022 = download_censo_2022_rural_urbana(municipios_codes)
    df_2022 = process_censo_2022(data_2022)
    print()

    # 6. Combinar todos os dados
    all_dfs = [df for df in [df_1991, df_2000, df_2010, df_2022] if not df.empty]

    if all_dfs:
        df_combined = pd.concat(all_dfs, ignore_index=True)
        df_combined.to_csv(DATA_DIR / "populacao_censos.csv", index=False)
        print(f"Salvo: populacao_censos.csv ({len(df_combined)} registros)")
    else:
        print("AVISO: Nenhum dado de população foi baixado")

    # 7. Pirâmide etária (todos os municípios)
    print("-" * 40)
    print("Baixando pirâmide etária 2022 (todos os municípios, pode demorar)...")
    data_piramide = download_piramide_etaria_2022(municipios_codes)  # Todos os municípios

    if data_piramide:
        with open(DATA_DIR / "piramide_2022.json", "w", encoding="utf-8") as f:
            json.dump(data_piramide, f, ensure_ascii=False)
        print(f"Salvo: piramide_2022.json ({len(data_piramide)} registros)")

    print()
    print("=" * 60)
    print("Download concluído!")
    print(f"Arquivos salvos em: {DATA_DIR}")
    print("=" * 60)


if __name__ == "__main__":
    download_all()
