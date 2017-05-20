class PagesController < ApplicationController
	
	# layout "pages"

	def index
	end

	def show
		render template: "pages/#{params[:page]}"
	end

	def profile

		if !user_signed_in?
			redirect_to new_user_session_path
		end

	end

end