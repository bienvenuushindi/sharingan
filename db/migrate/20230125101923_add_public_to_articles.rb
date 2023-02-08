class AddPublicToArticles < ActiveRecord::Migration[7.0]
  def change
    add_column :articles, :public, :boolean, default: true
  end
end
