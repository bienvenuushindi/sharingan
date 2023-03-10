require 'rails_helper'
RSpec.describe 'Sign Up process', type: :feature, js: true do
  before :each do
    visit new_user_registration_path
  end
  scenario 'valid inputs' do
    fill_in 'Email', with: "reta#{rand(252...4350)}@mailinator.com"
    fill_in 'Password', with: 'Pa$$w0rd!'
    fill_in 'Password', with: 'Pa$$w0rd!'
    page.execute_script("document.getElementById('new_user').submit()")
    expect(current_path).to eq(searches_path)
    expect(page).to have_content('Logout')
  end
end
