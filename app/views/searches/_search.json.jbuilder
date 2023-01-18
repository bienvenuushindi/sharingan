json.extract! search, :id, :term, :occurrence, :user_count, :article_count, :user_id, :created_at, :updated_at
json.url search_url(search, format: :json)
