class Collaboration < ApplicationRecord
	
	belongs_to :user
	belongs_to :song
	belongs_to :movie

	validates_uniqueness_of :user, scope: [:song, :movie]
	validates_uniqueness_of [:song, :movie], scope: :user

end