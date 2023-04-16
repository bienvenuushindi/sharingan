class HomeController < ApplicationController
  def index
    @searches = Analytic.all.order('occurrence desc').limit(30)
    @users = User.where(role: 'user').order('email desc').limit(30)
    @articles = Article.all.order('visited_count desc').limit(30)
  end

  def statistics
    @search = Analytic.find(params[:id])
    @users = @search.users.order('email desc').limit(30).uniq
    @articles = @search.articles.includes([:user]).order('visited_count desc').limit(30).uniq
  end
end
