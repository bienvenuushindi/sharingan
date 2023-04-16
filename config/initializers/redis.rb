redis_config = { url: ENV['REDIS_URL'] || 'redis://localhost:6379/0' }
REDIS = Redis.new(redis_config)
