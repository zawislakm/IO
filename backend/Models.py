from typing import List

from sympy import sympify
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
    secondVariableName: str | int
    dependency: str

    def get_dependency(self) -> str:
        if self.dependency == "=":
            return "=="
        return self.dependency





class SingleValueVariableModel(BaseModel):
    dependencyList: List[DependencyModel]
    variableValue: str


class VariableModel(BaseModel):
    SingleValueVariableList: List[SingleValueVariableModel]
    defaultValue: str
    variableName: str
