class ReviewsController < ApplicationController
  def index; end

  def checklist
    @list = Category.find(params[:category]).articles
    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: turbo_stream.replace(params[:origin], render_to_string(partial: 'reviews/checklist'),
                                                  locals: { list: @list })
      end

      format.html { redirect_to new_article_url }
    end
  end

  def fetch_body
    @body = Article.select('id, body').where(id: params[:id]).first
    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: turbo_stream.prepend('review', render_to_string(partial: 'reviews/changes'),
                                                  locals: { body: @body })
      end

      format.html { redirect_to new_article_url }
    end
  end
end
