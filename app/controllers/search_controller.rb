class SearchController < ApplicationController
  def index
  	render layout: 'searchLayout'
  end
  def found
  	@q="query"
  end
end
