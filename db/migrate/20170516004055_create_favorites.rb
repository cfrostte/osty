class CreateFavorites < ActiveRecord::Migration[5.0]
  def change
    create_table :favorites do |t|
      t.integer :idUser
      t.string :idApi
      t.integer :kind

      t.timestamps
    end
  end
end
