from fastapi import File, UploadFile, FastAPI
import uvicorn
app = FastAPI()

@app.post("/upload")
def upload(file: UploadFile = File(...)):
    try:
        contents = file.file.read()
        with open(file.filename, 'wb') as f:
            f.write(contents)
    except Exception:
        return {"message": "There was an error uploading the file"}
    finally:
        file.file.close()

    return {"message": f"Successfully uploaded {file.filename}"}



if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
