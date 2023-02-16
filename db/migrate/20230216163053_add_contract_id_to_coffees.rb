class AddContractIdToCoffees < ActiveRecord::Migration[7.0]
  def change
    add_column :coffees, :contract_id, :integer
    # remove_column :coffees, :timestamp
    remove_column :coffees, :timestamp
  end
end
