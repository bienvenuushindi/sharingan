require 'rails_helper'
RSpec.describe 'Article', type: :model do
  subject do
    Article.new(title: 'this is my title', body: 'lorem ipsum', visited_count: 1)
  end
  before { subject.save }
  it 'title should be present' do
    subject.title = nil
    expect(subject).to_not be_valid
  end

  it 'body should be present' do
    subject.body = nil
    expect(subject).to_not be_valid
  end

  it 'visited counter  should be positive number' do
    subject.visited_count = nil
    expect(subject).to_not be_valid

    subject.visited_count = -1
    expect(subject).to_not be_valid
  end
end