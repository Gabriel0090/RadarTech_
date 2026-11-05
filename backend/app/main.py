from fastapi import FastAPI

app = FastAPI(title="Radar Tech API")


@app.get("/health")
async def health_check():
    return {"status": "ok"}