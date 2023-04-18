require 'rails_helper'

RSpec.describe 'Login', type: :feature, js: true do
  before :each do
    @user = FactoryBot.create(:user, role: 'admin')
    @user2 = FactoryBot.create(:user, email: 'user@test.com')
    visit new_user_session_path
  end

  describe 'page' do
    it 'should show welcome and remember me text' do
      expect_text('Welcome')
      expect_text('Remember me')
    end
    it 'should sign admin in successfully' do
      fill_in 'Email', with: 'dohysepup@mailinator.com'
      fill_in 'Password', with: 'Pa$$w0rd!'
      page.execute_script("document.getElementById('new_user').submit()")
      expect(current_path).to eq(authenticated_root_path)
      expect_text('Search')
      expect_text('Logout')
    end
    it 'should sign user in successfully' do
      fill_in 'Email', with: 'user@test.com'
      fill_in 'Password', with: 'Pa$$w0rd!'
      page.execute_script("document.getElementById('new_user').submit()")
      expect(current_path).to eq(authenticated_root_path)
      expect_text('Search')
      expect_text('Logout')
    end
    it 'should fail on wrong email' do
      # Submit wrong email
      fill_in 'Email', with: 'dohysepu@mailinator.com'
      fill_in 'Password', with: 'Pa$$w0rd!'
      page.execute_script("document.getElementById('new_user').submit()")
      expect(current_path).to eq(new_user_session_path)
      expect_text('Invalid Email or password')
    end
    it 'should fail on wrong password' do
      # Submit wrong password
      fill_in 'Email', with: 'dohysepup@mailinator.com'
      fill_in 'Password', with: 'Pa$$rd!'
      page.execute_script("document.getElementById('new_user').submit()")
      expect(current_path).to eq(new_user_session_path)
      expect_text('Invalid Email or password')
    end
  end
  it 'should navigate to forgot password page' do
    click_on('Forget Password?')
    expect_current_path(new_user_password_path)
  end
  it 'should navigate to sign up page' do
    click_on('Sign up')
    expect_current_path(new_user_registration_path)
  end

  it 'signs @admin in' do
    fill_in 'Email', with: 'dohysepup@mailinator.com'
    fill_in 'Password', with: 'Pa$$w0rd!'
    page.execute_script("document.getElementById('new_user').submit()")
    # sleep(10)
    expect(current_path).to eq(authenticated_root_path)
    expect_text('Analytic')
    expect_text('Logout')
  end
end
