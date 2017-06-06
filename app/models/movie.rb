class Movie < ApplicationRecord

	has_many :favorites, dependent: :destroy # Si la pelicula se elimina el favorito tambien
	has_many :collaborations, dependent: :destroy # Si la pelicula se elimina la colaboracion tambien

	validates :year, presence: true
	validates :name, presence: true

	validates :year, :uniqueness => {:scope => :name}
	validates :name, :uniqueness => {:scope => :year}

end