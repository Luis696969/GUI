from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# IMPORTANTE: Esto permite que tu HTML hable con el servidor
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/run-simulation")
async def receive_data(data: dict):
    print("¡JSON recibido desde la web!")
    print(data)
    return {"message": "Simulación iniciada con éxito", "recibido": data}