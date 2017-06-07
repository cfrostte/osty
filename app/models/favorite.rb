class Favorite < ApplicationRecord

	require 'utilities'

	belongs_to :user
	
	belongs_to :collaboration, optional: true
	belongs_to :song, optional: true
	belongs_to :movie, optional: true

	def self.exist_song(song, user_signed_in, current_user)

		artist = Utilities.formatted_sentence(song['artist'])
		name = Utilities.formatted_sentence(song['name'])

		if user_signed_in

			current_user.favorites.each do |f|

				if f.song && f.song.artist==artist && f.song.name==name
					return true
				end

			end

		end

		return false

	end

	def self.exist_movie(year, name, user_signed_in, current_user)

		if user_signed_in

			current_user.favorites.each do |f|

				if f.movie && f.movie.year==year && f.movie.name==name
					return true
				end

			end

		end

		return false

	end

end