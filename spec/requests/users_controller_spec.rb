require 'rails_helper'

RSpec.describe 'UsersControllers', type: :request do
  describe 'get#index' do
    before(:example) do
      get unauthenticated_root_path
    end

    it 'response status success' do
      expect(response).to have_http_status(:ok)
    end

    it 'render the page' do
      expect(response).to render_template('devise/sessions/new')
    end

    it 'renders the correct placeholder' do
      expect(response.body).to include('Login')
      expect(response.body).to include('Sign up')
    end
  end
end
