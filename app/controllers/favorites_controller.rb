class FavoritesController < ApplicationController
  before_action :set_favorite, only: [:show, :edit, :update, :destroy]

  def check

    # La informacion que se retorna no es identica a la que se recibe

    collaboration = params[:collaboration]
    music = params[:music]
    film = params[:film]

    parsed_collaboration = JSON.parse(collaboration)
    parsed_music = JSON.parse(music)
    parsed_film = JSON.parse(film)

    checked_collaborations = map_collaboration(parsed_collaboration)
    checked_songs = map_music(parsed_music)
    checked_movies = map_film(parsed_film)

    response = {
      :collaboration => checked_collaborations,
      :music => checked_songs,
      :film => checked_movies,
    }

    render :json => response

  end

  def map_collaboration(parsed)
    
    mapped = parsed.map do |m|
      {
        :id => m['id'],
        :state => m['state'],
        :user => m['user'],
        :song => m['song'],
        :movie => m['movie'],
        :favorited => false,
      }
    end
    
    return mapped

  end

  def map_music(parsed)

    mapped = parsed['results']['trackmatches']['track'].map do |m|

      img_url = m['image']

      if img_url
        img_url = m['image'].last['#text']
      end

      {
        :album => m['album'],
        :artist => m['artist'],
        :name => m['name'],
        :img_url => img_url,
        :favorited => song_is_favorited(m),
      }
    
    end

    return mapped

  end

  def map_film(parsed)

    mapped = parsed['results'].map do |m|

      base = "https://image.tmdb.org/t/p/"
      size = "original"
      poster = m['poster_path']

      img_url = nil

      if poster
        img_url = base+size+poster
      end

      year = 0

      if m['release_date']
        year = m['release_date'].split('-').first.to_i
      end 
      
      {
        :director => m['director'],
        :year => year,
        :name => m['original_title'],
        :img_url => img_url,
        :favorited => movie_is_favorited(m),
      }
    
    end

    return mapped

  end

# El simbolo "'" da problemas al hacer JSON.parse(...)

  def song_is_favorited(song)

    artist = song['artist']
    name = song['name']

    if user_signed_in?

      current_user.favorites.each do |f|

        if f.song

          are_equal = f.song.artist==artist && f.song.name==name

          if are_equal
            return are_equal
          end

        end

      end

    end

    return false

  end

  def movie_is_favorited(movie)

    year = 0

    if movie['release_date']
      year = movie['release_date'].split('-').first.to_i
    end

    name = movie['original_title']

    if user_signed_in?

      current_user.favorites.each do |f|

        if f.movie

          are_equal = f.movie.year==year && f.movie.name==name

          if are_equal
            return are_equal
          end

        end

      end

    end

    return false

  end

  def add

    item = JSON.parse(params[:item])
    type = params[:type]

    added = nil

    if type=='song'

      if song_is_favorited(item)
        added = quit_song(item)
      else
        added = add_song(item)
      end
    
    end

    if type=='movie'
    
      if movie_is_favorited(item)
        added = quit_movie(item)
      else
        added = add_movie(item)
      end

    end

    response = {
      :added => added,
    }
    
    render :json =>response
  
  end

  def add_song(item)

    if !user_signed_in?
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

  def quit_song(item)

    if !user_signed_in?
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

  def add_movie(item)

    if !user_signed_in?
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

  def quit_movie(item)

    if !user_signed_in?
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

  # GET /favorites
  # GET /favorites.json
  def index
    # @favorites = Favorite.all
    if user_signed_in?
      @favorites = current_user.favorites
    else
      redirect_to new_user_session_path
    end
  end

  # GET /favorites/1
  # GET /favorites/1.json
  def show
  end

  # GET /favorites/new
  def new
    @favorite = Favorite.new
  end

  # GET /favorites/1/edit
  def edit
  end

  # POST /favorites
  # POST /favorites.json
  def create
    @favorite = Favorite.new(favorite_params)

    respond_to do |format|
      if @favorite.save
        format.html { redirect_to @favorite, notice: 'Favorite was successfully created.' }
        format.json { render :show, status: :created, location: @favorite }
      else
        format.html { render :new }
        format.json { render json: @favorite.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /favorites/1
  # PATCH/PUT /favorites/1.json
  def update
    respond_to do |format|
      if @favorite.update(favorite_params)
        format.html { redirect_to @favorite, notice: 'Favorite was successfully updated.' }
        format.json { render :show, status: :ok, location: @favorite }
      else
        format.html { render :edit }
        format.json { render json: @favorite.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /favorites/1
  # DELETE /favorites/1.json
  def destroy
    @favorite.destroy
    respond_to do |format|
      format.html { redirect_to favorites_url, notice: 'Favorito quitado.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_favorite
      @favorite = Favorite.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def favorite_params
      params.fetch(:favorite, {})
    end
end