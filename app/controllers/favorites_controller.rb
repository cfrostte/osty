class FavoritesController < ApplicationController
  before_action :set_favorite, only: [:show, :edit, :update, :destroy]

# El simbolo "'" da problemas al hacer JSON.parse(...)

  def favorited(item, type)

    artist = item['artist']
    name = item['name']

    if user_signed_in?

      favorites = current_user.favorites

      favorites.each do |f|

        if type=='song' && f.song

          are_equal = f.song.artist==artist && f.song.name==name
          
          if are_equal
            return are_equal
          end
        
        end

      end
      
    end

    return false

  end

  def add_song(item)

    if !user_signed_in?
      return false # added = false
    end
    
    album = item['album']
    artist = item['artist']
    name = item['name']
    info = item['info']
    image = item['image']

    img_url = image.last['#text']

    song = Song.where(artist: artist, name: name).take

    if song == nil
      song = Song.new
      song.album = album
      song.artist = artist
      song.name = name
      song.info = info
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
    
      if f.song.id==song.id
        f.destroy
        return false # added = false (quitted)
      end
    
    end

    return true # added = true (not quitted)

  end

  def check

    # La informacion que se retorna no es identica a la que se recibe

    collaboration = params[:collaboration]
    music = params[:music]
    film = params[:film]

    parsed_collaboration = JSON.parse(collaboration)
    parsed_music = JSON.parse(music)
    parsed_film = JSON.parse(film)

    checked_collaborations = parsed_collaboration.map do |m|
      {
        :id => m['id'],
        :state => m['state'],
        :user => m['user'],
        :song => m['song'],
        :movie => m['movie'],
        :favorited => false,
      }
    end

    checked_songs = parsed_music['results']['trackmatches']['track'].map do |m|
      {
        :id => -1, 
        :album => m['album'],
        :artist => m['artist'],
        :name => m['name'],
        :image => m['image'],
        :favorited => favorited(m, 'song'),
      }
    end

    checked_movies = parsed_film['results'].map do |m|
      {
        :id => -1,
        :release_date => m['release_date'],
        :original_title => m['original_title'],
        :favorited => false,
      }
    end

    response = {
      :collaboration => checked_collaborations,
      :music => checked_songs,
      :film => checked_movies,
    }

    render :json => response

  end

  def add

    item = JSON.parse(params[:item])
    type = params[:type]

    added = nil

    if favorited(item,type)

      if type=='song'
        added = quit_song(item)
      end
    
    else
    
      if type=='song'
        added = add_song(item)
      end
    
    end

    response = {
      :added => added,
    }
    
    render :json =>response
  
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