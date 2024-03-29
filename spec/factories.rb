FactoryBot.define do
  factory :article do
    title { Faker::ProgrammingLanguage.name }
    body { Faker::Lorem.paragraph }
    visited_count { Faker::Number.between(from: 0, to: 7) }
    user { nil }
  end
end

FactoryBot.define do
  factory :user do
    email { 'dohysepup@mailinator.com' }
    password { 'Pa$$w0rd!' }
    role { 'user' }
  end
end

FactoryBot.define do
  factory :analytic do
    title { Faker::ProgrammingLanguage.name }
    user_count { Faker::Number.between(from: 0, to: 7) }
    article_count { Faker::Number.between(from: 0, to: 7) }
    occurrence { Faker::Number.between(from: 0, to: 7) }
  end
end
