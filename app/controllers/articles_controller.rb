class ArticlesController < ApplicationController
  load_and_authorize_resource
  before_action :set_article, only: %i[show edit update destroy]
  before_action :set_select_collections, only: %i[update new create]
  # GET /articles or /articles.json
  def index
    @articles = Article.all
    @articles = @articles.search(params[:query]) if params[:query].present?
    @pagy, @articles = pagy(@articles.reorder(sort_column => sort_direction), items: params.fetch(:count, 10))
  end

  # GET /articles/1 or /articles/1.json
  def show; end

  # GET /articles/new
  def new
    @article = Article.new
    @group = Category.parent_categories
    @categories = Category.guidelines_categories
    # @categories = Category.guidelines_categories
    # if turbo_frame_request?
    #   @categories = Category.projects_categories
    #   render partial: 'articles/categories', locals: { categories: @categories }
    # else
    #   render 'new', locals: { categories: @categories }
    # end
  end

  # GET /articles/1/edit
  def edit; end

  # POST /articles or /articles.json
  def create
    @article = Article.new(title: article_params[:title], body: article_params[:body], public: article_params[:public],
                           user: current_user)
    respond_to do |format|
      if @article.save
        @article.add_categories(article_params[:category_ids])
        format.html { redirect_to article_url(@article), notice: 'Article was successfully created.' }
        # format.json { render :show, status: :created, location: @article }
      else
        format.html { render :new, status: :unprocessable_entity }
        # format.json { render json: @article.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /articles/1 or /articles/1.json
  def update
    respond_to do |format|
      if @article.update(article_params)
        format.html { redirect_to article_url(@article), notice: 'Article was successfully updated.' }
        # format.json { render :show, status: :ok, location: @article }
      else
        format.html { render :edit, status: :unprocessable_entity }
        # format.json { render json: @article.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /articles/1 or /articles/1.json
  def destroy
    @article.destroy

    respond_to do |format|
      format.html { redirect_to articles_url, notice: 'Article was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private

  def set_select_collections
    @categories = Category.cr_categories(current_user)
    set_group
  end

  # Use callbacks to share common setup or constraints between actions.
  def set_article
    @article = Article.find(params[:id])
  end

  # Only allow a list of trusted parameters through.
  def article_params
    params.require(:article).permit(:title, :body, :public, category_ids: [])
  end

  def set_group
    @group = Category.parent_categories
  end

  def sort_column
    params['sort'] || 'title'
  end

  def sort_direction
    %w[asc desc].include?(params[:direction].to_s) ? params[:direction] : 'asc'
  end
end
