class SearchesController < ApplicationController
  # GET /searches or /searches.json
  def index
    @searches = Search.all
  end

  # GET /searches/new
  def new
    @search = Search.new
  end

  # POST /searches or /searches.json
  def create
    @search = Search.new(search_params)
    respond_to do |format|
      if @search.save
        @search.users << current_user
        @search.update_occurrence
        @search.update_user_count
        format.html { redirect_to search_url(@search), notice: 'Search was successfully created.' }
        format.json { render :show, status: :created, location: @search }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @search.errors, status: :unprocessable_entity }
      end
    end
  end

  private

  # Only allow a list of trusted parameters through.
  def search_params
    params.require(:search).permit(:term)
  end
end
