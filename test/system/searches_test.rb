require 'application_system_test_case'

class SearchesTest < ApplicationSystemTestCase
  setup do
    @search = searches(:one)
  end

  test 'visiting the index' do
    visit analytics_url
    assert_selector 'h1', text: 'Searches'
  end

  test 'should create search' do
    visit analytics_url
    click_on 'New search'

    fill_in 'Article count', with: @search.article_count
    fill_in 'Occurence', with: @search.occurence
    fill_in 'Term', with: @search.term
    fill_in 'User count', with: @search.user_count
    fill_in 'User', with: @search.user_id
    click_on 'Create Analytic'

    assert_text 'Analytic was successfully created'
    click_on 'Back'
  end

  test 'should update Analytic' do
    visit analytic_url(@search)
    click_on 'Edit this search', match: :first

    fill_in 'Article count', with: @search.article_count
    fill_in 'Occurence', with: @search.occurence
    fill_in 'Term', with: @search.term
    fill_in 'User count', with: @search.user_count
    fill_in 'User', with: @search.user_id
    click_on 'Update Analytic'

    assert_text 'Analytic was successfully updated'
    click_on 'Back'
  end

  test 'should destroy Analytic' do
    visit analytic_url(@search)
    click_on 'Destroy this search', match: :first

    assert_text 'Analytic was successfully destroyed'
  end
end
