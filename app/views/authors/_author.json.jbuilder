json.extract! author, :id, :name, :bio, :wallet_address, :balance, :created_at, :updated_at
json.url author_url(author, format: :json)
