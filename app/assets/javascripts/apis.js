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


var AWlist = ["123124", "1231221Java", "656J65av6aScript", "65646Brainfuck", "qwertLOLCODE", "treNode.js", "zzzRuby on Rails"];


var check = function(needle) {
    // Per spec, the way to identify NaN is that it is not equal to itself
    var findNaN = needle !== needle;
    var indexOf;

    if(!findNaN && typeof Array.prototype.indexOf === 'function') {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function(needle) {
            var i = -1, index = -1;

            for(i = 0; i < this.length; i++) {
                var item = this[i];

                if((findNaN && item !== item) || item === needle) {
                    index = i;
                    break;
                }
            }

            return index;
        };
    }

    return indexOf.call(this, needle) > -1;
};


$( document ).on('turbolinks:load', function() {

	var $input_q = document.getElementById("q");
	var doneTypingInterval = 2000;
	var typingTimer;


	$input_q.addEventListener("keyup",function(evt){
		evt = evt || window.event;
		if (evt.keyCode != 37 && evt.keyCode != 39) { // evt.keyCode es para IE
								// evt.key es para Netscape/firefox/opera
			clearTimeout(typingTimer);
			typingTimer=setTimeout(doneTyping, 333);		
		}
		else{
			console.log("Es flecha");
		}
	});

	$input_q.addEventListener("keydown",function(){
		clearTimeout(typingTimer);
	});

	
	function doneTyping(){
		console.log("entro en el search");
		console.log($input_q.value + "valor");
		if ($input_q.value) {
			search($input_q.value, 1);
			if(!check.call(AWlist, $input_q.value)){				
				AWlist.push($input_q.value);
				console.log("se agrega");
			}
		}
	};

});

function search(query, page) {

	document.getElementById("found").innerHTML = loading;

	public_query = query;
	public_page = page;

	var url_collaboration = protocol+"//"+host+"/collaborations/search";
	var url_music = sub_url_music+"&track="+query+"&page="+page;
	var url_film = sub_url_film+"&query="+query+"&page="+page;
	
	var queue_count = 0;

	var response_music = null;
	var response_film = null;

	var settings_music = {
		"url": url_music,
		"crossDomain": true,
		"dataType": 'json',
		"type": 'GET',
		"data": "",
	}

	var settings_film = {
		"async": true,
		"crossDomain": true,
		"url": url_film,
		"method": "GET",
		"headers": {},
		"data": ""
	}

	$.ajax(settings_music).done(function (response) {
		
		response_music = response;
		queue_count+=1;
		
		if (queue_count==2) call_osty(response_music, response_film);

	});

	$.ajax(settings_film).done(function (response) {
		
		response_film = response;
		queue_count+=1;

		if (queue_count==2) call_osty(response_music, response_film);

	});

	function call_osty(response_music, response_film) {

		var data = { "music": response_music, "film": response_film };
		
		var settings_collaboration = {
			
			"url": url_collaboration,
			"type": 'POST',
			"data": "",
			"contentType": 'application/json; charset=utf-8',
			"dataType": 'json',
			"async": true
		}

		$.ajax(settings_collaboration).done(function (response) {
			
			document.getElementById("found").innerHTML = "";
			document.getElementById("actual").innerHTML = "";
			document.getElementById("pages").innerHTML = "";

			var found_collaborations = populateCollaboration(response);
			var found_music = populateMusic(response_music);
			var found_film = populateFilm(response_film);

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
		
		var info = "id="+it.id+
		" | state="+it.state;

		var osty = "#";
		var link = "<a target='_blank' href='"+osty+"'>"+info+"</a>";

		content += "<p>"+collaboration+" "+link+"</p>";

	}

	document.getElementById("found").innerHTML += content;

	return (l>0);

}

function populateMusic(response) {

	var content = "";
	var array = response.results.trackmatches.track;
	var l = array.length;

	for (i=0; i<l; i++) {

		var it = array[i];
		var info = it.artist+" - "+it.name;
		var href = "https://open.spotify.com/search/songs/"+info+"";
		var link = "<a target='_blank' href='"+href+"'>"+info+"</a>";
		var data = JSON.stringify(it);

		var cooperate = "<span onclick='collaborateFromSong(this)'"+
		"value='"+data+"' class='glyphicon glyphicon-hand-left'></span>";

		content += "<p>"+music+" "+link+" "+cooperate+"</p>";
	
	}

	document.getElementById("found").innerHTML += content;

	return (l>0);

}

function collaborateFromSong(which) {

	var data = which.getAttribute('value');
	var url = protocol+"//"+host+"/collaborations/from_song";

	var settings = {
		"url": url,
		"type": 'POST',
		"data": "",
		"contentType": 'application/json; charset=utf-8',
		"dataType": 'json',
		"async": true,
		"data": data,
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
		"url": url,
		"type": 'POST',
		"data": "",
		"contentType": 'application/json; charset=utf-8',
		"dataType": 'json',
		"async": true,
		"data": data,
	}

	$.ajax(settings).done(function (response) {
		console.log(response);
	});

}

function populateFilm(response) {

	var content = "";
	var array = response.results;
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


// var input = document.getElementById("myinput");
//   console.log(input);
//   new Awesomplete(input, {
//   list: ["Ada", "Java", "JavaScript", "Brainfuck", "LOLCODE", "Node.js", "Ruby on Rails"]
//   });