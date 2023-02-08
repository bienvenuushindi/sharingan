module ApplicationHelper
  include Pagy::Frontend

  def sub_masked_email(string)
    string.gsub(/(?<=.{5}).*@.*(?=\S{4})/, '*********@****')
  end

  def markdown(text)
    GitHub::Markup.render_s(GitHub::Markups::MARKUP_MARKDOWN, text)
  end

  def navigation
    [
      {
        text: 'Categories',
        path: categories_path,
        icon: 'partials/icons/task'
      },
      {
        text: 'Articles',
        path: articles_path,
        icon: 'partials/icons/task'
      },
      {
        text: 'Add Category',
        path: new_category_path,
        icon: 'partials/icons/plus_icon'
      },
      {
        text: 'Add article',
        path: new_article_path,
        icon: 'partials/icons/plus_icon'
      },
      {
        text: 'Statistics',
        path: admin_root_path,
        icon: 'partials/icons/task'
      }
    ]
  end
end
