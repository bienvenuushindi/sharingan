require 'rails_helper'

RSpec.describe 'Login process', type: :feature, js: true do
  before :each do
    # @request.env["devise.mapping"] = Devise.mappings[:user]
    @user = FactoryBot.create(:user, role: 'admin')
    let(:current_user) { @user }
    # p FactoryBot.create(:user, email: 'admin@test.com', role: 'admin')
    visit new_user_session_path
  end

  describe 'Sign in page' do
    it 'Contains' do
      expect_text('Welcome')
      expect_text('Remember me')
    end
    it 'signs @user in' do
      fill_in 'Email', with: 'dohysepup@mailinator.com'
      fill_in 'Password', with: 'Pa$$w0rd!'
      page.execute_script("document.getElementById('new_user').submit()")
      expect(current_path).to eq(searches_path)
      expect_text('Search')
      # sleep(5)
      expect_text('Logout')
    end
    it 'signs @user in should fail on wrong email' do
      # Submit wrong email
      fill_in 'Email', with: 'dohysepu@mailinator.com'
      fill_in 'Password', with: 'Pa$$w0rd!'
      page.execute_script("document.getElementById('new_user').submit()")
      expect(current_path).to eq(new_user_session_path)
      expect_text('Invalid Email or password')
    end
    it 'signs @user in should fail on wrong password' do
      # Submit wrong password
      fill_in 'Email', with: 'dohysepup@mailinator.com'
      fill_in 'Password', with: 'Pa$$rd!'
      page.execute_script("document.getElementById('new_user').submit()")
      expect(current_path).to eq(new_user_session_path)
      expect_text('Invalid Email or password')
    end
  end
  it 'navigates to forgot password page' do
    click_on('Forget Password?')
    expect_current_path(new_user_password_path)
  end
  it 'navigates to sign up page' do
    click_on('Sign up')
    expect_current_path(new_user_registration_path)
  end

  it 'signs @admin in' do

    fill_in 'Email', with: 'dohysepup@mailinator.com'
    fill_in 'Password', with: 'Pa$$w0rd!'
    page.execute_script("document.getElementById('new_user').submit()")
    # sleep(10)
    expect(current_path).to eq(admin_root_path)
    expect_text('Search')
    expect_text('Logout')
  end
end
