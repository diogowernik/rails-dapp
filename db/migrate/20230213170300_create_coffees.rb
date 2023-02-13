class CreateCoffees < ActiveRecord::Migration[7.0]
  def change
    create_table :coffees do |t|
      t.integer :author_id
      t.string :sender_wallet_address
      t.string :name
      t.decimal :amount
      t.datetime :timestamp
      t.text :message
      t.string :tx_hash

      t.timestamps
    end
  end
end
