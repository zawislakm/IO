import os
from typing import List

import matplotlib.pyplot as plt
import pandas as pd
import pandas.core.series
import pm4py
from sklearn.cluster import DBSCAN,KMeans
from sympy import sympify

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
    df = pd.read_csv(path, sep=";")
    df = df.dropna()

    for col in df.columns:
        if df[col].dtype != 'object':
            continue
        df[col] = df[col].str.replace(',', '.')

    feature = df.iloc[:, event_log.cluster:event_log.cluster + 1]

    kmeans = KMeans(n_clusters=3)
    kmeans.fit(feature)

    df['Cluster'] = kmeans.labels_

    cluster_counts = df.groupby('Cluster').size()
    total_samples = len(df)
    activity_percentages = {}
    for cluster, count in cluster_counts.items():
        cluster_data = df[df['Cluster'] == cluster]
        activity_counts = cluster_data.iloc[:, event_log.action].value_counts()
        activity_percentages[cluster] = activity_counts * 100 / count

    unique_activities = df.iloc[:, event_log.action].unique()
    num_activities = len(unique_activities)
    cluster_labels = sorted(activity_percentages.keys())
    cluster_activities = {cluster: {activity: 0 for activity in unique_activities} for cluster in cluster_labels}

    for cluster, percentages in activity_percentages.items():
        for activity, percentage in percentages.items():
            cluster_activities[cluster][activity] = percentage

    bar_width = 0.3
    fig, ax = plt.subplots(figsize=(10, 6))
    for i, (cluster, activities) in enumerate(cluster_activities.items()):
        positions = range(len(activities))
        bars = ax.bar([pos + i * bar_width for pos in positions], activities.values(), bar_width,
                      label=f'Cluster {cluster}')
        for bar in bars:
            height = bar.get_height()
            ax.annotate(f'{height:.2f}%', xy=(bar.get_x() + bar.get_width() / 2, height),
                        xytext=(0, 3), textcoords='offset points', ha='center', va='bottom')

    ax.set_xlabel('Activity')
    ax.set_ylabel('Percentage')
    ax.set_title('Activity Distribution Across Clusters')
    ax.set_xticks([pos + bar_width for pos in range(num_activities)])
    ax.set_xticklabels(unique_activities)
    ax.legend()
    plt.xticks(rotation=45)
    plt.tight_layout()
    path_c = "clustering/" + os.path.basename(path)[:-4] + '.jpg'
    plt.savefig(path_c)


def visualize_process(path: str, event_log: EventLog):
    df = pd.read_csv(path, sep=";")
    df = df.dropna()

    df = df[df[df.columns[event_log.action]] != df[df.columns[event_log.action]].shift()]
    df.reset_index(drop=True, inplace=True)

    df = pm4py.format_dataframe(df, case_id=df.columns[event_log.case_ID],
                                activity_key=df.columns[event_log.action],
                                timestamp_key=df.columns[event_log.timestamp])

    e_log = pm4py.convert_to_event_log(df)
    path_xes = "xes files/" + os.path.basename(path)[:-4]
    pm4py.write_xes(e_log, path_xes)

    path_dfg = "dfg/" + os.path.basename(path)[:-4] + ".png"
    dfg, start_activities, end_activities = pm4py.discover_dfg(e_log)
    pm4py.save_vis_dfg(dfg, start_activities, end_activities, path_dfg)

    process_tree = pm4py.discover_process_tree_inductive(e_log)
    petri_net , initial_marking , final_marking = pm4py. convert_to_petri_net(process_tree)
    path_petri = "petri_net/" + os.path.basename(path)[:-4] + ".png"
    pm4py.save_vis_petri_net(petri_net, initial_marking, final_marking, path_petri)

if __name__ == "__main__":
    path = 'uploaded_files/Zeszyt1_akt_pm.csv'
    event_log = EventLog(case_ID=9, timestamp=1, action=11, cluster=10)
    calc_cluster_stats(path, event_log)
    visualize_process(path, event_log)
