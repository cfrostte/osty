class CreateMovies < ActiveRecord::Migration[5.0]
	def change
		create_table :movies do |t|
			t.string :director
			t.integer :year
			t.string :name
			t.text :info
			t.text :img_url
			t.timestamps
		end
	end
end