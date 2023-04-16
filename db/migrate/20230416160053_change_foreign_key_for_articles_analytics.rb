class ChangeForeignKeyForArticlesSearchs < ActiveRecord::Migration[7.0]
  def change
    rename_column :Searchs_articles, :search_id, :Search_id
  end
end
