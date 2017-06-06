class Movie < ApplicationRecord

	# Si la pelicula se elimina el favorito tambien:
	has_many :favorites, dependent: :destroy
	# Si la pelicula se elimina la colaboracion tambien:
	has_many :collaborations, dependent: :destroy

	validates :year, presence: true
	validates :name, presence: true

	validates :year, :uniqueness => {:scope => :name}
	validates :name, :uniqueness => {:scope => :year}

	def self.construct(director, year, name, info, img_url)

		movie = Movie.new

		movie.director = director
		movie.year = year
		movie.name = name
		movie.info = info
		movie.img_url = img_url

		return movie

	end

	def self.random()

		year = rand(2017-1917) + 1917 # 1917 < year < 2017
		name = SecureRandom.hex(8)

		movie = Movie.construct(nil, year, name, nil)
		movie.save

		return movie

	end

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

	def self.add_favorite(item, user_signed_in, current_user)

		if !user_signed_in
			return false # added = false
		end

		director = item['director']
		year = item['year']
		name = item['name']
		info = item['info']
		img_url = item['img_url']

		movie = Movie.where(year: year, name: name).take

		if movie == nil

			movie = Movie.new

			movie.director = director
			movie.year = year
			movie.name = name
			movie.info = info
			movie.img_url = img_url

			movie.save

		end

		current_user.favorites.create(movie: movie)

		return true # added = true

	end

	def self.quit_favorite(item, user_signed_in, current_user)

		if !user_signed_in
			return true # added = true (not quitted)
		end

		year = item['year']
		name = item['name']

		movie = Movie.where(year: year, name: name).take

		current_user.favorites.each do |f|

			if f.movie && f.movie.id==movie.id
				f.destroy
				return false # added = false (quitted)
			end

		end

		return true # added = true (not quitted)

	end

	def self.id_hash(to_this_items)

		parsed = JSON.parse(to_this_items)
		
		processed = parsed.map do |m|

		    director = m['director']
		    year = m['year']
		    name = m['name']
		    info = m['info']
		    img_url = m['img_url']

		    movie = Movie.where(year: year, name: name).take

		    if movie == nil
		    	movie = Movie.construct(director, year, name, info, img_url)
		    	movie.save
		    end

			{ :id => movie.id }

		end

		return processed
	
	end

end
