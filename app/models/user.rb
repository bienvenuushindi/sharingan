class EmailValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    return if value =~ /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\z/i

    record.errors.add attribute, (options[:message] || 'is not an email')
  end
end

class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
  has_and_belongs_to_many :analytics
  has_many :articles, dependent: :destroy
  has_many :categories, dependent: :destroy
  validates :email, presence: true, uniqueness: true, email: true
  validates :password, presence: true, length: { minimum: 6 }, on: :create

  scope :admins, -> { where(role: 'admin') }
  def admin?
    role == 'admin'
  end

  # cr stands from code reviewer
  def cr?
    role == 'cr'
  end

  # src stands from senior code reviewer
  def scr?
    role == 'scr'
  end
end
