class FavoritesController < ApplicationController
  before_action :set_favorite, only: [:show, :edit, :update, :destroy]

  # Ocurre ANTES de interactuar con los resultados de la busqueda:

  def check

    response = {
      :collaboration => Collaboration.json_map(params[:collaboration]),
      :music => Song.json_map(params[:music], user_signed_in?, current_user),
      :film => Movie.json_map(params[:film], user_signed_in?, current_user),
    }

    render :json => response

  end

  # Ocurre DESPUES de interactuar con los resultados de la busqueda

  def add

    item = params[:item]
    type = params[:type]

    added = nil

    if type=='song'

      if Favorite.exist_song(item, user_signed_in?, current_user)
        added = Song.quit_favorite(item, user_signed_in?, current_user)
      else
        added = Song.add_favorite(item, user_signed_in?, current_user)
      end
    
    end

    if type=='movie'

      year = item['year']
      name = item['name']

      if Favorite.exist_movie(year, name, user_signed_in?, current_user)
        added = Movie.quit_favorite(item, user_signed_in?, current_user)
      else
        added = Movie.add_favorite(item, user_signed_in?, current_user)
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