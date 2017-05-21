class CreateFavorites < ActiveRecord::Migration[5.0]
  def change
    create_table :favorites do |t|
      t.integer :idUser #Por si lo necesitamos
      t.string :idApi, null: false, default: ""
      t.integer :kind, null: false, default: 0
      t.references :user, index: true
      t.timestamps
    end
  end
end
