def standardize(x, y):
    x_mean, x_std = x.mean(), x.std()
    y_mean, y_std = y.mean(), y.std()
    x_scaled = (x - x_mean) / x_std
    y_scaled = (y - y_mean) / y_std
    return x_scaled, y_scaled, (x_mean, x_std, y_mean, y_std)


def to_scaled_params(beta0, beta1, stats):
    x_mean, x_std, y_mean, y_std = stats
    beta1_scaled = beta1 * x_std / y_std
    beta0_scaled = (beta0 + beta1 * x_mean - y_mean) / y_std
    return beta0_scaled, beta1_scaled


def to_original_params(beta0_scaled, beta1_scaled, stats):
    x_mean, x_std, y_mean, y_std = stats
    beta1 = beta1_scaled * y_std / x_std
    beta0 = y_mean + y_std * beta0_scaled - beta1 * x_mean
    return beta0, beta1


def history_to_original(history, stats, x, y, mse):
    converted = []
    for state in history:
        beta0, beta1 = to_original_params(state["beta0"], state["beta1"], stats)
        converted.append({
            "iteration": state["iteration"],
            "beta0": beta0,
            "beta1": beta1,
            "mse": mse(x, y, beta0, beta1),
            "grad0": state["grad0"],
            "grad1": state["grad1"],
        })
    return converted
