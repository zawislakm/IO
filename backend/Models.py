from typing import List

from pydantic import BaseModel


class EventLog(BaseModel):
    case_ID: int
    timestamp: int
    action: int
    cluster: int


class CSVColumn(BaseModel):
    column_index: int
    name: str


class DependencyModel(BaseModel):
    firstVariableName: str
    secondVariableName: str
    dependency: str


class SingleValueVariableModel(BaseModel):
    dependencyList: List[DependencyModel]
    variableValue: str


class VariableModel(BaseModel):
    SingleValueVariableList: List[SingleValueVariableModel]
    defaultValue: str
    variableName: str
