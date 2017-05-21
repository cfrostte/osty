class UsersController < ApplicationController
  def index
  end
  def profile
  	if user_signed_in?
  		@user = current_user
  		@tipo = "Usuario comun"
  		if @user.isModerator===true
  			@tipo = "Usuario moderador"
  		end
  	else
  		redirect_to new_user_session_path
  	end
  end
end
