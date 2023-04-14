module Helpers
  def expect_text(text)
    expect(page).to have_content(text)
  end

  def expect_current_path(path)
    expect(page).to have_current_path(path)
  end
end
