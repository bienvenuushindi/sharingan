class Article < ApplicationRecord
  include PgSearch::Model
  pg_search_scope :search, against: %i[title], using: { tsearch: { prefix: true } }
  belongs_to :user
  validates :title, presence: true
  validates :body, presence: true
end
