class Category < ApplicationRecord
  belongs_to :user
  has_and_belongs_to_many :articles

  scope :cr_categories, lambda { |user|
                          where(['user_id IN (?) OR user_id = (?)', User.admins.pluck(:id), user.id])
                        }


end
