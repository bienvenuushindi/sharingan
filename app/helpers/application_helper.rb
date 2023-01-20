module ApplicationHelper
  def sub_masked_email(string)
    string.gsub(/(?<=.{5}).*@.*(?=\S{4})/, '*********@****')
  end
end
