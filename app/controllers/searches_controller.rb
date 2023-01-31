class SearchesController < ApplicationController
  before_action :set_hot_topics, only: [:index]
  before_action :set_search, only: [:show]
  # GET /searches or /searches.json
  def index
    if params_exist?
      @search_term = search_params
      find_best_match(@search_term, categories_params?)
    else
      @searches = []
    end
    if turbo_frame_request?
      if params[:commit].present?
        create(@search_term)
      else
        render partial: 'searches', locals: { searches: @searches, term: @search_term }
      end
    else
      render 'index', locals: { searches: @searches, term: '' }
    end
  end

  def show; end

  def add
    @article = Article.find(params[:article_id])
    if params_exist?
      term = search_params
      create(term, from_article: true)
      flash[:notice] = @search.save ? 'Search was successfully created.' : 'Search insertion failed.'
      @article.update_visited_count
    end
    redirect_to article_path(@article)
  end

  def find_best_match(term = '', categories = [])
    if categories.length.zero?

      # p current_user.searches.uniq.pluck(:id)
      user_searches = current_user.searches.search(term)

      # find user preferences
      preference_articles = user_searches.includes(articles: [:categories]).uniq.map(&:articles).flatten

      # find similar term order by popularity
      popular_articles = Search.where.not(id: user_searches.pluck(:id))
                               .search(term).order('occurrence desc')
                               .includes(articles: [:categories]).uniq.map(&:articles).flatten

      # find articles by most visited
      # articles = Article.where.not(id: popular_articles.pluck(:id).union(preference_articles))
      #                   .search(term).includes([:categories]).order('visited_count desc').uniq
      articles = Article.search(term).includes([:categories]).order('visited_count desc')

      # combine results
      @pagy, @searches = pagy(articles, items: 6)
      # or [Array1, Array2, Array3].flatten
    else
      articles = Category.where(id: categories).includes([:articles]).uniq.map(&:articles).flatten
      # @pagy, @articles = pagy(Article.all, items: 3)
      @pagy, @searches = pagy(Article.where(id: articles).search(term).order('visited_count desc').includes([:categories]), items: 6)
    end
  end

  # POST /searches or /searches.json
  def create(term, from_article: false)
    @search = Search.where(term: term.downcase).first_or_initialize
    @search.add_user(current_user)
    # @search.update_occurrence
    # @search.update_user_count
    if from_article
      @search.update_article_count
      @search.articles << @article
    end
    flash[:notice] = @search.save ? 'Search was successfully created.' : 'Search insertion failed.'
  end

  def select_page
    if current_user.admin?
      admin_dashboard
    else
      visitor_page
    end
  end

  private

  def admin_dashboard
    # load data required for managers
    redirect_to admin_root_url
  end

  def visitor_page
    # load data required for operators
    redirect_to searches_url
  end

  def search_params
    params[:term].strip
  end

  def params_exist?
    params[:term].present?
  end

  def categories_params?
    params[:category_ids] || []
  end

  def set_hot_topics
    @articles_trends = Article.sort_by_visited.limit(8)
    @search_trends = Search.sort_by_occurrence.limit(8)
    @categories = Category.cr_categories(current_user)
  end

  def set_search
    @search = Search.find(params[:id])
  end

end
