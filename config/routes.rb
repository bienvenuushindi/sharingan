Rails.application.routes.draw do
  resources :categories
  devise_for :users
  # Defines the root path route ("/")
  devise_scope :user do
    authenticated :user do
      root 'searches#select_page', as: :authenticated_root
    end
    unauthenticated do
      root 'devise/sessions#new', as: :unauthenticated_root
    end
  end
  resources :searches,  only: [:create, :index, :show]
  resources :articles
  get '/search/:article_id(/:term)', to: 'searches#add', as: 'visit'
  get '/search-by(/:category)', to: 'searches#index', as: 'search_by_category'
  get '/keyword/:id', to: 'home#statistics', as: 'statistics'
  get '/dashboard', to: 'home#index', as: 'admin_root'
end
