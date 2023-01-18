class CreateSearches < ActiveRecord::Migration[7.0]
  def change
    create_table :searches do |t|
      t.string :term, null: false, unique: true, default: ""
      t.integer :occurrence, null: false, default: 0
      t.integer :user_count, null: false, default: 0
      t.integer :article_count, null: false, default: 0
      t.references :user, null: false, foreign_key: true
      t.timestamps
    end
    add_index :searches, :term
  end
end
