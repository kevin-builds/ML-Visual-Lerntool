import numpy as np
import pandas as pd

MIN_POINTS = 2


def prepare_data(table):
    x = table.iloc[:, 0].to_numpy(dtype=float)
    y = table.iloc[:, 1].to_numpy(dtype=float)
    return x, y


def validate(table):
    if table is None or table.shape[1] < 2:
        return None, None, "Die Tabelle braucht zwei Spalten."

    clean = table.iloc[:, :2].apply(pd.to_numeric, errors="coerce").dropna()

    if len(clean) < MIN_POINTS:
        return None, None, "Mindestens {} gültige Datenpunkte nötig, gefunden: {}.".format(
            MIN_POINTS, len(clean))

    x, y = prepare_data(clean)

    if x.min() == x.max():
        return None, None, "Alle x-Werte sind identisch."
    if y.min() == y.max():
        return None, None, "Alle y-Werte sind identisch."

    return x, y, None


def axis_labels(table):
    if table is None or table.shape[1] < 2:
        return "x", "y"

    labels = []
    for index, name in enumerate(table.columns[:2]):
        text = str(name).strip()
        missing = (not text
                   or text.startswith("Unnamed")
                   or text.replace(".", "", 1).lstrip("-").isdigit())
        labels.append(("x" if index == 0 else "y") if missing else text)
    return labels[0], labels[1]


def split(count, test_fraction=0.25, seed=0):
    test_count = int(round(count * test_fraction))
    test_count = max(1, min(test_count, count - MIN_POINTS))

    if count - test_count < MIN_POINTS:
        raise ValueError("Zu wenige Datenpunkte für eine Aufteilung.")

    chosen = np.random.default_rng(seed).choice(count, size=test_count, replace=False)
    mask = np.zeros(count, dtype=bool)
    mask[chosen] = True
    return mask


def split_data(x, y, training_share=1.0, seed=0):
    if training_share >= 1.0:
        return x, y, x[:0], y[:0]

    mask = split(len(x), 1.0 - training_share, seed)
    return x[~mask], y[~mask], x[mask], y[mask]


def from_points(x_values, y_values):
    x = np.asarray(x_values, dtype=float)
    y = np.asarray(y_values, dtype=float)

    if len(x) != len(y) or len(x) < MIN_POINTS:
        return None, None, "Mindestens {} Datenpunkte nötig.".format(MIN_POINTS)
    if x.min() == x.max():
        return None, None, "Alle x-Werte sind identisch."
    if y.min() == y.max():
        return None, None, "Alle y-Werte sind identisch."

    return x, y, None
