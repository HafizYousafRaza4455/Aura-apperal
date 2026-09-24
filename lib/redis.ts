import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

const getRedisUrl = () => {
  return process.env.REDIS_URL || 'redis://localhost:6379';
};

export const redis =
  globalForRedis.redis ??
  new Redis(getRedisUrl(), {
    maxRetriesPerRequest: 1,
    lazyConnect: true,
    enableOfflineQueue: false,
    retryStrategy(times) {
      if (times > 3) {
        // Stop reconnecting after 3 attempts in local dev if Redis is not running
        return null;
      }
      return Math.min(times * 100, 1000);
    },
  });

redis.on('error', () => {
  // Gracefully silence offline redis errors in local development & tests
});

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}
