class RenameSearchesToSearchs < ActiveRecord::Migration[7.0]
  def change
    rename_table :searches, :Searchs
    rename_table :articles_searches, :Searchs_articles
    rename_table :searches_users, :Searchs_users
  end
end
