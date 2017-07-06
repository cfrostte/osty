var protocol = window.location.protocol;
var host = window.location.host;

var key_music = "4268ad0746656798a6616f4bbac67dd1"; //Last.fm
var key_film = "22f58faad6207b2f0dcf3068cc50bb74"; //The Movie Database

var array_collaboration = null;
var array_music = null;
var array_film = null;

var array_to_songs = null;
var array_to_movies = null;

var collaboration = "<span class='glyphicon glyphicon-play-circle'></span>";
var music = "<span class='glyphicon glyphicon-music'></span>";
var film = "<span class='glyphicon glyphicon-film'></span>";

var loading = "<center><img src='/img/loading.gif' alt='loading...'></center>";

var sub_url_music = "https://ws.audioscrobbler.com/2.0/?method=track.search&format=json&api_key="+key_music;
var sub_url_film = "https://api.themoviedb.org/3/search/movie?api_key="+key_film;

var public_query = null;
var public_page = null;

$( document ).on('turbolinks:load', function() {

	var input_q = document.getElementById("q");

	if (input_q) input_q.addEventListener("change", function () {
		
		if (input_q.value) {
			search(input_q.value, 1);
		}
		
	});

});

function search(query, page) {

	document.getElementById("found").innerHTML = loading;

	public_query = query;
	public_page = page;

	var url_collaboration = protocol+"//"+host+"/collaborations/search";
	var url_music = sub_url_music+"&track="+query+"&page="+page;
	var url_film = sub_url_film+"&query="+query+"&page="+page;

	var url_check_favorites = protocol+"//"+host+"/favorites/check";
	
	var response_collaboration = null;
	var response_music = null;
	var response_film = null;

	var queue_count = 0;

	var total = 3;

	var settings_collaboration = {
		"async": true,
		"contentType": 'application/json; charset=utf-8',
		"data": JSON.stringify({"query":query}),
		"dataType": 'json',
		"type": 'POST',
		"url": url_collaboration,
	}

	var settings_music = {
		"crossDomain": true,
		"data": "",
		"dataType": 'json',
		"type": 'GET',
		"url": url_music,
	}

	var settings_film = {
		"async": true,
		"crossDomain": true,
		"data": "",
		"headers": {},
		"method": "GET",
		"url": url_film,
	}

	$.ajax(settings_collaboration).done(function (response) {
		
		response_collaboration = response;
		queue_count+=1;
		
		if (queue_count==total) final_call();

	});

	$.ajax(settings_music).done(function (response) {
		
		response_music = response;
		queue_count+=1;
		
		if (queue_count==total) final_call();

	});

	$.ajax(settings_film).done(function (response) {
		
		response_film = response;
		queue_count+=1;

		if (queue_count==total) final_call();

	});

	function final_call() {

		var data = {
			"collaboration": JSON.stringify(response_collaboration),
			"music": JSON.stringify(response_music),
			"film": JSON.stringify(response_film),
		};
		
		var settings_check_favorites = {
			"data": data,
			"dataType": 'json',
			"type": 'POST',
			"url": url_check_favorites,
		}

		$.ajax(settings_check_favorites).done(function (response) {
			
			document.getElementById("found").innerHTML = "";
			document.getElementById("actual").innerHTML = "";
			document.getElementById("pages").innerHTML = "";

			var found_collaborations = false;
			var found_music = false;
			var found_film = false;

			found_collaborations = populateCollaboration(response.collaboration);
			found_music = populateMusic(response.music);
			found_film = populateFilm(response.film);

			if (public_page>1 && (found_collaborations||found_music||found_film)) {
				
				document.getElementById("actual").innerHTML = "<hr>Página "+public_page+"<hr>";
			
			} else {
			
				document.getElementById("actual").innerHTML = "<hr>";
			
			}

			if (found_collaborations||found_music||found_film) paginate();
		
		});

	}

}

function populateCollaboration(response) {

	array_collaboration = response;

	var content = "";
	var array = response;
	var l = array.length;

	for (i=0; i<l; i++) {

		var it = array[i];
		
		var info = it.song.artist+" - "+it.song.name+" ("+it.movie.name+" "+it.movie.year+")";

		var osty = "#";
		var link = "<a target='_blank' href='"+osty+"'>"+info+"</a>";

		content += "<p>"+collaboration+" "+link+"</p>";

	}

	document.getElementById("found").innerHTML += content;

	return (l>0);

}

