import io
from pathlib import Path

import pandas as pd

DATA_DIR = Path(__file__).parent

EXAMPLES = {
    "Wohnfläche und Preis": "living_area_price.csv",
    "Lernzeit und Punktzahl (mit Ausreißern)": "study_time_score.csv",
    "Temperatur und Eisverkauf": "temperature_ice_sales.csv",
    "Alter und Einkommen": "age_income.csv",
}

FORMATS = ({}, {"sep": ";", "decimal": ","}, {"sep": "\t"})
ENCODINGS = ("utf-8-sig", "cp1252")


def example_names():
    return list(EXAMPLES)


def read_example(name):
    if name not in EXAMPLES:
        raise KeyError("Unbekannter Datensatz: {}".format(name))
    return pd.read_csv(DATA_DIR / EXAMPLES[name])


def read_csv(source, **options):
    return pd.read_csv(source, **options)


def looks_numeric(name):
    try:
        float(str(name).strip().replace(",", "."))
    except ValueError:
        return False
    return True


def read_upload(stream):
    raw = stream.read()

    for encoding in ENCODINGS:
        try:
            text = raw.decode(encoding)
        except UnicodeDecodeError:
            continue

        for options in FORMATS:
            try:
                table = read_csv(io.StringIO(text), **options)
            except Exception:
                continue

            if table.shape[1] < 2:
                continue

            if all(looks_numeric(name) for name in table.columns[:2]):
                table = read_csv(io.StringIO(text), header=None, **options)

            return table, None

    return None, "Die Datei ließ sich nicht als CSV mit zwei Spalten lesen."
