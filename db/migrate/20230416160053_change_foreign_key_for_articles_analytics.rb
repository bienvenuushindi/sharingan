class ChangeForeignKeyForArticlesAnalytics < ActiveRecord::Migration[7.0]
  def change
    rename_column :analytics_articles, :search_id, :analytic_id
  end
end
