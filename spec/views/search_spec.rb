require 'rails_helper'
RSpec.describe 'Search process', type: :feature, js: true do
  before(:each) do
    FactoryBot.create(:article, { title: 'How do I cancel my subscription?', body: 'n/a' })
    FactoryBot.create(:article, { title: 'How do I cancel my account?', body: 'n/a' })
    FactoryBot.create(:article, { title: 'Can I upgrade my account?', body: 'n/a' })
    FactoryBot.create(:article, { title: 'Can you help me?', body: 'n/a' })
    FactoryBot.create(:article, { title: "I don't know how to enroll a new person.", body: 'n/a' })
    FactoryBot.create(:article, { title: 'Is it possible to generate new users?', body: 'n/a' })
  end

  search_sample_1 = [
    { term: 'how', sleep: 5 },
    { term: 'how do i', sleep: 5 },
    { term: 'how do i cancel', sleep: 5 },
    { term: 'how do i cancel my acc', sleep: 5 },
    { term: 'how do i cancel my', sleep: 35 },
    { term: 'how do i cancel my subscription', sleep: 5 }
  ]

  search_sample_2 = [
    { term: 'canvas', sleep: 5 },
    { term: 'roses', sleep: 5 },
    { term: 'straw', sleep: 5 },
    { term: 'canvas', sleep: 5 }
  ]

  search_sample_3 = [
    { term: 'how', sleep: 50 },
    { term: 'how do i cancel my subscription', sleep: 50 },
    { term: 'how do i cancel my account', sleep: 50 },
    { term: 'how do i build a house', sleep: 50 },
    { term: 'how do i cancel my account', sleep: 50 },
    { term: 'how do i cancel my account', sleep: 50 },
    { term: 'how do i cancel my account', sleep: 50 },
    { term: 'how do i cancel my account', sleep: 50 },
    { term: 'how do i cancel my account', sleep: 50 },
    { term: 'car' },
    { term: 'bat' },
    { term: 'window' },
    { term: 'duck' }
  ]
end
