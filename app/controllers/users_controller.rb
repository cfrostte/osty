class UsersController < ApplicationController
  def index
  end

  def profile

    if user_signed_in?
      
      @user = current_user
      @tipo = "Usuario comun"
  		
      if @user.isModerator
  			@tipo = "Usuario moderador"
  		end
  	
    else
  		
      redirect_to new_user_session_path
  	
    end
  
  end

  def hacerAdmin
    user=User.find(params[:id])
    user.isModerator=true
    user.save
    render :text => user.save    
  end
  
  def changeState
    collaboration=Collaboration.find(params[:id])
	Collaboration.where(song_id: collaboration.song.id, movie_id: collaboration.movie.id).each do |m|
    	m.state=params[:state]
    	m.save
    end
    redirect_to collaborations_path
  end

end
