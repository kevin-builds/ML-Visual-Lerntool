from flask import Flask, jsonify, render_template, request

import data
import model
import serialization

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 2 * 1024 * 1024


def load_example(name):
    if name not in data.example_names():
        name = data.DEFAULT_EXAMPLE

    table = data.read_example(name)
    x, y, error = data.validate(table)
    if error:
        return None, None, None, error

    return x, y, data.axis_labels(table), None


def points_from(settings):
    given = settings.get("points")
    if not isinstance(given, dict):
        x, y, labels, error = load_example(settings.get("name"))
        return x, y, error

    return data.from_points(given.get("x", []), given.get("y", []))


def as_dataset(x, y, labels):
    return {
        "x": x.tolist(),
        "y": y.tolist(),
        "x_label": labels[0],
        "y_label": labels[1],
    }


@app.after_request
def disable_cache(response):
    response.headers["Cache-Control"] = "no-store"
    return response


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/examples")
def api_examples():
    return jsonify({"names": data.example_names()})


@app.route("/api/data")
def api_data():
    x, y, labels, error = load_example(request.args.get("name"))
    if error:
        return jsonify({"error": error}), 400
    return jsonify(as_dataset(x, y, labels))


@app.route("/api/upload", methods=["POST"])
def api_upload():
    uploaded = request.files.get("file")
    if uploaded is None:
        return jsonify({"error": "Keine Datei empfangen."}), 400

    table, error = data.read_upload(uploaded.stream)
    if error:
        return jsonify({"error": error}), 400

    x, y, error = data.validate(table)
    if error:
        return jsonify({"error": error}), 400

    return jsonify(as_dataset(x, y, data.axis_labels(table)))


@app.route("/api/train", methods=["POST"])
def api_train():
    settings = request.get_json(silent=True) or {}

    x, y, error = points_from(settings)
    if error:
        return jsonify({"error": error}), 400

    try:
        x_train, y_train, x_test, y_test = data.split_data(
            x, y,
            float(settings.get("training_share", 1.0)),
            int(settings.get("seed", 0)))
    except ValueError as problem:
        return jsonify({"error": str(problem)}), 400

    history = model.train(
        x_train, y_train,
        float(settings.get("learning_rate", model.DEFAULT_LEARNING_RATE)),
        int(settings.get("iterations", model.DEFAULT_ITERATIONS)),
        float(settings.get("beta0", 0.0)),
        float(settings.get("beta1", 0.0)))

    ols_beta0, ols_beta1 = model.ols.solve(x_train, y_train)
    x_scaled, y_scaled, stats = model.scaling.standardize(x_train, y_train)
    scaled0, scaled1 = model.scaling.to_scaled_params(
        ols_beta0, ols_beta1, stats)

    return jsonify({
        "history": serialization.history(history),
        "status": model.status(history),
        "ols": serialization.solution(ols_beta0, ols_beta1, scaled0, scaled1),
        "training": serialization.points(x_train, y_train),
        "test": serialization.points(x_test, y_test),
        "scaled": {
            "path": serialization.path(history, stats,
                                       model.scaling.to_scaled_params),
            "points": serialization.points(x_scaled, y_scaled),
        },
    })


if __name__ == "__main__":
    app.run(debug=True, port=8000)
