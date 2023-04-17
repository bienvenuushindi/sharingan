require 'rails_helper'

RSpec.describe 'Analytic', type: :request do

  before(:each) do
    user = FactoryBot.create(:user)
    @articles = [
      { :title => 'What is HelpJuice and how does it work? ...' },
      { :title => 'Who is HelpJuice for?' },
      { :title => 'Do people use HelpJuice only for code?' },
      { :title => 'Why should I use HelpJuice?' },
      { :title => 'Are Git and HelpJuice the same?' },
      { :title => 'Do I need Git in order to use HelpJuice?' }
    ]
    sign_in user
    @articles.each { |item| FactoryBot.create(:article, title: item[:title], user:) }
  end

  describe 'GET /index' do
    before :each do
      @term = "HelpJuice"
      get search_path, params: { term: @term }
    end

    it 'response status success' do
      expect(response).to have_http_status(:ok)
    end

    it 'render the page' do
      expect(response).to render_template(:index)
    end
  end
end
