class CollaborationsController < ApplicationController
  before_action :set_collaboration, only: [:show, :edit, :update, :destroy]

  def search

    query = params['query']

    #######################################################

    if query=='crear colaboracion'

      c1 = Collaboration.new
      s1 = Song.new
      m1 = Movie.new

      s1.artist = SecureRandom.hex(8)
      s1.name = SecureRandom.hex(8)

      s1.save

      m1.year = rand(2017-1917) + 1917 # 1917 < year < 2017

      m1.name = SecureRandom.hex(8)

      m1.save

      c1.user = current_user
      c1.song = s1
      c1.movie = m1

      c1.save

    end

    #######################################################
    
    collaborations = Collaboration.all # Buscar, no retornar todas

    found = collaborations.map do |c|
      {
        :id => c.id,
        :state => c.state,
        :user => c.user,
        :song => c.song,
        :movie => c.movie,
      }
    end

    render :json => found
  
  end

  def from_song

    album = params[:album]
    artist = params[:artist]
    name = params[:name]
    info = params[:info]
    img_url = params[:img_url]

    song = Song.where(artist: artist, name: name).take

    found = (song != nil)
    saved = false

    if song == nil
      song = Song.new
      song.album = album
      song.artist = artist
      song.name = name
      song.info = info
      song.img_url = img_url
      saved = song.save
    end

    response = {
      :found => found,
      :saved => saved,
      :song => song,
    }

    render :json => response

  end

  def to_movies

    #... para cada pelicula (si no existe, se crea),
    # se crea una colaboracion con esa cancion

    id_song = params[:id]
    movies = params[:movies] #El json con las pelis

    song = Song.find_by_id(id_song)

    response = {
      :song => song,
      :collaborations => Collaboration.all, # Se deben retornar las creadas
    }

    render :json => response

  end

  def from_movie
  end

  def to_songs
  end

  # GET /collaborations
  # GET /collaborations.json
  def index
    # @collaborations = Collaboration.all
    if user_signed_in?
      @collaborations = current_user.collaborations
    else
      redirect_to new_user_session_path
    end
  end

  # GET /collaborations/1
  # GET /collaborations/1.json
  def show
  end

  # GET /collaborations/new
  def new
    @collaboration = Collaboration.new
  end

  # GET /collaborations/1/edit
  def edit
  end

  # POST /collaborations
  # POST /collaborations.json
  def create
    @collaboration = Collaboration.new(collaboration_params)

    respond_to do |format|
      if @collaboration.save
        format.html { redirect_to @collaboration, notice: 'Collaboration was successfully created.' }
        format.json { render :show, status: :created, location: @collaboration }
      else
        format.html { render :new }
        format.json { render json: @collaboration.errors, status: :unprocessable_entity }
      end
    end
  end

  def create_song
    @song = Song.new(song_params)
    
  end

  # PATCH/PUT /collaborations/1
  # PATCH/PUT /collaborations/1.json
  def update
    respond_to do |format|
      if @collaboration.update(collaboration_params)
        format.html { redirect_to @collaboration, notice: 'Collaboration was successfully updated.' }
        format.json { render :show, status: :ok, location: @collaboration }
      else
        format.html { render :edit }
        format.json { render json: @collaboration.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /collaborations/1
  # DELETE /collaborations/1.json
  def destroy
    @collaboration.destroy
    respond_to do |format|
      format.html { redirect_to collaborations_url, notice: 'Collaboration was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_collaboration
      @collaboration = Collaboration.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def collaboration_params
      params.fetch(:collaboration, {})
    end
end
