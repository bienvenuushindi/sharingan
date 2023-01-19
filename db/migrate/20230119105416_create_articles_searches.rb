class CreateArticlesSearches < ActiveRecord::Migration[7.0]
  def change
    create_table :articles_searches, id: false do |t|
      t.references :article, null: false, foreign_key: true
      t.references :search, null: false, foreign_key: true

      t.datetime :created_at, null: false, default: DateTime.now
    end
  end
end
