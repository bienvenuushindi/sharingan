require 'rails_helper'
require 'sidekiq/testing'
Sidekiq::Testing.fake!

RSpec.describe SearchQueryWorker, type: :worker do
  it "should respond to #perform" do
    expect(SearchQueryWorker.new).to respond_to(:perform)
  end
end