class Collaboration < ApplicationRecord

	belongs_to :user
	belongs_to :song
	belongs_to :movie

	validates_uniqueness_of :user, scope: [:song, :movie]

	def self.random(current_user)

		collaboration = Collaboration.new

		collaboration.user = current_user
		collaboration.song = Song.random()
		collaboration.movie = Movie.random()

		collaboration.save

		return collaboration

	end

	def self.ruby_map(collaborations)

		return collaborations.map do |c|
			{
				:id => c.id,
				:state => c.state,
				:user => c.user,
				:song => c.song,
				:movie => c.movie,
			}
		end

	end

	def self.json_map(collaboration)

		return JSON.parse(collaboration).map do |m|
			{
				:id => m['id'],
				:state => m['state'],
				:user => m['user'],
				:song => m['song'],
				:movie => m['movie'],
				:favorited => false,
			}
		end

	end

	def self.from_song(song, movie_ids, current_user)

		collaborations = current_user.collaborations

		collaboration_ids = movie_ids.map do |m|
			movie = Movie.find_by(id: m[:id])
			c = collaborations.create(song: song, movie: movie)
			{ :id => c.id }
		end
		
		return collaboration_ids		
	
	end

	def self.from_movie(movie, song_ids, current_user)

		collaborations = current_user.collaborations

		collaboration_ids = song_ids.map do |m|
			song = Song.find_by(id: m[:id])
			c = collaborations.create(song: song, movie: movie)
			{ :id => c.id }
		end
		
		return collaboration_ids		
	
	end

end
