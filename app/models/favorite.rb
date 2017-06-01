class Favorite < ApplicationRecord
	
	belongs_to :user
	
	belongs_to :collaboration, optional: true
	belongs_to :song, optional: true
	belongs_to :movie, optional: true

	validates :user, :uniqueness => {:scope => :collaboration}
	validates :collaboration, :uniqueness => {:scope => :user}

	validates :user, :uniqueness => {:scope => :song}
	validates :song, :uniqueness => {:scope => :user}
	
	validates :user, :uniqueness => {:scope => :movie}
	validates :movie, :uniqueness => {:scope => :user}

end