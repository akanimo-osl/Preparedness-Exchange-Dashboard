
import logging
import os
from typing import Dict

import redis
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

app = FastAPI()

# Structured JSON logging
logging.basicConfig(level=logging.INFO, format='{"ts":"%(asctime)s","lvl":"%(levelname)s","msg":"%(message)s"}')
log = logging.getLogger("camino.cache")

r = redis.Redis(
    host=os.getenv('REDIS_HOST', 'localhost'),
    port=int(os.getenv('REDIS_PORT', '6379')),
    db=int(os.getenv('REDIS_DB', '0')),
    socket_connect_timeout=2,
    socket_timeout=2,
)

class TransientRedisError(Exception):
    pass

@retry(
    retry=retry_if_exception_type(TransientRedisError),
    wait=wait_exponential(multiplier=0.5, min=0.5, max=4),
    stop=stop_after_attempt(5),
)
def _ping_redis() -> bool:
    try:
        return bool(r.ping())
    except Exception as e:
        log.warning(f"redis_ping_error: {e}")
        raise TransientRedisError()

@app.get("/health")
def health() -> Dict[str, str]:
    ok = _ping_redis()
    status = "ok" if ok else "degraded"
    return {"status": status}

@retry(
    retry=retry_if_exception_type(TransientRedisError),
    wait=wait_exponential(multiplier=0.5, min=0.5, max=4),
    stop=stop_after_attempt(3),
)
def _delete_key(key: str):
    try:
        r.delete(key)
    except Exception as e:
        log.error(f"redis_delete_error key={key}: {e}")
        raise TransientRedisError()

@app.delete("/invalidate/{key}")
def invalidate_cache(key: str):
    _delete_key(key)
    log.info(f"cache_invalidate key={key}")
    return JSONResponse({"status": "invalidated", "key": key})
