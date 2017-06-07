class CollaborationsController < ApplicationController
  before_action :set_collaboration, only: [:show, :edit, :update, :destroy]

  def search

    query = params['query']

    if query=='random'
      Collaboration.random(current_user)
    end

    collaborations = Collaboration.all # Buscar, no retornar todas
    
    found = Collaboration.ruby_map(collaborations)

    render :json => found
  
  end

  def from_song

    from_this_item = params[:from_this_item]
    to_this_items = params[:to_this_items]

    song = nil
    movie_ids = nil
    collaboration = nil

    if current_user
      song = Song.for_collaboration(from_this_item)
      movie_ids = Movie.id_hash(to_this_items)
      collaborations = Collaboration.from_song(song, movie_ids, current_user)
    end

    response = {
      :song => song,
      :movie_ids => movie_ids,
      :collaborations => collaborations,
      :current_user => current_user,
    }

    render :json => response

  end

  def from_movie
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
