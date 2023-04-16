require 'sidekiq-scheduler'
require 'redis'

class SearchQueryWorker
  include Sidekiq::Worker
  # The perform method takes two arguments, user_id and query,
  # and pushes the query onto a Redis list with a key that includes the user ID.
  def perform
    puts 'Hello this is your key = '
    @redis ||= redis_instance
    searches = fetch_searches

    return if searches.empty?

    p searches
  end

  private

  def fetch_searches
    @redis.scan_each(match: 'user:*').to_a
  end

  def redis_instance
    redis_config = { url: ENV['REDIS_URL'] || 'redis://localhost:6379/0' }
    Redis.new(redis_config)
  end
end
