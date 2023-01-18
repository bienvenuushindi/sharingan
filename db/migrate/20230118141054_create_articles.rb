class CreateArticles < ActiveRecord::Migration[7.0]
  def change
    create_table :articles do |t|
      t.string :title, null: false
      t.text :body, null: false, default: ""
      t.references :user, null: false, foreign_key: true
      t.timestamps
    end
    add_index :articles, :title
  end
end
