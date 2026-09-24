import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

const getRedisUrl = () => {
  return process.env.REDIS_URL || 'redis://localhost:6379';
};

const isEdgeRuntime =
  process.env.NEXT_RUNTIME === 'edge' ||
  typeof (globalThis as unknown as { EdgeRuntime?: string }).EdgeRuntime === 'string';

/**
 * Creates an edge-safe or serverless-resilient Redis client.
 * - In Edge Runtime: Returns an edge-safe fallback stub to prevent TCP socket
 *   errors from blocking Edge Middleware.
 * - In Node/Serverless: Configures lazy connection, bounded command timeouts,
 *   offline queue prevention, and error suppression to safely tolerate Upstash
 *   connection limit exhaustion or temporary network outages.
 */
function createRedisClient(): Redis {
  if (isEdgeRuntime) {
    // Edge middleware cannot use Node TCP sockets. Return a resilient disconnected stub.
    const edgeStub = {
      status: 'disconnected',
      on: () => edgeStub,
      once: () => edgeStub,
      off: () => edgeStub,
      emit: () => false,
      ping: async () => 'PONG',
      get: async () => null,
      set: async () => 'OK',
      del: async () => 0,
      ttl: async () => -2,
      incr: async () => 1,
      expire: async () => 1,
      disconnect: () => {},
      quit: async () => 'OK',
    };
    return edgeStub as unknown as Redis;
  }

  const client = new Redis(getRedisUrl(), {
    maxRetriesPerRequest: 1,
    lazyConnect: true,
    enableOfflineQueue: false,
    connectTimeout: 5000,
    commandTimeout: 3000,
    retryStrategy(times) {
      if (times > 3) {
        // Stop reconnecting after 3 attempts if Redis is offline or over quota
        return null;
      }
      return Math.min(times * 100, 1000);
    },
    reconnectOnError(err) {
      // Do not attempt aggressive reconnection on client limits or quota exhaustion
      if (
        err.message &&
        (err.message.includes('max number of clients') ||
          err.message.includes('maxmemory') ||
          err.message.includes('OVER_RATE_LIMIT'))
      ) {
        return false;
      }
      return false;
    },
  });

  // Attach error and lifecycle handlers to ensure error events never throw uncaught exceptions
  client.on('error', (_err) => {
    // Gracefully handled: offline Redis, network partitions, or Upstash client connection limits
  });

  client.on('close', () => {
    // Socket connection closed gracefully
  });

  client.on('reconnecting', () => {
    // Reconnecting state handled
  });

  client.on('end', () => {
    // Connection ended gracefully
  });

  return client;
}

export const redis: Redis = globalForRedis.redis ?? createRedisClient();

// Always preserve on globalThis across serverless invocations to prevent leaking connections to Upstash
if (!globalForRedis.redis) {
  globalForRedis.redis = redis;
}
