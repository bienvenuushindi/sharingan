Rails.application.routes.draw do
  devise_for :users
  # Defines the root path route ("/")
  devise_scope :user do
    authenticated :user do
      constraints RoleRouteConstraint.new { |user| user.admin? } do
        root 'home#index', as: :admin_root
      end
      root 'searches#new', as: :authenticated_root
    end
    unauthenticated do
      root 'devise/sessions#new', as: :unauthenticated_root
    end
  end
  resources :searches, only: [:new, :create, :index]
  resources :articles
end
