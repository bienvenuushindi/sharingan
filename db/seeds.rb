# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
unless User.where(email: 'admin@test.com').exists?
  admin = User.create(email: 'admin@test.com', password: 'admin@test')
  user = User.create(email: 'user@test.com', password: 'user@test')
  User.where(email: 'admin@test.com').update!(role: 'admin').first

  categories = [
    'Guidelines',
    'Projects',
    'general requirements'
  ]
  # Create parent categories
  categories.each do |item|
    Category.create(name: item, user: admin)
  end

  categories.each do |item|
    Category.create(name: Faker, user: admin)
  end

  sub_categories = [
    'Invalid', 'review loop', 'Review mistake',
    'about project requirement', 'Review your project from trials!',
    'Portfolio: finish mobile version', 'Portfolio: setup and mobile first',
    'Pull request', 'general requirements - linters',
    'general requirements - Professional repository',
    'general requirements - GitHub flow',
    'general requirements - Gitflow'
  ]

  sub_categories.each do |item|
    if item.include?('general')
      @cat = Category.create(name: item, parent_category: Category.general_req.first, user: admin)
    elsif item.include?('portfolio') || item.include?('Review your')
      @cat = Category.create(name: item, parent_category: Category.where(name: 'Projects').first, user: admin)
    else
      @cat = Category.create(name: item, parent_category: Category.where(name: 'Guidelines').first, user: admin)
    end
    @cat << (0..15).to_a.map { |n| Article.create(title: Faker::Movie.title, body: Faker::Lorem.paragraph, user: admin) }
  end

  2.times do

  end
end



