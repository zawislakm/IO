from typing import List

import pandas as pd

from Models import CSVColumn, EventLog


def get_variables_names(path: str) -> List[CSVColumn]:
    df = pd.read_csv(path, sep=";")
    return [CSVColumn(name=name, column_index=i) for i, name in enumerate(df.columns)]


def change_variables_name(path: str, columns: List[CSVColumn]):
    df = pd.read_csv(path, sep=";")
    for change in columns:
        df.rename(columns={df.columns[change.column_index]: change.name}, inplace=True)

    df.to_csv(path, sep=";", index=False)


def calc_cluster_stats(path: str, event_log: EventLog):
    # TODO stats connected with cluster na action
    pass


def visualize_process(path: str, event_log: EventLog):
    # TODO, process vizualiazation using PM4PY
    pass


if __name__ == "__main__":
    path = 'uploaded_files/test.csv'
    columns_info = [CSVColumn(column_index=0, name="New_Column_Name_1"),
                    CSVColumn(column_index=2, name="New_Column_Name_2")]

    change_variables_name(path, columns_info)
