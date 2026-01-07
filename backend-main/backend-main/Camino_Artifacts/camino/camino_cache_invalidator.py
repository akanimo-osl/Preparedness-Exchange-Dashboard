
# FastAPI or Django endpoint to clear Redis keys
import redis
from fastapi import FastAPI

app = FastAPI()
r = redis.Redis(host='localhost', port=6379, db=0)

@app.delete("/invalidate/{key}")
def invalidate_cache(key: str):
    r.delete(key)
    return {"status": "invalidated", "key": key}
