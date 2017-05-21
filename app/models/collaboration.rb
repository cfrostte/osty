class Collaboration < ApplicationRecord
	
	belongs_to :user

	validates :idImdb, presence: true
	validates :idSpotify, presence: true
	validates :state, presence: true

	validates :user, :uniqueness => {:scope => :idImdb}
	validates :idImdb, :uniqueness => {:scope => :user}
	
	validates :user, :uniqueness => {:scope => :idSpotify}
	validates :idSpotify, :uniqueness => {:scope => :user}
	
	validates :idImdb, :uniqueness => {:scope => :idSpotify}
	validates :idSpotify, :uniqueness => {:scope => :idImdb}

end