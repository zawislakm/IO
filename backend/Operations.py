from typing import List

import pandas as pd
import pandas.core.series
from sympy import sympify

import os
import pm4py
from sklearn.cluster import DBSCAN
import matplotlib.pyplot as plt

from Models import CSVColumn, EventLog, VariableModel, DependencyModel


def get_variables_names(path: str) -> List[CSVColumn]:
    df = pd.read_csv(path, sep=";")
    return [CSVColumn(name=name, column_index=i) for i, name in enumerate(df.columns)]


def change_variables_name(path: str, columns: List[CSVColumn]):
    df = pd.read_csv(path, sep=";")
    for change in columns:
        df.rename(columns={df.columns[change.column_index]: change.name}, inplace=True)

    df.to_csv(path, sep=";", index=False)


def apply_rule(rules: List[DependencyModel], row: pandas.core.series.Series) -> bool:
    for rule in rules:
        value1 = row.get(rule.firstVariableName, rule.firstVariableName)
        value2 = row.get(rule.secondVariableName, rule.secondVariableName)

        expression = f'{value1} {rule.get_dependency()} {value2}'
        if not bool(sympify(expression)):
            return False

    return True


def add_new_variable(path: str, variable: VariableModel):
    df = pd.read_csv(path, sep=";")

    df[variable.variableName] = variable.defaultValue

    for variable_rule in variable.SingleValueVariableList:
        for index, row in df.iterrows():
            if not apply_rule(variable_rule.dependencyList, row):
                continue
            df.loc[index, variable.variableName] = variable_rule.variableValue

    df.to_csv(path, sep=";", index=False)


def calc_cluster_stats(path: str, event_log: EventLog):
    df= pd.read_csv(path, sep=";")
    df = df.dropna()

    for col in df.columns:
        if df[col].dtype != 'object':
            continue
        df[col] = df[col].str.replace(',', '.')

    feature = df.iloc[:, event_log.cluster:event_log.cluster+1]

    dbscan = DBSCAN(eps=0.5, min_samples=5)
    dbscan.fit(feature)

    df['Cluster'] = dbscan.labels_

    class_1 = df[df.columns[event_log.cluster]]
    class_2 = df[df.columns[event_log.action]]

    plt.scatter(class_1, class_2, c=df['Cluster'], cmap='viridis')
    plt.xlabel('Clusters')
    plt.ylabel('Activity')
    plt.title('DBSCAN Clustering')
    path_c = "clustering/" + os.path.basename(path)[:-4] + '.jpg'
    plt.savefig(path_c)


def visualize_process(path: str, event_log: EventLog):
    df = pd.read_csv(path, sep=";")
    df = df.dropna()

    df = pm4py.format_dataframe(df, case_id=df.columns[event_log.case_ID],
                                       activity_key=df.columns[event_log.action],
                                       timestamp_key=df.columns[event_log.timestamp])

    e_log = pm4py.convert_to_event_log(df)
    path_xes = "xes files/" + os.path.basename(path)[:-4]
    pm4py.write_xes(e_log, path_xes)

    path_svg = "images/" + os.path.basename(path)[:-4] + ".svg"
    dfg, start_activities, end_activities = pm4py.discover_dfg(e_log)
    pm4py.save_vis_dfg(dfg, start_activities, end_activities,path_svg)


if __name__ == "__main__":
    path = 'uploaded_files/test.csv'
    columns_info = [CSVColumn(column_index=0, name="New_Column_Name_1"),
                    CSVColumn(column_index=2, name="New_Column_Name_2")]

    change_variables_name(path, columns_info)
