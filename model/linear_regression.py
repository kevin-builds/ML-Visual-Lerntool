import numpy as np


def predict(beta0, beta1, x):
    return beta0 + beta1 * x


def residuals(x, y, beta0, beta1):
    return y - predict(beta0, beta1, x)


def mse(x, y, beta0, beta1):
    return float(np.mean(residuals(x, y, beta0, beta1) ** 2))
