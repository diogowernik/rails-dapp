Rails.application.routes.draw do
  resources :profiles
  resources :coffees
  resources :authors
  root "wallets#index"
end
