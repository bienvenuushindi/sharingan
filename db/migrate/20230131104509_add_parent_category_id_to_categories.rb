class AddParentCategoryIdToCategories < ActiveRecord::Migration[7.0]
  def change
    add_column :categories, :parent_category_id, :integer, index: true, default: null
  end
end
