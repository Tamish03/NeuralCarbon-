import json
import os
import hashlib

class MockRedis:
    def __init__(self):
        self.store = {}
        
    def get(self, key):
        return self.store.get(key)
        
    def setex(self, key, time, value):
        self.store[key] = value

# Check if we should use real Redis
REDIS_URL = os.getenv("REDIS_URL", None)

if REDIS_URL:
    import redis
    redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)
else:
    # Use in-memory mock for development without Redis container
    redis_client = MockRedis()

def get_cache_key(prefix: str, data: dict) -> str:
    """Generate a consistent hash key for the given data dict."""
    serialized = json.dumps(data, sort_keys=True).encode('utf-8')
    data_hash = hashlib.md5(serialized).hexdigest()
    return f"{prefix}:{data_hash}"
