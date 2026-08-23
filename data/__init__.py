from data.preparation import (MIN_POINTS, axis_labels, from_points,
                              prepare_data, split, split_data, validate)
from data.sources import (example_names, read_csv, read_example, read_upload)

DEFAULT_EXAMPLE = example_names()[0]

__all__ = [
    "example_names", "read_example", "read_csv", "read_upload",
    "prepare_data", "validate", "axis_labels", "split", "split_data",
    "from_points",
    "MIN_POINTS", "DEFAULT_EXAMPLE", "read_data",
]


def read_data(name=DEFAULT_EXAMPLE):
    return read_example(name)
