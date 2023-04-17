require 'rails_helper'
RSpec.describe 'Analytic process', type: :feature, js: true do
  before(:each) do
    @user = login_admin
  end
  describe 'GET /index' do
    before(:each) do
      @articles = [
        { :title => 'What is HelpJuice and how does it work? ...' },
        { :title => 'Who is HelpJuice for?' },
        { :title => 'Do people use HelpJuice only for code?' },
        { :title => 'Why should I use HelpJuice?' },
        { :title => 'Are Git and HelpJuice the same?' },
        { :title => 'Do I need Git in order to use HelpJuice?' }
      ]
      @articles.each { |item| FactoryBot.create(:article, title: item[:title], user: @user) }
      visit admin_root_path
    end
    it 'should display admin page' do
      expect_text('Categories')
      expect_text('Articles')
      expect_text('Analytics')
    end
    it 'should return all the article when you type helpjuice' do
      visit search_path
      fill_in 'term', with: 'helpjuice'
      @articles.each { |item| expect_text(item[:title]) }
      expect_text('Search')
      expect_text('Logout')
    end

    it 'should navigate to Analytics page' do
      click_on('Analytics')
      expect_current_path(admin_root_path)
    end
    it 'should navigate to categories page' do
      click_on('Categories')
      expect_current_path(categories_path)
    end
    it 'should navigate to Articles page' do
      click_on('Articles')
      expect_current_path(articles_path)
    end
  end
  describe 'Get statistics' do
    random1 = [
      { :term => 'What is', :wait => 1 },
      { :term => 'What is a', :wait => 1 },
      { :term => 'What is a good car?', :wait => 1 },
    ]

    random2 = [
      { :term => 'How is', :wait => 2 },
      { :term => 'Howis emil hajric', :wait => 1 },
      { :term => 'How is emil hajric doing?', :wait => 1 },
    ]
    before(:each) do
      @articles = [
        { :title => 'What is HelpJuice and how does it work? ...' },
        { :title => 'Who is HelpJuice for?' },
        { :title => 'Do people use HelpJuice only for code?' },
        { :title => 'Why should I use HelpJuice?' },
        { :title => 'Are Git and HelpJuice the same?' },
        { :title => 'What is a good car?' },
        { :title => 'How is emil hajric doing?' },
        { :title => 'Do I need Git in order to use HelpJuice?' }
      ]
      @articles.each { |item| FactoryBot.create(:article, title: item[:title], user: @user) }
    end

    it 'should return the right stats' do
      search_sample(random2)
      run_worker
      search_sample(random1)
      run_worker
      visit admin_root_path
      expect_text(random1.last[:term].downcase)
      expect_text(random2.last[:term].downcase)
    end

    def run_worker
      sleep(5)
      SearchQueryWorker.new.perform
    end

    def search_sample(search_set)
      search_set.each do |item|
        visit search_path
        fill_in 'term', with: item[:term]
        Search.push_to_redis(REDIS, {creator: @user, value: item[:term]})
        sleep(item[:wait])
      end
    end
  end
end
