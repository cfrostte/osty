class Busquedas < ActiveRecord::Migration[5.0]
  def change
  	create_table :busquedas do |t|
  		t.string :busquedas
  		t.timestamps
  	end
  end
end
