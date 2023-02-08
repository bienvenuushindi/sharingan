class ApplicationRecord < ActiveRecord::Base
  primary_abstract_class
  def self.starts_with(column_name, prefix)
    where("lower(#{column_name}) like ?", "#{prefix.downcase}%")
  end

  def self.starts_not_with(column_name, prefix)
    where("lower(#{column_name}) not like ?", "#{prefix.downcase}%")
  end
end
