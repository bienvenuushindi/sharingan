module ControllerMacros
  def login_admin
    before(:each) do
      @request.env["devise.mapping"] = Devise.mappings[:admin]
      sign_in  FactoryBot.create(:user, role: 'admin') # Using factory bot as an example
    end
  end

  def login_user

      @request.env["devise.mapping"] = Devise.mappings[:user]
      # user = FactoryBot.create(:user)
      sign_in FactoryBot.create(:user, role: 'admin')

  end
end