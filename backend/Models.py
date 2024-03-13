from pydantic import BaseModel


class EventLog(BaseModel):
    case_ID: int
    timestamp: int
    action: int
    cluster: int


class CSVColumn(BaseModel):
    column_index: int
    name: str


