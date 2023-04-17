class Search
  class << self
    def push_to_redis(redis, term)
      redis.lpush(
        "user:#{term[:creator].id}",
        {
          term: term[:value],
          created_at: DateTime.now.strftime('%Q')
        }.to_json
      )
    end

    def find_best_match(term = '', categories = [])
      if categories.empty?
        searches = Article.includes([:categories]).search(term).order('visited_count desc')
      else
        articles = Category.includes([:articles]).where(id: categories).uniq.map(&:articles).flatten
        searches = Article.includes([:categories]).where(id: articles).search(term).order('visited_count desc')
      end
      searches
    end

    def insert(user, term, article = nil)
      search = Analytic.where(term: term.downcase).first_or_create!
      search.add_user(user)
      if article
        search.update_article_count
        search.articles << article
        article.update_visited_count
      end
      search
    end
  end
end
