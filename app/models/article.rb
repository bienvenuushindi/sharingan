class Article < ApplicationRecord
  include PgSearch::Model
  pg_search_scope :search, against: %i[title body], using: { tsearch: { prefix: true, normalization: 8 } }
  belongs_to :user
  has_and_belongs_to_many :searches
  has_and_belongs_to_many :categories
  validates :title, presence: true
  validates :body, presence: true
  validates :visited_count, numericality: { greater_than_or_equal_to: 0 }

  # scope :public, -> { where(public: true) }

  def update_visited_count
    increment!(:visited_count)
  end

  def public?
    public
  end

  def self.sort_by_visited
    order('visited_count desc')
  end

  def add_categories(categories_set)
    categories_set.reject { |item| item == '' }.each { |item| categories << Category.find(item) }
  end

  def add_user(user)
    user = user
  end
end
