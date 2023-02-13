Rails.application.routes.draw do
  resources :coffees
  resources :authors
  root "wallets#index"
end
