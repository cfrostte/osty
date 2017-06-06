class Collaboration < ApplicationRecord

	belongs_to :user
	belongs_to :song
	belongs_to :movie

	validates_uniqueness_of :user, scope: [:song, :movie]

	# Si activo esta validacion, el usuario puede colaborar una sola vez:
	# validates_uniqueness_of [:song, :movie], scope: :user
	# Porque pasa eso?

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

		movie_ids.map do |m|
			movie = Movie.find_by(id: m[:id])
			collaborations.create(song: song, movie: movie)
		end
		
		return collaborations		
	
	end

end
