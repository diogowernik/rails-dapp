json.extract! coffee, :id, :author_id, :sender_wallet_address, :name, :amount, :timestamp, :message, :tx_hash, :created_at, :updated_at
json.url coffee_url(coffee, format: :json)
