import csv
from typing import List

import pandas as pd

from Models import CSVColumn


def count_columns(file: str):
    with open(file, 'r', newline='') as file:
        reader = csv.reader(file, delimiter=";")
        # Przyjmujemy, że pierwszy wiersz zawiera nagłówki kolumn
        first_row = next(reader)
        return len(first_row)


def count_columns2(csv_file):
    with open(csv_file, 'r', newline='') as file:
        reader = csv.reader(file, delimiter=";")
        max_num_columns = 0
        for row in reader:
            print(row)
            max_num_columns = max(max_num_columns, len(row))
        return max_num_columns


def get_variables_names(path: str) -> List[CSVColumn]:
    df = pd.read_csv(path, sep=";")
    return [CSVColumn(name=name, column_index=i) for i, name in enumerate(df.columns)]


def change_variables_name(path: str, columns: List[CSVColumn]):
    df = pd.read_csv(path, sep=";")
    for change in columns:
        df.rename(columns={df.columns[change.column_index]: change.name}, inplace=True)

    df.to_csv(path, sep=";", index=False)


if __name__ == "__main__":
    path = 'uploaded_files/test.csv'
    columns_info = [CSVColumn(column_index=0, name="New_Column_Name_1"),
                    CSVColumn(column_index=2, name="New_Column_Name_2")]

    change_variables_name(path, columns_info)
