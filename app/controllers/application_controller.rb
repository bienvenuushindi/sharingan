class ApplicationController < ActionController::Base
  include Pagy::Backend
  protect_from_forgery with: :exception
  before_action :authenticate_user!
  before_action :update_allowed_parameters, if: :devise_controller?

  protected

  def update_allowed_parameters
    devise_parameter_sanitizer.permit(:sign_up) { |u| u.permit(:email, :password) }
  end

  def after_sign_out_path_for(_resource_or_scope)
    #  Add path here
    unauthenticated_root_path
  end

  def after_sign_in_path_for(_resource_or_scope)
    authenticated_root_path
  end
end
