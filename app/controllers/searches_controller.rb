class SearchesController < ApplicationController
  # GET /searches or /searches.json
  def index
    if params_exist?
      @search_term = search_params
      @searches = Article.search(@search_term)
      # @searches = find_best_match(@search_term)
    else
      find_best_match
    end
    if turbo_frame_request?
      create(search_params) if params[:commit].present?
      if params[:commit].present?
        render partial: 'searches', locals: { searches: [] }
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

  def find_best_match(_term = '')
    @searches = []

    p current_user.searches
    # user_search = current_user.searches
    # find user preferences
    # p current_user.searches.includes([:articles]).map(&:articles).flatten.each
    # p user_search.search('Bo').includes([:articles]).uniq.map(&:articles).flatten

    # do |article|
    #   p article
    #   @searches << article
    #   end

    # find similar term order by popularity
    # Search..where.not(id: ['Rails 3', 'Rails 5']).search('Bo')
    # Search.sort_by_occurrence.search(term).articles.sort_by_visited

    # Post.where(published: true).joins(:comments).merge( Comment.where(spam: false) )
    # return article related to this term
    # join with join with articles which are not part of this set but have the same term
    # @term = term
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
