#!/usr/bin/env python3
"""Génère lib/mock/associations-source.ts à partir du classeur des associations Bapa.

Usage : python3 scripts/associations-from-xlsx.py chemin/vers/Associations_BAPA_par_pays_et_ville.xlsx
Lit la feuille « Données (filtrable) » (une ligne par association). Nécessite openpyxl.
"""
import json
import sys
import unicodedata
from pathlib import Path

import openpyxl

ZONES = {"Afrique": "AFRIQUE", "Europe": "EUROPE", "Amérique du Nord": "AMERIQUE_DU_NORD"}
OUT = Path(__file__).resolve().parent.parent / "lib" / "mock" / "associations-source.ts"


def clean(value):
    if value is None:
        return None
    text = unicodedata.normalize("NFC", str(value)).strip()
    return None if text in ("", "—") or "non précisée" in text.lower() else text


def main(path: str) -> None:
    sheet = openpyxl.load_workbook(path, data_only=True)["Données (filtrable)"]
    rows = []
    for zone, country, region, city, name, full_name, source, notes in sheet.iter_rows(min_row=2, values_only=True):
        if not name:
            continue
        rows.append([ZONES[zone], clean(country), clean(region), clean(city), clean(name), clean(full_name), clean(source), clean(notes)])

    lines = [
        "/* Fichier généré par scripts/associations-from-xlsx.py — ne pas modifier à la main.",
        f" * Source : {Path(path).name} ({len(rows)} associations). */",
        'import type { AssociationZone } from "../types"',
        "",
        "export type AssociationSourceRow = [",
        "  zone: AssociationZone,",
        "  country: string,",
        "  region: string | null,",
        "  city: string | null,",
        "  name: string,",
        "  fullName: string | null,",
        "  source: string,",
        "  notes: string | null,",
        "]",
        "",
        "export const associationRows: AssociationSourceRow[] = [",
    ]
    lines += [f"  {json.dumps(row, ensure_ascii=False)}," for row in rows]
    lines += ["]", ""]
    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"{len(rows)} associations écrites dans {OUT}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
