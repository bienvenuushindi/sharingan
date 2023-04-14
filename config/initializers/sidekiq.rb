Sidekiq.configure_server do |config|
  config.redis = Redis.current
end

Sidekiq.configure_client do |config|
  config.redis = Redis.current
end