var protocol = window.location.protocol;
var host = window.location.host;

var key_music = "4268ad0746656798a6616f4bbac67dd1"; //Last.fm
var key_film = "22f58faad6207b2f0dcf3068cc50bb74"; //The Movie Database

var array_collaboration = null;
var array_music = null;
var array_film = null;

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

	array_collaboration = response

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

	array_music = response

	var content = "";
	var array = response;
	var l = array.length;

	for (i=0; i<l; i++) {

		var it = array[i];
		var info = it.artist+" - "+it.name;
		var href = "https://open.spotify.com/search/songs/"+info+"";
		var link = "<a target='_blank' href='"+href+"'>"+info+"</a>";

		var cooperate = "<span onclick='collaborateFrom(this, "+i+")'"+
		"type='song' class='glyphicon glyphicon-send'></span>";

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

	array_film = response

	var content = "";
	var array = response;
	var l = array.length;

	for (i=0; i<l; i++) {

		var it = array[i];
		var info = it.name+" ("+it.year+")";
		var href = "http://www.imdb.com/find?&q="+it.name+"&s=tt";
		var link = "<a target='_blank' href='"+href+"'>"+info+"</a>";

		var cooperate = "<span onclick='collaborateFrom(this, "+i+")'"+
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

function collaborateFrom(which, i) {
	
	var type = which.getAttribute('type');

	var url = null;

	var from_this_item = null;
	
	if (type=='song') {
		url = protocol+"//"+host+"/collaborations/from_song";
		from_this_item = array_music[i];
	}

	if (type=='movie') {
		url = protocol+"//"+host+"/collaborations/from_movie";
		from_this_item = array_film[i];
	}

	var to_this_items = getChosenItems(from_this_item);

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
		console.log(response);
	});

}

function getChosenItems(from) {
	
	var to = { "items_ids" : [ 1, 2, 3, ]};

	/*

	Se abre un modal con la informacion del item.
	
	Si es una cancion, aparecera abajo un cuadro de busqueda de peliculas,
	si es una pelicula, aparecera abajo un cuadro de busqueda de canciones.

	Se retorna un json con el conjunto de elementos elegidos segun corresponda.

	*/

	return JSON.stringify(to);

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

/*

Para los casos de uso de ver cancion (9), ver pelicula (10) y ver colaboracion (11)
se podria implementar un modal que se abra con la informacion de ese item
justo al hacer clic en alguno de ellos de la lista de resultados de la busqueda.

De esa forma, al mostrar el item en una linea sola, se veria primero el icono que lo simboliza,
es decir un icono de music, de film o de play circular, luego se mostraria la info
de manera resumida (un renglon) y luego el icono de la estrella (agregar/quitar favorito).

Al hacer clic al medio del item (parte textual) se abriria el modal en ves de un enlace externo,
luego dentro del modal se mostrarian mas datos (como dicho enlace),
mas una imagen (album, poster, lo que corresponda), y si es una cancion,
apareceria un buscador de peliculas para las cuales se pueda vincular (el usuario colabora).
De manera similar, si se hace clic en un item que es pelicula aparecera una lista de canciones
a para las cuales se pueda vincular dicha pelicula.

Una vez se tenga la lista de items que se seleccionaron en el modal, se envia un ajax
con el json que corresponda a la operacion que corresponda del controlador de la app.

*/
  