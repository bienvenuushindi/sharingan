class CreateSearchesUsers < ActiveRecord::Migration[7.0]
  def change
    create_table :searches_users, id: false do |t|
      t.references :search, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
    end
  end
end
