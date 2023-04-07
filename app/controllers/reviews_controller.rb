class ReviewsController < ApplicationController
  def index; end

  def checklist
    @list = Category.find(params[:category]).articles
    respond_to do |format|
      format.turbo_stream

      format.html { redirect_to new_article_url }
    end
  end

  def fetch_body
    @body = Article.select('id, body').where(id: params[:id]).first
    respond_to do |format|
      format.turbo_stream
      format.html { redirect_to new_article_url }
    end
  end
end
