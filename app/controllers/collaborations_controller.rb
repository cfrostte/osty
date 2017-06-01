class CollaborationsController < ApplicationController
  before_action :set_collaboration, only: [:show, :edit, :update, :destroy]

  def search
    
    @collaborations = Collaboration.all

    @found = @collaborations.map do |c|
      { :id => c.id,
        :state => c.state,
        # Se prueba enviar lo que llega:
        :music => params[:music], 
        :film => params[:film]
      }
    end

    render :json => @found.to_json
  
  end

  def from_song

    @album = params[:album]
    @artist = params[:artist]
    @name = params[:name]
    @info = params[:info]
    @image = params[:image]

    @img_url = @image.last['#text']

    @song = Song.where(artist: @artist, name: @name).take

    @found = (@song != nil)
    @saved = false

    if @song == nil
      @song = Song.new
      @song.album = @album
      @song.artist = @artist
      @song.name = @name
      @song.info = @info
      @saved = @song.save
    end

    @response = {
      :found => @found,
      :saved => @saved,
      :id => @song.id,
      :album => @song.album,
      :artist => @song.artist,
      :name => @song.name,
      :info => @song.info,
      :img_url => @img_url,
      :songs => Song.all
    }

    render :json => @response.to_json

  end

  def from_movie
  end

  # GET /collaborations
  # GET /collaborations.json
  def index
    @collaborations = Collaboration.all
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
