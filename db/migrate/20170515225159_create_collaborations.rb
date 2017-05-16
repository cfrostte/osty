class CreateCollaborations < ActiveRecord::Migration[5.0]
  def change
    create_table :collaborations do |t|
      t.integer :idUser
      t.string :idImdb
      t.string :idSpotify
      t.integer :state

      t.timestamps
    end
  end
end
