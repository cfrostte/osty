class Song < ApplicationRecord

	has_many :favorites, dependent: :destroy # Si la cancion se elimina el favorito tambien
	has_many :collaborations, dependent: :destroy # Si la cancion se elimina la colaboracion tambien

	validates :artist, presence: true
	validates :name, presence: true

	validates :artist, :uniqueness => {:scope => :name}
	validates :name, :uniqueness => {:scope => :artist}

end

