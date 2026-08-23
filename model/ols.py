import numpy as np


def solve(x, y):
    x_mean, y_mean = x.mean(), y.mean()
    beta1 = np.sum((x - x_mean) * (y - y_mean)) / np.sum((x - x_mean) ** 2)
    beta0 = y_mean - beta1 * x_mean
    return beta0, beta1
