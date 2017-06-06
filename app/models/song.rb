class Song < ApplicationRecord

	has_many :favorites, dependent: :destroy # Si la cancion se elimina el favorito tambien
	has_many :collaborations, dependent: :destroy # Si la cancion se elimina la colaboracion tambien

	validates :artist, presence: true
	validates :name, presence: true

	validates :artist, :uniqueness => {:scope => :name}
	validates :name, :uniqueness => {:scope => :artist}

	def self.json_map(music, user_signed_in, current_user)
    
	    parsed = JSON.parse(music)
	    
	    mapped = parsed['results']['trackmatches']['track'].map do |m|

	    	album = Utility.formatted_sentence(m['album'])
	    	artist = Utility.formatted_sentence(m['artist'])
	    	name = Utility.formatted_sentence(m['name'])
	    	info = Utility.formatted_sentence(m['info'])

	    	img_url = m['image']

	    	if img_url
	    		img_url = m['image'].last['#text']
	    	end

	    	favorited = Favorite.exist_song(m, user_signed_in, current_user)

	    	{
	    		:album => album,
	    		:artist => artist,
	    		:name => name,
	    		:info => info,
	    		:img_url => img_url,
	    		:favorited => favorited,
	    	}

	    end

	    return mapped

	end

end
