module ApplicationHelper
  include Pagy::Frontend

  def sub_masked_email(string)
    string.gsub(/(?<=.{5}).*@.*(?=\S{4})/, '*********@****')
  end

  def markdown(text)
    GitHub::Markup.render_s(GitHub::Markups::MARKUP_MARKDOWN, text,
                            options: { commonmarker_opts: [:DEFAULT],
                                       commonmarker_exts: %i[autolink table strikethrough tagfilter] })
  end

  def translate_markdown(text)
    CommonMarker.render_html(text, [:DEFAULT], %i[table tasklist strikethrough tagfilter])
  end

  def sort_link_to(name, column, **options)
    direction = if params[:sort] == column.to_s
                  params[:direction] == 'asc' ? 'desc' : 'asc'
                else
                  'asc'
                end
    link_to name, request.params.merge(sort: column, direction:), **options
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
