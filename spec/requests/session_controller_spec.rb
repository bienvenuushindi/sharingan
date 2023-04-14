require 'rails_helper'
RSpec.describe 'Devise Session', type: :controller do
  describe 'post#user_session ' do
    # before(:each) do
      login_user    # end

    it 'response status success' do
      expect(response).to have_http_status(:ok)
    end

    it 'render the page' do
      expect(response).to render_template('/dashboard')
    end
  end
end