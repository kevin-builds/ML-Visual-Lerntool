import math


def number(value):
    converted = float(value)
    if not math.isfinite(converted):
        return None
    return converted


def points(x, y):
    return {"x": x.tolist(), "y": y.tolist()}


def history(entries):
    converted = []
    for state in entries:
        converted.append({
            "iteration": int(state["iteration"]),
            "beta0": number(state["beta0"]),
            "beta1": number(state["beta1"]),
            "mse": number(state["mse"]),
            "grad0": number(state["grad0"]),
            "grad1": number(state["grad1"]),
        })
    return converted


def path(entries, stats, to_scaled):
    scaled = {"beta0": [], "beta1": []}
    for state in entries:
        beta0, beta1 = to_scaled(state["beta0"], state["beta1"], stats)
        scaled["beta0"].append(number(beta0))
        scaled["beta1"].append(number(beta1))
    return scaled


def solution(beta0, beta1, scaled0, scaled1):
    return {
        "beta0": number(beta0),
        "beta1": number(beta1),
        "scaled0": number(scaled0),
        "scaled1": number(scaled1),
    }
