class Favorite < ApplicationRecord
	
	belongs_to :user
	
	belongs_to :collaboration, optional: true
	belongs_to :song, optional: true
	belongs_to :movie, optional: true

end