class Movie < ApplicationRecord

	validates :year, presence: true
	validates :name, presence: true

	validates :year, :uniqueness => {:scope => :name}
	validates :name, :uniqueness => {:scope => :year}

end
