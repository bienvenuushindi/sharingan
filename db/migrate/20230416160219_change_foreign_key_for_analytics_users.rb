class ChangeForeignKeyForAnalyticsUsers < ActiveRecord::Migration[7.0]
  def change
    rename_column :analytics_users, :search_id, :Search_id
  end
end
