require 'rails_helper'
RSpec.describe 'Search', type: :model do
  subject do
    Search.new( term: "kak", occurrence: 2, user_count: 2, article_count: 2, )
  end
  before { subject.save }

  it 'term should be present' do
    subject.term = nil
    expect(subject).to_not be_valid
  end

  it 'occurrence should be a positive number' do
    subject.occurrence = nil
    expect(subject).to_not be_valid

    subject.occurrence = -1
    expect(subject).to_not be_valid
  end

  it 'user count should be a positive  number' do
    subject.user_count = nil
    expect(subject).to_not be_valid

    subject.user_count = -1
    expect(subject).to_not be_valid
  end
  it 'article count should be a positive  number' do
    subject.article_count = nil
    expect(subject).to_not be_valid

    subject.article_count = -1
    expect(subject).to_not be_valid
  end

end