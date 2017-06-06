class FavoritesController < ApplicationController
  before_action :set_favorite, only: [:show, :edit, :update, :destroy]

  # Ocurren ANTES de interactuar con los resultados de la busqueda:

  def check

    response = {
      :collaboration => Collaboration.json_map(params[:collaboration]),
      :music => Song.json_map(params[:music], user_signed_in?, current_user),
      :film => Movie.json_map(params[:film], user_signed_in?, current_user),
    }

    render :json => response

  end


  # Ocurren DESPUES de interactuar con los resultados de la busqueda

  def add

    item = params[:item]
    type = params[:type]

    added = nil

    if type=='song'

      if Favorite.exist_song(item, user_signed_in?, current_user)
        added = quit_song(item)
      else
        added = add_song(item)
      end
    
    end

    if type=='movie'

      year = item['year']
      name = item['name']

      if Favorite.exist_movie(year, name, user_signed_in?, current_user)
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