class CategoriesController < ApplicationController
  load_and_authorize_resource
  before_action :set_category, only: %i[show edit update destroy]
  before_action :set_group, only: %i[new edit]

  # GET /categories or /categories.json
  def index
    @categories = Category.parent_categories
  end

  # GET /categories/1 or /categories/1.json
  def show; end

  # GET /categories/new
  def new
    @category = Category.new
  end

  # GET /categories/1/edit
  def edit; end

  def general_requirement
    @gen_req = true
    get_categories
  end

  def group_by_category
    @gen_req = false
    get_categories(params[:category])
  end

  def get_categories(target = nil)
    @categories = target.nil? ? Category.general_req : Category.find(target).categories.filter_out_gen_req
    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: turbo_stream.replace(params[:origin], render_to_string(partial: 'articles/categories'),
                                                  locals: { categories: @categories, gen_req: @gen_req })
      end
      format.html { redirect_to new_article_url }
    end
  end

  # POST /categories or /categories.json
  def create
    @category = Category.new(category_params)
    @category.user = current_user

    respond_to do |format|
      if @category.save
        format.html { redirect_to category_url(@category), notice: 'Category was successfully created.' }
        format.json { render :show, status: :created, location: @category }
      else
        format.turbo_stream
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @category.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /categories/1 or /categories/1.json
  def update
    respond_to do |format|
      if @category.update(category_params)
        format.html { redirect_to category_url(@category), notice: 'Category was successfully updated.' }
        format.json { render :show, status: :ok, location: @category }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @category.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /categories/1 or /categories/1.json
  def destroy
    @category.destroy

    respond_to do |format|
      format.html { redirect_to categories_url, notice: 'Category was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_category
    @category = Category.find(params[:id])
  end

  # Only allow a list of trusted parameters through.
  def category_params
    params.require(:category).permit(:name, :parent_category_id)
  end

  def set_group
    @group = Category.parent_categories
  end
end
