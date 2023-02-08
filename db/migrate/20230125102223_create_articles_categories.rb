class CreateArticlesCategories < ActiveRecord::Migration[7.0]
  def change
    create_table :articles_categories, id: false do |t|
      t.references :article, null: false, foreign_key: true
      t.references :category, null: false, foreign_key: true

      t.timestamps
    end
  end
end
