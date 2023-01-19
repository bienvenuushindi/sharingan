class Search < ApplicationRecord
  include PgSearch::Model
  pg_search_scope :search, against: %i[term], using: { tsearch: { prefix: true } }
  has_and_belongs_to_many :users
  has_and_belongs_to_many :articles
  validates :term, presence: true, uniqueness: true

  def sort_by_occurrence
    order('occurrence desc')
  end

  def update_occurrence
    increment!(:occurrence)
  end

  def update_user_count
    increment!(:user_count)
  end

  def update_article_count
    increment!(:article_count)
  end
end
