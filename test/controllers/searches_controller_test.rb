require 'test_helper'

class SearchesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @search = searches(:one)
  end

  test 'should get index' do
    get analytics_url
    assert_response :success
  end

  test 'should get new' do
    get new_search_url
    assert_response :success
  end

  test 'should create search' do
    assert_difference('Analytic.count') do
      post analytics_url,
           params: { search: { article_count: @search.article_count, occurrence: @search.occurence, term: @search.term,
                               user_count: @search.user_count, user_id: @search.user_id } }
    end

    assert_redirected_to analytic_url(Analytic.last)
  end

  test 'should show search' do
    get analytic_url(@search)
    assert_response :success
  end

  test 'should get edit' do
    get edit_search_url(@search)
    assert_response :success
  end

  test 'should update search' do
    patch analytic_url(@search),
          params: { search: { article_count: @search.article_count, occurrence: @search.occurence, term: @search.term,
                              user_count: @search.user_count, user_id: @search.user_id } }
    assert_redirected_to analytic_url(@search)
  end

  test 'should destroy search' do
    assert_difference('Analytic.count', -1) do
      delete analytic_url(@search)
    end

    assert_redirected_to analytics_url
  end
end