function populateMusic(response) {

	array_music = response;

	var content = "";
	var array = response;
	var l = array.length;

	for (i=0; i<l; i++) {

		var it = array[i];
		var info = it.artist+" - "+it.name;
		var href = "https://open.spotify.com/search/songs/"+info+"";
		var link = "<a target='_blank' href='"+href+"'>"+info+"</a>";

		var cooperate = "<span onclick='chooseFrom(this, "+i+")'"+
		"type='song' class='modal_song glyphicon glyphicon-send'></span>";

		var star = "glyphicon glyphicon-star-empty";

		if (it.favorited) star = "glyphicon glyphicon-star";

		var add = "<span onclick='addToFavorites(this, "+i+")'"+
		"type='song' class='"+star+"'></span>";

		content += "<p>"+music+" "+link+" "+cooperate+" "+add+"</p>";
			
	}

	document.getElementById("found").innerHTML += content;

	return (l>0);

}

function populateFilm(response) {

	array_film = response;

	var content = "";
	var array = response;
	var l = array.length;

	for (i=0; i<l; i++) {

		var it = array[i];
		var info = it.name+" ("+it.year+")";
		var href = "http://www.imdb.com/find?&q="+it.name+"&s=tt";
		var link = "<a target='_blank' href='"+href+"'>"+info+"</a>";

		var cooperate = "<span onclick='chooseFrom(this, "+i+")'"+
		"type='movie' class='glyphicon glyphicon-send'></span>";

		var star = "glyphicon glyphicon-star-empty";

		if (it.favorited) star = "glyphicon glyphicon-star";

		var add = "<span onclick='addToFavorites(this, "+i+")'"+
		"type='movie' class='"+star+"'></span>";

		content += "<p>"+film+" "+link+" "+cooperate+" "+add+"</p>";

	}

	document.getElementById("found").innerHTML += content;

	return (l>0);

}

function addToFavorites(which, i) {

	var item = null;
	var type = which.getAttribute('type');
	
	if (type=='song') {
		item = array_music[i];
	}

	if (type=='movie') {
		item = array_film[i];
	}

	var json = {
		"item" : item,
		"type" : type,
	};
	
	var data = JSON.stringify(json);

	var url = protocol+"//"+host+"/favorites/add";

	var settings = {
		"async": true,
		"contentType": 'application/json; charset=utf-8',
		"data": data,
		"dataType": 'json',
		"type": 'POST',
		"url": url,
	}

	$.ajax(settings).done(function (response) {

		if (response.added) which.setAttribute('class','glyphicon glyphicon-star');
		else which.setAttribute('class','glyphicon glyphicon-star-empty');
	
	});

}

function chooseFrom(which, i) {
	
	var type = which.getAttribute('type');

	// Get the modal
	var modal = document.getElementById('myModal');

	// Get the <span> element that closes the modal
	var span = document.getElementsByClassName("close")[0];

	// When the user clicks on <span> (x), close the modal
	span.onclick = function() {
		modal.style.display = "none";
	}

	// When the user clicks anywhere outside of the modal, close it
	window.onclick = function(event) {

		if (event.target == modal) {
			modal.style.display = "none";
		}
	
	}

	modal_q = document.getElementById('modal_q');

	modal_q.addEventListener("change", function () {
	
		if (modal_q.value) {
			modalSearch(modal_q.value, i, type);
		}
	
	});

	modal.style.display = "block";

}

function modalSearch(query, i, type) {

	document.getElementById("modal_found").innerHTML = loading;

	var from_this_item = null;
	var url_music = sub_url_music+"&track="+query;
	var url_film = sub_url_film+"&query="+query;
	var settings = null;

	var settings_music = {
		"crossDomain": true,
		"data": "",
		"dataType": 'json',
		"type": 'GET',
		"url": url_music,
	}

	var settings_film = {
		"async": true,
		"crossDomain": true,
		"data": "",
		"headers": {},
		"method": "GET",
		"url": url_film,
	}

	if (type=='song') {
		from_this_item = array_music[i];
		settings = settings_film; //Desde una cancion a varias pelis
	}

	if (type=='movie') {
		from_this_item = array_film[i];
		settings = settings_music; //Desde una peli a varias canciones
	}

	$.ajax(settings).done(function (response) {
		
		if (type=='song') {
			modalPopulateFilm(response, from_this_item);
		} else {
			modalPopulateMusic(response, from_this_item);
		}

	});

}

