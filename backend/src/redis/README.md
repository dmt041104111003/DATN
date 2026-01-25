
```bash
npm install ioredis
npm install -D @types/ioredis
```

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=  # Optional
REDIS_DB=0
```

```bash
# Docker
docker run -d --name redis -p 6379:6379 redis:latest
```
