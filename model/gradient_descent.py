import numpy as np

from model.linear_regression import mse, residuals

TOLERANCE = 1e-9
SAFETY_LIMIT = 5000
DIVERGENCE_FACTOR = 1e3
PATIENCE = 10


def gradient(x, y, beta0, beta1):
    n = len(x)
    error = residuals(x, y, beta0, beta1)
    grad0 = -2.0 / n * error.sum()
    grad1 = -2.0 / n * (x * error).sum()
    return grad0, grad1


def settled(previous, current, tolerance, reference):
    if previous is None:
        return False
    return abs(previous - current) < tolerance * reference


def diverging(first, current):
    return not np.isfinite(current) or current > first * DIVERGENCE_FACTOR


def gradient_descent(x, y, learning_rate, iterations=SAFETY_LIMIT,
                     beta0=0.0, beta1=0.0, tolerance=TOLERANCE):
    previous = None
    stable = 0
    first = mse(x, y, beta0, beta1) or 1.0

    for _ in range(iterations):
        current = mse(x, y, beta0, beta1)
        stable = stable + 1 if settled(previous, current,
                                       tolerance, first) else 0
        if stable >= PATIENCE or diverging(first, current):
            break

        previous = current
        grad0, grad1 = gradient(x, y, beta0, beta1)
        beta0 -= learning_rate * grad0
        beta1 -= learning_rate * grad1

    return beta0, beta1


def gradient_descent_history(x, y, learning_rate, iterations=SAFETY_LIMIT,
                             beta0=0.0, beta1=0.0, tolerance=TOLERANCE):
    history = []
    previous = None
    stable = 0
    first = mse(x, y, beta0, beta1) or 1.0

    for i in range(iterations + 1):
        grad0, grad1 = gradient(x, y, beta0, beta1)
        current = mse(x, y, beta0, beta1)
        history.append({
            "iteration": i,
            "beta0": beta0,
            "beta1": beta1,
            "mse": current,
            "grad0": grad0,
            "grad1": grad1,
        })

        stable = stable + 1 if settled(previous, current,
                                       tolerance, first) else 0
        if stable >= PATIENCE or diverging(first, current):
            break

        previous = current
        beta0 -= learning_rate * grad0
        beta1 -= learning_rate * grad1

    return history


def moved(history):
    start = history[0]
    for state in history[1:]:
        if (state["beta0"] != start["beta0"]
                or state["beta1"] != start["beta1"]):
            return True
    return False


def status(history, tolerance=TOLERANCE):
    first = history[0]["mse"]
    last = history[-1]["mse"]

    if not np.isfinite(last) or (last >= first and moved(history)):
        return "divergiert"

    reference = first or 1.0
    recent = history[-(PATIENCE + 1):]
    if len(recent) > PATIENCE and all(
            settled(recent[i]["mse"], recent[i + 1]["mse"],
                    tolerance, reference)
            for i in range(len(recent) - 1)):
        return "konvergiert"
    return "Grenze erreicht"
