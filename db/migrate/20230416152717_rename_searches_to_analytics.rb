class RenameSearchesToAnalytics < ActiveRecord::Migration[7.0]
  def change
    rename_table :searches, :analytics
    rename_table :articles_searches, :analytics_articles
    rename_table :searches_users, :analytics_users
  end
end