function modalPopulateFilm(response, this_song) {

	/*

	Al seleccionar elementos y luego enviar
	si se hace otra busqueda y luego se envia,
	se envia un elemento de la busqueda anterior.

	(Quedan restos)
	
	*/

	var collaborate = document.getElementById("collaborate");
	var content = "";
	var array = response.results;
	var l = array.length;

	for (i=0; i<l; i++) {

		var it = array[i];
		var info = it.title+" ("+it.release_date+")";
		var href = "http://www.imdb.com/find?&q="+it.original_title+"&s=tt";
		var link = "<a target='_blank' href='"+href+"'>"+info+"</a>";

		content += "<p><input value='"+i+"' class='to_check_movie' type='checkbox'> "+link+"</input></p>";

	}

	document.getElementById("modal_found").innerHTML = content;
	
	collaborate.innerHTML = "Colaborar con las peliculas seleccionadas";
	
	collaborate.addEventListener("click", function() {
    	
    	var to_check_movies = document.getElementsByClassName('to_check_movie');
    	var checked_movies = [];

    	for (var i=0; i<to_check_movies.length; i++) {
    		
    		var t_c_m = to_check_movies[i];
	    		
	    	if (t_c_m.checked) {

	    		var item = array[t_c_m.value];
	    		var base = "https://image.tmdb.org/t/p/";
				var size = "original";
				var poster = item.poster_path;
				var img_url = null;

				if (poster) img_url = base+size+poster;

    			checked_movies.push({
					"director" : "Desconocido",
					"year" : item.release_date.split('-')[0],
					"name" : item.title,
					"info" : "Sin info",
					"img_url" : img_url,
				});

    		}
    	
    	}

    	console.log(JSON.stringify(checked_movies));
		collaborateFrom(this_song, 'song', JSON.stringify(checked_movies));
	
	});

}

function modalPopulateMusic() {

}

function collaborateFrom(from_this_item, type, to_this_items) {
	
	var url = null;
	
	if (type=='song') {
		url = protocol+"//"+host+"/collaborations/from_song";
	}

	if (type=='movie') {
		url = protocol+"//"+host+"/collaborations/from_movie";
	}

	var json = {
		"from_this_item" : from_this_item,
		"to_this_items" : to_this_items,
	};

	var data = JSON.stringify(json);

	var settings = {
		"async": true,
		"contentType": 'application/json; charset=utf-8',
		"data": data,
		"dataType": 'json',
		"type": 'POST',
		"url": url,
	}

	$.ajax(settings).done(function (response) {
		
		if (response.movie_ids_length==response.collaboration_ids_length) {
			var resultado = "Todas las colaboraciones fueron creadas";
		} else {
			var resultado = "No se pudieron crear todas las colaboraciones";
		}
		
		// alert(resultado);

	});

}

function random_movies(n) {

	movies = [];

	for (i=1; i<=n; i++) {

		movies.push({
			"director" : "Director "+Math.random(),
			"year" : Math.floor((Math.random()*117)+1900),
			"name" : "Nombre "+Math.random(),
			"info" : "Info "+Math.random(),
			"img_url" : protocol+"//"+Math.random()+".com",
			"favorited" : false,
		});

	}

	return movies;

}

function getMovies() {

	/* Para enviar varios items */
	//var items = random_movies(5);

	/* Para enviar un solo item */
	var items = [{
			"director" : "Director d",
			"year" : 1958,
			"name" : "Nombre n",
			"info" : "Info i",
			"img_url" : protocol+"//www.img_url.com",
			"favorited" : false,
		}];

	JSON.stringify(items);

}

function paginate() {

	document.getElementById("q").value = public_query;

	var	p = "<li class='col-md-4'><a href='' onclick='previous()'>Anterior</a></li>";
	var	f = "<li class='col-md-4'><a href='' onclick='first()'>Pagina inicial</a></li>";
	var n = "<li class='col-md-4'><a href='' onclick='next()'>Siguiente</a></li>";

	document.getElementById("pages").innerHTML = "<hr>"+p+f+n;

}

function previous() {

	var previous_page = public_page;
	
	if (public_page > 1) previous_page -= 1;

	return search(public_query, previous_page);

}

function first() {
	return search(public_query, 1);
}

function next() {
	
	var next_page = public_page + 1;
	
	return search(public_query, next_page);

}