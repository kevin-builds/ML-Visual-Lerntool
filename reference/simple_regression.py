from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

# ------------------------------------------------------------ params

CSV_PATH = Path(__file__).parent.parent / "data" / "living_area_price.csv"


# ------------------------------------------------------------ methods

def read_data(path):
    return pd.read_csv(path)

def prepare_data(table):
    x = table.iloc[:, 0].to_numpy(dtype=float)
    y = table.iloc[:, 1].to_numpy(dtype=float)
    return x, y


def predict(beta0, beta1, x):
    return beta0 + beta1 * x


def residuals(x, y, beta0, beta1):
    return y - predict(beta0, beta1, x)


def mse(x, y, beta0, beta1):
    return float(np.mean(residuals(x, y, beta0, beta1) ** 2))


def ols(x, y):
    x_mean, y_mean = x.mean(), y.mean()
    beta1 = np.sum((x - x_mean) * (y - y_mean)) / np.sum((x - x_mean) ** 2)
    beta0 = y_mean - beta1 * x_mean
    return beta0, beta1


def standardize(x, y):
    x_mean, x_std = x.mean(), x.std()
    y_mean, y_std = y.mean(), y.std()
    x_scaled = (x - x_mean) / x_std
    y_scaled = (y - y_mean) / y_std
    return x_scaled, y_scaled, (x_mean, x_std, y_mean, y_std)


def to_original_params(beta0_scaled, beta1_scaled, stats):
    x_mean, x_std, y_mean, y_std = stats
    beta1 = beta1_scaled * y_std / x_std
    beta0 = y_mean + y_std * beta0_scaled - beta1 * x_mean
    return beta0, beta1


def gradient(x, y, beta0, beta1):
    n = len(x)
    error = residuals(x, y, beta0, beta1)
    grad0 = -2.0 / n * error.sum()
    grad1 = -2.0 / n * (x * error).sum()
    return grad0, grad1


def gradient_descent(x, y, learning_rate, iterations, beta0=0.0, beta1=0.0):
    for _ in range(iterations):
        grad0, grad1 = gradient(x, y, beta0, beta1)
        beta0 -= learning_rate * grad0
        beta1 -= learning_rate * grad1
    return beta0, beta1


def plot_data(x, y, x_label="x", y_label="y", beta0=None, beta1=None):
    fig, ax = plt.subplots(figsize=(7, 5))
    ax.scatter(x, y)

    if beta0 is not None and beta1 is not None:
        line_x = [x.min(), x.max()]
        line_y = [predict(beta0, beta1, v) for v in line_x]
        ax.plot(line_x, line_y)

    ax.set_xlabel(x_label)
    ax.set_ylabel(y_label)
    ax.grid(True)
    return fig


# ------------------------------------------------------------ main

if __name__ == "__main__":
    table = read_data(CSV_PATH)
    x, y = prepare_data(table)

    print("Datei  :", CSV_PATH.name)
    print("Zeilen :", len(table))
    print("Spalten:", list(table.columns))
    print()
    print(table)
    print()
    print("x:", x)
    print("y:", y)

    print()
    for b0, b1 in [(150, 10), (400, 5), (0, 12), (159.55, 9.8)]:
        print("beta0={:7.2f}  beta1={:5.2f}  MSE={:12.1f}".format(
            b0, b1, mse(x, y, b0, b1)))

    print()
    print("Gradientenabstieg mit Rohdaten, 300 Iterationen:")
    for lernrate in [0.00005, 0.0001, 0.0002, 0.0003]:
        b0, b1 = gradient_descent(x, y, lernrate, 300)
        print("alpha={:<9} beta0={:12.2f}  beta1={:9.4f}  MSE={:14.1f}".format(
            lernrate, b0, b1, mse(x, y, b0, b1)))
    print("zum Vergleich das Optimum:  beta0=159.55  beta1=9.7994  MSE=2749.2")

    print()
    print("Mit Standardisierung, 300 Iterationen:")
    x_scaled, y_scaled, stats = standardize(x, y)
    for lernrate in [0.01, 0.1, 0.5, 0.9, 1.1]:
        s0, s1 = gradient_descent(x_scaled, y_scaled, lernrate, 300)
        b0, b1 = to_original_params(s0, s1, stats)
        print("alpha={:<6} beta0={:12.2f}  beta1={:9.4f}  MSE={:14.1f}".format(
            lernrate, b0, b1, mse(x, y, b0, b1)))

    print()
    o0, o1 = ols(x, y)
    print("Kleinste Quadrate (direkt, ohne Iteration):")
    print("             beta0={:12.2f}  beta1={:9.4f}  MSE={:14.1f}".format(
        o0, o1, mse(x, y, o0, o1)))

    fig = plot_data(x, y, table.columns[0], table.columns[1], beta0=150, beta1=10)
    plt.show()
