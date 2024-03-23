import shutil
from typing import List

import uvicorn
from fastapi import File, UploadFile, FastAPI, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

import Operations as o
from Models import CSVColumn, VariableModel, EventLog

app = FastAPI()
# Ustawienie polityki CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Możesz również ustawić konkretną domenę, z której będzie akceptowane żądanie
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)


@app.post('/upload', status_code=status.HTTP_201_CREATED)
def upload_file(uploaded_file: UploadFile = File(...)) -> dict:
    with open(f"uploaded_files/{uploaded_file.filename}", 'w+b') as file:
        shutil.copyfileobj(uploaded_file.file, file)

    return {
        'file': uploaded_file.filename,
        'content': uploaded_file.content_type,
    }


@app.get("/download/{file_path}", status_code=status.HTTP_200_OK)
def send_file(file_path: str) -> FileResponse:
    try:
        return FileResponse(f'uploaded_files/{file_path}')
    except FileNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")


@app.get("/variable/{file_path}", status_code=status.HTTP_200_OK)
def get_variables_name(file_path: str) -> List[CSVColumn]:
    try:
        return o.get_variables_names(path=f'uploaded_files/{file_path}')
    except FileNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")


@app.post("/variable/{file_path}", status_code=status.HTTP_200_OK)
def change_variables_name(file_path: str, columns: List[CSVColumn]):
    try:
        return o.change_variables_name(path=f'uploaded_files/{file_path}', columns=columns)
    except FileNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")


@app.post("/new/variables/{file_path}")
async def add_new_variables(file_path: str, variable: VariableModel):
    # Tutaj możesz wykonać operacje na otrzymanych danych, np. zapis do bazy danych
    print(variable, file_path)
    return {"variable": variable}


@app.get('/variable/compare/{file_path}')
async def compare_variables(file_path: str, event_log: EventLog):
    o.calc_cluster_stats(file_path, event_log)


@app.get('/variable/visualize/{file_path}')
async def visualize_process(file_path: str, event_log: EventLog):
    o.visualize_process(file_path, event_log)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
