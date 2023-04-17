module Helpers
  def expect_text(text)
    expect(page).to have_content(text)
  end

  def expect_current_path(path)
    expect(page).to have_current_path(path)
  end

  def login_user
    user = FactoryBot.create(:user)
    visit new_user_session_path
    fill_in 'Email', with: 'dohysepup@mailinator.com'
    fill_in 'Password', with: 'Pa$$w0rd!'
    page.execute_script("document.getElementById('new_user').submit()")
    user
  end

  def login_admin
    user = FactoryBot.create(:user, email: 'admin@mailinator.com', role: 'admin')
    visit new_user_session_path
    fill_in 'Email', with: 'admin@mailinator.com'
    fill_in 'Password', with: 'Pa$$w0rd!'
    page.execute_script("document.getElementById('new_user').submit()")
    user
  end
end
