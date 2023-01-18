class RemoveUserRefToSearches < ActiveRecord::Migration[7.0]
  def change
    remove_reference :searches, :user, foreign_key: true, index: false
  end
end
