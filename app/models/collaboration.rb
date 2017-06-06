class Collaboration < ApplicationRecord

	belongs_to :user
	belongs_to :song
	belongs_to :movie

	validates_uniqueness_of :user, scope: [:song, :movie]
	validates_uniqueness_of [:song, :movie], scope: :user

	def self.random(current_user)

	    collaboration = Collaboration.new
	    song = Song.new
	    movie = Movie.new

	    song.artist = SecureRandom.hex(8)
	    song.name = SecureRandom.hex(8)

	    song.save

	    movie.year = rand(2017-1917) + 1917 # 1917 < year < 2017
	    movie.name = SecureRandom.hex(8)

	    movie.save

	    collaboration.user = current_user
	    collaboration.song = song
	    collaboration.movie = movie

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

end