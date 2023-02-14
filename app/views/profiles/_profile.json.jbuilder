json.extract! profile, :id, :name, :slug, :bio, :wallet_address, :created_at, :updated_at
json.url profile_url(profile, format: :json)
