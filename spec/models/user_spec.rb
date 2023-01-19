require 'rails_helper'
RSpec.describe 'User', type: :model do
  subject do
    User.new(email: 'jeanbienvenusb@gmail.com', password: 'my@password',
             password_confirmation: 'my@password')
  end
  before { subject.save }
  it 'email should be present' do
    subject.email = nil
    expect(subject).to_not be_valid
  end

  it 'email should be present' do
    subject.email = nil
    expect(subject).to_not be_valid
  end

  it 'password should be present' do
    subject.password = nil
    expect(subject).to_not be_valid
  end
end
