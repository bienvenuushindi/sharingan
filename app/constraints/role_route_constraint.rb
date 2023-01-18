class RoleRouteConstraint
  def initialize(&block)
    @block = block || ->(_user) { true }
  end

  def matches?(request)
    user = current_user(request)
    user.present? && @block.call(user)
  end

  def current_user(request)
    User.find_by_id(request.session[:user_id])
  end
end
