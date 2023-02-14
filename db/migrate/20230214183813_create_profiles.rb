class CreateProfiles < ActiveRecord::Migration[7.0]
  def change
    create_table :profiles do |t|
      t.string :name
      t.string :slug
      t.text :bio
      t.string :wallet_address

      t.timestamps
    end
  end
end
