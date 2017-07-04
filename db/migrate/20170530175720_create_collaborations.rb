class CreateCollaborations < ActiveRecord::Migration[5.0]
	def change
		create_table :collaborations do |t|
			t.integer :state, default: 0
			t.references :user, index: true
			t.references :song, index: true
			t.references :movie, index: true
			t.timestamps
		end
	end
end
