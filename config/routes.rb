Rails.application.routes.draw do

  get 'song/index'

  resources :collaborations
  post 'collaborations/search'
  post 'collaborations/from_song'
  post 'collaborations/to_movies'
  post 'collaborations/from_movie'
  post 'collaborations/to_songs'

  resources :favorites
  post 'favorites/add'

  get 'search/index'
  get 'users/profile'

	# root to: 'pages#index'
  root "pages#show", page: "landing"

	devise_for :users,
	
  controllers: { sessions: 'users/sessions' },
	
  path: 'auth', path_names: {
    sign_in: 'login',
  	sign_out: 'logout', password: 'secret',
  	confirmation: 'verification', unlock: 'unblock',
  	registration: 'register', sign_up: 'cmon_let_me_in'
  }

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end