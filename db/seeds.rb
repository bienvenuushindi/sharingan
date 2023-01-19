# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: "Star Wars" }, { name: "Lord of the Rings" }])
#   Character.create(name: "Luke", movie: movies.first)
require 'faker'
admin = User.where(role:'admin').first
Article.destroy_all
100.times do
  Article.create!(title: Faker::JapaneseMedia::Naruto.character, body: Faker::JapaneseMedia::Naruto.demon, user_id: admin.id)
end

