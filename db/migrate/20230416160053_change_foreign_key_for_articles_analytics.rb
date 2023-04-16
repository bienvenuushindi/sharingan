class ChangeForeignKeyForArticlesAnalytics < ActiveRecord::Migration[7.0]
  def change
    rename_column :analytics_articles, :search_id, :Search_id
  end
end
