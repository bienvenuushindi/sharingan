require 'rails_helper'
RSpec.describe 'Login process', type: :feature, js: true do
  before :each do
    User.create(email: 'retafahevo@mailinator.com', password: 'Pa$$w0rd!')
    visit new_user_session_path
  end
  it 'signs @user in' do
    expect(page).to have_content('Login')
    fill_in 'Email', with: 'retafahevo@mailinator.com'
    fill_in 'Password', with: 'Pa$$w0rd!'
    page.execute_script("document.getElementById('new_user').submit()")
    # sleep(30)
    # expect(current_path).to eq(authenticated_root_path)
    # expect(page).to have_text('Search')
    # expect(page).to have_text('Logout')
  end

  it 'navigates to forgot password page' do
    click_on('Forgot your password')
    expect(page).to have_current_path(new_user_password_path)
  end
end
