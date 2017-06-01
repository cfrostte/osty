class SearchController < ApplicationController
	def index
	end
#   def index
#   	render layout: 'searchLayout'
#   end
  def found
  	@q="query"
  end
end
