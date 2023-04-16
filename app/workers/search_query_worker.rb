class SearchQueryWorker
  include Sidekiq::Worker
  # The perform method takes two arguments, user_id and query,
  # and pushes the query onto a Redis list with a key that includes the user ID.
  def perform
    puts 'Sidekiq has started consuming...................'
    users_searches = fetch_users_searches

    return puts 'No item at the moment' if users_searches.empty?

    users_searches.each do |key|
      consume(key) if REDIS.type(key) == 'list'
    end
    puts 'Sidekiq has finished consuming...................'
  end

  private

  def fetch_users_searches
    REDIS.scan_each(match: 'user:*').to_a
  end

  def consume(key)
    # get last element in the list
    last_item = JSON.parse(REDIS.lindex(key, 0))
    return unless right_interval?(last_item['created_at'])

    # save search
    insert_search(extract_user_id(key), last_item['term'])
    # del key
    REDIS.del(key)
  end

  def insert_search(user_id, term)
    search = Search.where(term: term.downcase).first_or_create!
    search.add_user(User.find(user_id))
  end

  def extract_user_id(key)
    key.split(':')[1]
  end

  def right_interval?(time1, time2 = DateTime.now.strftime('%Q'))
    (time2.to_i - time1.to_i).abs.ceil >= 4000
  end
end
