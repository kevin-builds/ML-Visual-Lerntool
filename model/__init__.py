from model import gradient_descent, linear_regression, ols, scaling
from model.gradient_descent import status

DEFAULT_LEARNING_RATE = 0.1
DEFAULT_ITERATIONS = gradient_descent.SAFETY_LIMIT

__all__ = [
    "train", "status", "ols", "scaling",
    "DEFAULT_LEARNING_RATE", "DEFAULT_ITERATIONS",
]


def train(x, y,
          learning_rate=DEFAULT_LEARNING_RATE,
          iterations=DEFAULT_ITERATIONS,
          beta0=0.0,
          beta1=0.0):
    x_scaled, y_scaled, stats = scaling.standardize(x, y)
    start0, start1 = scaling.to_scaled_params(beta0, beta1, stats)
    history = gradient_descent.gradient_descent_history(
        x_scaled, y_scaled, learning_rate, iterations, start0, start1)
    return scaling.history_to_original(history, stats, x, y, linear_regression.mse)
