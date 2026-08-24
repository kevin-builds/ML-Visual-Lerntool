import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import data
import model

TRAINING_SHARE = 0.75
SEED = 0
LEARNING_RATE = 0.1


def compare(name):
    table = data.read_example(name)
    x, y, error = data.validate(table)
    if error:
        return None

    x_train, y_train, x_test, y_test = data.split_data(
        x, y, TRAINING_SHARE, SEED)

    history = model.train(x_train, y_train, LEARNING_RATE)
    final = history[-1]

    ols0, ols1 = model.ols.solve(x_train, y_train)

    return {
        "name": name,
        "points": len(x),
        "training": len(x_train),
        "iterations": final["iteration"],
        "status": model.status(history),
        "gradient": (final["beta0"], final["beta1"]),
        "ols": (ols0, ols1),
    }


def relative(a, b):
    return abs(a - b) / abs(b) if b != 0 else abs(a - b)


def main():
    print("Gradientenabstieg vs OLS")
    print("Lernrate {}, Aufteilung {:.0f} Prozent Training, Zufallszahl {}"
          .format(LEARNING_RATE, TRAINING_SHARE * 100, SEED))
    print()

    kopf = "{:<42} {:>4} {:>5} {:>13} {:>13} {:>11}"
    zeile = "{:<42} {:>4} {:>5} {:>13.4f} {:>13.4f} {:>11.1e}"
    print(kopf.format("Datensatz", "n", "Iteration", "Gradient b1", "OLS b1",
                      "Abw."))
    print("-" * 92)

    groesste = 0.0
    for name in data.example_names():
        result = compare(name)
        if result is None:
            continue

        abweichung = relative(result["gradient"][1], result["ols"][1])
        groesste = max(groesste, abweichung)

        print(zeile.format(result["name"][:42], result["points"],
                           result["iterations"], result["gradient"][1],
                           result["ols"][1], abweichung))

if __name__ == "__main__":
    main()
