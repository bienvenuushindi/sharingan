class HomeController < ApplicationController
  before_action :authenticate_user!, except: [:index]
  def index
    @searches = Search.all.order('occurrence desc').limit(30)
    @users = User.where(role: 'user').order('email desc').limit(30)
    @articles = Article.all.order('visited_count desc').limit(30)
  end

  def statistics
    @search = Search.find(params[:id])
    @users = @search.users.order('email desc').limit(30).uniq
    @articles = @search.articles.order('visited_count desc').limit(30).uniq
  end
end
