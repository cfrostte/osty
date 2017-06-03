var protocol = window.location.protocol;
var host = window.location.host;

var key_music = "4268ad0746656798a6616f4bbac67dd1"; //Last.fm
var key_film = "22f58faad6207b2f0dcf3068cc50bb74"; //The Movie Database

var response_music = null;
var response_film = null;

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
	
	var queue_count = 0;

	var response_collaboration = null;
	var response_music = null;
	var response_film = null;

	var total = 3;

	var settings_collaboration = {
		"async": true,
		"contentType": 'application/json; charset=utf-8',
		"data": "",
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

	var content = "";
	var array = response;
	var l = array.length;

	for (i=0; i<l; i++) {

		var it = array[i];
		var info = it.artist+" - "+it.name;
		var href = "https://open.spotify.com/search/songs/"+info+"";
		var link = "<a target='_blank' href='"+href+"'>"+info+"</a>";
		var data = JSON.stringify(it);

		var cooperate = "<span onclick='collaborateFromSong(this)'"+
		"value='"+data+"' class='glyphicon glyphicon-hand-left'></span>";

		var star = "glyphicon glyphicon-star-empty";

		if (it.favorited) star = "glyphicon glyphicon-star";

		var add = "<span onclick='addToFavorites(this)'"+
		"value='"+data+"' type='song' class='"+star+"'></span>";

		content += "<p>"+music+" "+link+" "+cooperate+" "+add+"</p>";
			
	}

	document.getElementById("found").innerHTML += content;

	return (l>0);

}

function collaborateFromSong(which) {

	var data = which.getAttribute('value');

	var url = protocol+"//"+host+"/collaborations/from_song";

	var settings = {
		"async": true,
		"contentType": 'application/json; charset=utf-8',
		"data": data,
		"dataType": 'json',
		"type": 'POST',
		"url": url,
	}

	$.ajax(settings).done(function (response) {
		modalToMovies(response);
	});

}

function modalToMovies(song) {
	
	var data = JSON.stringify(song);
	var url = protocol+"//"+host+"/collaborations/to_movies";

	/*
	Se crea un modal que tiene la info de la cancion
	y luego se envia un json con todas las peliculas.
	El json debe contener 2 campos, el id de la cancion
	y el arreglo de peliculas. Luego en el servidor...
	*/

	var settings = {
		"async": true,
		"contentType": 'application/json; charset=utf-8',
		"data": data,
		"dataType": 'json',
		"type": 'POST',
		"url": url,
	}

	$.ajax(settings).done(function (response) {
		console.log(response);
	});

}

function addToFavorites(which) {

	var item = which.getAttribute('value');
	var type = which.getAttribute('type');
	
	var json = { "item":item, "type":type };
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

function populateFilm(response) {

	var content = "";
	var array = response;
	var l = array.length;

	for (i=0; i<l; i++) {

		var it = array[i];
		var info = it.original_title+" - "+it.release_date;
		var href = "http://www.imdb.com/find?&q="+it.original_title+"&s=tt";
		var link = "<a target='_blank' href='"+href+"'>"+info+"</a>";

		content += "<p>"+film+" "+link+"</p>";

	}

	document.getElementById("found").innerHTML += content;

	return (l>0);

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