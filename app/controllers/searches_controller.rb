class SearchesController < ApplicationController
  # GET /searches or /searches.json
  def index
    if params_exist?
      @search_term = search_params
      @searches = find_best_match(@search_term)
    else
      @searches = []
    end
    if turbo_frame_request?
      if params[:commit].present?
        create(search_params)
      else
        render partial: 'searches', locals: { searches: @searches, term: @search_term }
      end
    else
      render 'index'
    end
  end

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

  def find_best_match(term = '')
    # p current_user.searches.uniq.pluck(:id)
    user_searches = current_user.searches.search(term)

    # find user preferences
    preference_articles = user_searches.includes([:articles]).uniq.map(&:articles).flatten

    # find similar term order by popularity
    popular_articles = Search.where.not(id: user_searches.pluck(:id))
      .search(term).order('occurrence desc')
      .includes([:articles]).uniq.map(&:articles).flatten

    # find articles by most visited
    articles = Article.where.not(id: popular_articles.pluck(:id).union(preference_articles))
      .search(term).order('visited_count desc').uniq

    # combine results
    @searches = preference_articles.concat(popular_articles).concat(articles)
  end

  # POST /searches or /searches.json
  def create(term, from_article: false)
    @search = Search.where(term: term.downcase).first_or_initialize
    @search.users << current_user
    @search.update_occurrence
    @search.update_user_count
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
end
