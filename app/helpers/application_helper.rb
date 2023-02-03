module ApplicationHelper
  include Pagy::Frontend

  def sub_masked_email(string)
    string.gsub(/(?<=.{5}).*@.*(?=\S{4})/, '*********@****')
  end

  def markdown(text)
    # CommonMarker.Node.to_html('"Hi *there*"', options: {
    #   parse: { smart: true }
    # })
    GitHub::Markup.render_s(GitHub::Markups::MARKUP_MARKDOWN, text)
  end
end
