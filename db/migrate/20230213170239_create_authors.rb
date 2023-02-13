class CreateAuthors < ActiveRecord::Migration[7.0]
  def change
    create_table :authors do |t|
      t.string :name
      t.text :bio
      t.string :wallet_address
      t.decimal :balance

      t.timestamps
    end
  end
end
