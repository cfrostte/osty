class SearchController < ApplicationController

	def index
	end
	
	def all
		@collaborations = Collaboration.all
		@favorites = Favorite.all
		@movies = Movie.all
		@songs = Song.all
		@users = User.all
	end

end