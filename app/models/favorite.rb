class Favorite < ApplicationRecord

	belongs_to :user

	validates :idApi, presence: true
	validates :kind, presence: true

	validates :user, :uniqueness => {:scope => :idApi}
	validates :idApi, :uniqueness => {:scope => :user}

end
