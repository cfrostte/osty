class CreateCollaborations < ActiveRecord::Migration[5.0]
  def change
    create_table :collaborations do |t|
      t.integer :idUser #Por si lo necesitamos
      t.string :idImdb, null: false, default: ""
      t.string :idSpotify, null: false, default: ""
      t.integer :state, null: false, default: 0
      t.references :user, index: true
      t.timestamps
    end
  end
end
