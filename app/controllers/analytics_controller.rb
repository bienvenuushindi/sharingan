class AnalyticsController < ApplicationController
  before_action :set_hot_topics, only: [:index]
  before_action :set_search, only: [:show]
  # GET /analytics or /analytics.json
  def index
    @searches = []
    if params_exist?
      @pagy, @searches = pagy(Search.find_best_match(search_params, categories_params?), items: 6)
      Search.push_to_redis(REDIS, { creator: current_user, value: search_params })
    end
    if turbo_frame_request?
      if params[:commit].present?
        create(search_params)
      else
        render partial: 'searches', locals: { searches: @searches, term: search_params }
      end
    else
      render 'index', locals: { searches: @searches, term: '' }
    end
  end

  def statistics
    @searches = Analytic.all.order('occurrence desc').limit(30)
    @users = User.where(role: 'user').order('email desc').limit(30)
    @articles = Article.all.order('visited_count desc').limit(30)
  end

  def show_stats
    @search = Analytic.find(params[:id])
    @users = @search.users.order('email desc').limit(30).uniq
    @articles = @search.articles.includes([:user]).order('visited_count desc').limit(30).uniq
  end

  def show; end

  def add
    article = Article.find(params[:article_id])
    if params_exist?
      flash[:notice] = if Search.insert(current_user, search_params, article)
                         'Search was successfully created.'
                       else
                         'Search insertion failed.'
                       end

    end
    redirect_to article_path(article)
  end

  # POST /analytics or /analytics.json
  def create(term)
    flash[:notice] = Search.insert(current_user, term) ? 'Search was successfully created.' : 'Search insertion failed.'
  end

  def select_page
    if current_user.admin?
      admin_dashboard
    else
      user_page
    end
  end

  private

  def admin_dashboard
    # load data required for managers
    redirect_to admin_root_url
  end

  def user_page
    # load data required for operators
    redirect_to search_url
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
    @search_trends = Analytic.sort_by_occurrence.limit(8)
    @categories = if params[:category].present?
                    Category.cr_categories(current_user).projects_categories
                  else
                    Category.cr_categories(current_user).guidelines_categories
                  end
  end

  def set_search
    @search = Analytic.find(params[:id])
  end
end
