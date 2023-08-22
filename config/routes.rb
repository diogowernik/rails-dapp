Rails.application.routes.draw do
  resources :profiles
  resources :coffees
  resources :authors
  root "wallets#index"
  get 'networks_config', to: 'application#networks_config'
end
