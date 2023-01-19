class AddVisitedCountToArticles < ActiveRecord::Migration[7.0]
  def change
    add_column :articles, :visited_count, :integer, default: 0
  end
end
