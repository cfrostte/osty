class CollaborationsController < ApplicationController
  before_action :set_collaboration, only: [:show, :edit, :update, :destroy]

  def search

    query = params['query']
    movie_year = params['query'].to_i

    if query=='random'
      Collaboration.random(current_user)
    end
	
	# SELECT a.id, a.state, a.user_id, a.song_id, a.movie_id
	
	# FROM (
		
	# 	SELECT song_id, movie_id FROM "collaborations"
	# 	INNER JOIN "songs" ON "songs"."id" = "collaborations"."song_id"
	# 	INNER JOIN "movies" ON "movies"."id" = "collaborations"."movie_id"
		
	# 	WHERE (
	# 		songs.artist LIKE ?
	# 		OR songs.name LIKE ?
	# 		OR movies.name LIKE ?
	# 		OR movies.year = ?
	# 	)
		
	# 	AND (state = 1) GROUP BY song_id, movie_id
	
	# )

	# g INNER JOIN collaborations a WHERE (a.song_id=g.song_id) AND (a.movie_id=g.movie_id)
    
	collaborations = Collaboration.select('a.id, a.state, a.user_id, a.song_id, a.movie_id').
	
	from(
		
		Collaboration.joins(:song, :movie).select('song_id, movie_id').
    	
    	where(
    		"songs.artist LIKE ? OR songs.name LIKE ? OR movies.name LIKE ? OR movies.year = ?",
    		"%#{query}%", "%#{query}%", "%#{query}%", "#{movie_year}"
    	).

    	where("state = ?", 1).group("song_id, movie_id"), :g
    
    ).

    joins('INNER JOIN collaborations a ON a.song_id=g.song_id AND a.movie_id=g.movie_id')

    render :json => Collaboration.ruby_map(collaborations)
  
  end

  def from_song

  	from_this_item = params[:from_this_item]
  	to_this_items = params[:to_this_items]

  	if current_user
  		song = Song.for_collaboration(from_this_item)
  		movie_ids = Movie.id_hash(to_this_items)
  		collaboration_ids = Collaboration.from_song(song, movie_ids, current_user)
  		response = {:all_were_made => movie_ids.length==collaboration_ids.length}
  	else
  		response = {:not_logged => true}
  	end

  	render :json => response

  end

  def from_movie

  	from_this_item = params[:from_this_item]
  	to_this_items = params[:to_this_items]

  	if current_user
  		movie = Movie.for_collaboration(from_this_item)
  		song_ids = Song.id_hash(to_this_items)
  		collaboration_ids = Collaboration.from_movie(movie, song_ids, current_user)
  		response = {:all_were_made => song_ids.length==collaboration_ids.length}
  	else
  		response = {:not_logged => true}
  	end

  	render :json => response

  end

  # GET /collaborations
  # GET /collaborations.json
  def index
    if user_signed_in?
      @collaborations = current_user.collaborations
      @allColaborations =nil
      if current_user.isModerator
      @allColaborations =Collaboration.where(state: 0)
      end 
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
