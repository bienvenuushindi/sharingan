Rails.application.routes.draw do
  require 'sidekiq/web'
  mount Sidekiq::Web => "/sidekiq"
  resources :categories
  devise_for :users
  # Defines the root path route ("/")
  devise_scope :user do
    authenticated :user do
      root 'Searchs#select_page', as: :authenticated_root
    end
    unauthenticated do
      root 'devise/sessions#new', as: :unauthenticated_root
    end
  end
  resources :Searchs, only: [:create, :index, :show]
  resources :articles
  get '/search/:article_id(/:term)', to: 'Searchs#add', as: 'visit'
  post '/checklist(/:category)', to: 'reviews#checklist', as: 'checklist'
  get '/review/:id', to: 'reviews#fetch_body', as: 'get_body'
  get '/search-by(/:category)', to: 'reviews#index', as: 'search_by_category'
  post '/group-by(/:category)', to: 'categories#group_by_category', as: 'group'
  post '/general-requirement', to: 'categories#general_requirement', as: 'gen-req'
  get '/keyword/:id', to: 'home#statistics', as: 'queries'
  get '/dashboard', to: 'home#index', as: 'admin_root'
end
