class CreateFavorites < ActiveRecord::Migration[5.0]
	def change
		create_table :favorites do |t|
			t.references :user, index: true
			t.references :collaboration, index: true
			t.references :song, index: true
			t.references :movie, index: true
			t.timestamps
		end
	end
end
