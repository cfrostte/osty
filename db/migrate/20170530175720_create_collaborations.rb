class CreateCollaborations < ActiveRecord::Migration[5.0]
	def change
		create_table :collaborations do |t|
			t.string :songAlbum
			t.string :songArtist
			t.string :songName
			t.text :songInfo
			t.string :movieDirector
			t.integer :movieYear
			t.string :movieName
			t.text :movieInfo
			t.integer :state
			t.references :user, index: true
			t.timestamps
		end
	end
end
