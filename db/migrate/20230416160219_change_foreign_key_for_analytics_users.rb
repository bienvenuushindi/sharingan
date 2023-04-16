class ChangeForeignKeyForSearchsUsers < ActiveRecord::Migration[7.0]
  def change
    rename_column :Searchs_users, :search_id, :Search_id
  end
end
