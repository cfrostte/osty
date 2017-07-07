class Song < ApplicationRecord

	require 'utilities'

	# Si la cancion se elimina el favorito tambien:
	has_many :favorites, dependent: :destroy
	# Si la cancion se elimina la colaboracion tambien:
	has_many :collaborations, dependent: :destroy

	validates :artist, presence: true
	validates :name, presence: true

	validates :artist, :uniqueness => {:scope => :name}
	validates :name, :uniqueness => {:scope => :artist}

	def self.construct(album, artist, name, info, img_url)

		song = Song.new

		song.album = album
		song.artist = artist
		song.name = name
		song.info = info
		song.img_url = img_url

		return song

	end

	def self.random()

		artist = SecureRandom.hex(8)
		name = SecureRandom.hex(8)

		song = Song.construct(nil, artist, name, nil, nil)
		song.save

		return song

	end

	def self.json_map(music, user_signed_in, current_user)

		parsed = JSON.parse(music)

		mapped = parsed['results']['trackmatches']['track'].map do |m|

			album = Utilities.formatted_sentence(m['album'])
			artist = Utilities.formatted_sentence(m['artist'])
			name = Utilities.formatted_sentence(m['name'])
			info = Utilities.formatted_sentence(m['info'])

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

	def self.add_favorite(item, user_signed_in, current_user)

		if !user_signed_in
			return false # added = false
		end

		album = item['album']
		artist = item['artist']
		name = item['name']
		info = item['info']
		img_url = item['img_url']

		song = Song.where(artist: artist, name: name).take

		if song == nil

			song = Song.new

			song.album = album
			song.artist = artist
			song.name = name
			song.info = info
			song.img_url = img_url

			song.save

		end

		current_user.favorites.create(song: song)

		return true # added = true

	end

	def self.quit_favorite(item, user_signed_in, current_user)

		if !user_signed_in
			return true # added = true (not quitted)
		end

		artist = item['artist']
		name = item['name']

		song = Song.where(artist: artist, name: name).take

		current_user.favorites.each do |f|

			if f.song && f.song.id==song.id
				f.destroy
				return false # added = false (quitted)
			end

		end

		return true # added = true (not quitted)

	end

	def self.for_collaboration(from_this_item)

		album = from_this_item['album']
		artist = from_this_item['artist']
		name = from_this_item['name']
		info = from_this_item['info']
		img_url = from_this_item['img_url']

		song = Song.where(artist: artist, name: name).take

		if song == nil
			song = Song.construct(album, artist, name, info, img_url)
			saved = song.save
		end

		return song

	end

	def self.id_hash(to_this_items)

		parsed = JSON.parse(to_this_items)
		
		processed = parsed.map do |m|

		    album = m['album']
		    artist = m['artist']
		    name = m['name']
		    info = m['info']
		    img_url = m['img_url']

		    song = Song.where(artist: artist, name: name).take

		    if song == nil
		    	song = Song.construct(album, artist, name, info, img_url)
		    	song.save
		    end

			{ :id => song.id }

		end

		return processed
	
	end

end
