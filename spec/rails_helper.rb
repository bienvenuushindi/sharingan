# rubocop:disable Metrics/BlockLength
# This file is copied to spec/ when you run 'rails generate rspec:install'
require 'spec_helper'
ENV['RAILS_ENV'] ||= 'test'
require_relative '../config/environment'
# Prevent database truncation if the environment is production
abort('The Rails environment is running in production mode!') if Rails.env.production?
require 'rspec/rails'
# Add additional requires below this line. Rails is not loaded until this point!
require 'capybara/rspec'
require 'bullet'
require 'support/helpers'
require 'mock_redis'

begin
  ActiveRecord::Migration.maintain_test_schema!
rescue ActiveRecord::PendingMigrationError => e
  abort e.to_s.strip
end

RSpec.configure do |config|
  Capybara.register_driver :selenium_chrome do |app|
    Capybara::Selenium::Driver.new(app, browser: :chrome)
  end

  Capybara.javascript_driver = :selenium_chrome

  Capybara.configure do |c|
    c.run_server = false
    c.app_host = 'http://127.0.0.1:3000'
    c.server_port = 3000
    c.default_host = 'http://127.0.0.1:3000'
  end

  config.use_transactional_fixtures = false
  config.include Capybara::DSL

  config.include Helpers
  # The different available types are documented in the features, such as in
  # https://relishapp.com/rspec/rspec-rails/docs
  config.infer_spec_type_from_file_location!

  # Filter lines from Rails gems in backtraces.
  config.filter_rails_from_backtrace!
  # arbitrary gems may also be filtered via:
  # config.filter_gems_from_backtrace("gem name")
  config.before(:suite) do
    DatabaseCleaner.clean_with(:truncation)
  end

  config.before(:each) do
    DatabaseCleaner.strategy = :transaction
  end

  config.before(:each, js: true) do
    DatabaseCleaner.strategy = :truncation
  end

  # This block must be here, do not combine with the other `before(:each)` block.
  # This makes it so Capybara can see the database.
  config.before(:each) do
    DatabaseCleaner.start
    # Sidekiq::Testing.fake!
  end

  config.after(:each) do
    DatabaseCleaner.clean
  end

  if Bullet.enable?
    config.before(:each) do
      Bullet.start_request
    end

    config.after(:each) do
      Bullet.perform_out_of_channel_notifications if Bullet.notification?
      Bullet.end_request
    end
  end
  config.expect_with :rspec do |c|
    c.syntax = :except
  end

  '' '
  Creating a stub/mock Redis for running the tests without requiring an actual Redis server.
   This will store the Redis data in memory instead of the Redis server.
  ' ''
  config.before(:each) do
    REDIS.flushdb
  end
  config.include Devise::Test::IntegrationHelpers, type: :request
end
