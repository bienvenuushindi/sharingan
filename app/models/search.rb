class Search < ApplicationRecord
  has_and_belongs_to_many :users
  validates :term, presence: true, uniqueness: true

  protected

  def update_occurrence
    increment!(:occurrence)
  end

  def update_user_count
    increment!(:user_count)
  end

  def reduce_article_count
    increment!(:article_count)
  end
end
