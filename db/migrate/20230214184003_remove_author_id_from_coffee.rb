class RemoveAuthorIdFromCoffee < ActiveRecord::Migration[7.0]
  def change
    remove_column :coffees, :author_id, :integer
    add_column :coffees, :profile_id, :integer
  end
end
