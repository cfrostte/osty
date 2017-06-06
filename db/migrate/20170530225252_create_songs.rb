class CreateSongs < ActiveRecord::Migration[5.0]
	def change
		create_table :songs do |t|
			t.string :album
			t.string :artist
			t.string :name
			t.text :info
			t.text :img_url
			t.timestamps
		end
	end
end
