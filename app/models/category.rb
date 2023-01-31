class Category < ApplicationRecord
  belongs_to :user
  belongs_to :parent_category, class_name: 'Category', optional: true
  has_many :categories, foreign_key: :parent_category_id
  has_and_belongs_to_many :articles

  scope :cr_categories, lambda { |user|
    where(['user_id IN (?) OR user_id = (?)', User.admins.pluck(:id), user.id])
  }

  scope :parent_categories, -> { where.not('parent_category_id = nil') }
end
