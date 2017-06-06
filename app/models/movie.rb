class Movie < ApplicationRecord

	has_many :favorites, dependent: :destroy # Si la pelicula se elimina el favorito tambien
	has_many :collaborations, dependent: :destroy # Si la pelicula se elimina la colaboracion tambien

	validates :year, presence: true
	validates :name, presence: true

	validates :year, :uniqueness => {:scope => :name}
	validates :name, :uniqueness => {:scope => :year}

	def self.json_map(film, user_signed_in, current_user)
    
	    parsed = JSON.parse(film)
	    
	    mapped = parsed['results'].map do |m|

	    	director = Utility.formatted_sentence(m['director'])
      		year = Utility.formatted_year(m['release_date'])
      		name = Utility.formatted_sentence(m['original_title'])
      		info = Utility.formatted_sentence(m['info'])

		    base = "https://image.tmdb.org/t/p/"
		    size = "original"
		    poster = m['poster_path']

		    img_url = nil

		    if poster
		    	img_url = base+size+poster
		    end

		    favorited = Favorite.exist_movie(year, name, user_signed_in, current_user)

		    {
		    	:director => director,
		        :year => year,
		        :name => name,
		        :info => info,
		        :img_url => img_url,
		        :favorited => favorited,
		    }

		end

		return mapped

	end

end
