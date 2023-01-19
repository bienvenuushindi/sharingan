class Article < ApplicationRecord
  include PgSearch::Model
  pg_search_scope :search, against: %i[title], using: { tsearch: { prefix: true } }
  belongs_to :user
  has_and_belongs_to_many :searches
  validates :title, presence: true
  validates :body, presence: true

  def update_visited_count
    increment!(:visited_count)
  end

  def sort_by_visited
    order('visited_count desc')
  end
end
