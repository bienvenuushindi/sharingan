class Category < ApplicationRecord
  belongs_to :user
  belongs_to :parent_category, class_name: 'Category', optional: true
  has_many :categories, foreign_key: :parent_category_id
  has_and_belongs_to_many :articles

  validates :name, presence: true

  scope :cr_categories, lambda { |user|
    where(['user_id IN (?) OR user_id = (?)', User.admins.pluck(:id), user.id])
  }

  scope :parent_categories, -> { where(parent_category_id: nil) }

  scope :guidelines_categories, -> { where(parent_category_id: Category.select('id').where(name: 'Guidelines')) }
  scope :projects_categories, -> { where(parent_category_id: Category.select('id').where(name: 'Projects')) }
  scope :general_req, -> { starts_with('name', 'general') }
  scope :filter_out_gen_req, -> { starts_not_with('name', 'general') }

  def count_articles
    articles.count
  end
end
