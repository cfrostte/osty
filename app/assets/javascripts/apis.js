var protocol = window.location.protocol;
var host = window.location.host;

var k_themoviedb = "22f58faad6207b2f0dcf3068cc50bb74";
var k_lastfm = "4268ad0746656798a6616f4bbac67dd1";

var response_music = null;
var response_film = null;

var collaboration = "<span class='glyphicon glyphicon-play-circle'></span>";
var music = "<span class='glyphicon glyphicon-music'></span>";
var film = "<span class='glyphicon glyphicon-film'></span>";

var loading = "<center><img src='/img/loading.gif' alt='loading...'></center>";

$( document ).on('turbolinks:load', function() {

	var input = document.getElementById("q");

	if (input) input.addEventListener("change", function () {
		
		if (input.value) {
			document.getElementById("found").innerHTML = loading;
			search(input.value);
		}
		
	});

});

function search(q) {

	var url_collaboration = protocol+"//"+host+"/collaborations/search";
	var url_music = "http://ws.audioscrobbler.com/2.0/?method=track.search&track="+q+"&api_key="+k_lastfm+"&format=json";
	var url_film = "https://api.themoviedb.org/3/search/movie?query="+q+"&api_key="+k_themoviedb+"";
	
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
		
		if (queue_count==2) call_server(response_music, response_film);

	});

	$.ajax(settings_film).done(function (response) {
		
		response_film = response;
		queue_count+=1;

		if (queue_count==2) call_server(response_music, response_film);

	});

	function call_server(response_music, response_film) {

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
			populateOsty(response);
			populateLastfm(response_music);
			populateThemoviedb(response_film);
		});

	}

}

function populateOsty(response) {

	var content = "";
	var array = response;
	var l = array.length;

	for (i=0; i<l; i++) {

		var it = array[i];
		
		var info = "id="+it.id+
		" | idUser="+it.idUser+
		" | idImdb="+it.idImdb+
		" | idSpotify="+it.idSpotify+
		" | state="+it.state;

		var osty = "#";
		var link = "<a target='_blank' href='"+osty+"'>"+info+"</a>";

		content += "<p>"+collaboration+" "+link+"</p>";
	
	}

	document.getElementById("found").innerHTML += content;

}

function populateLastfm(response) {

	var content = "";
	var array = response.results.trackmatches.track;
	var l = array.length;

	for (i=0; i<l; i++) {

		var it = array[i];
		var info = it.artist+" - "+it.name;
		var osty = "#";
		var link = "<a target='_blank' href='"+osty+"'>"+info+"</a>";

		content += "<p>"+music+" "+link+"</p>";
	
	}

	document.getElementById("found").innerHTML += content;

}


function populateThemoviedb(response) {

	var content = "";
	var array = response.results;
	var l = array.length;

	for (i=0; i<l; i++) {

		var it = array[i];
		var info = it.original_title+" - "+it.release_date;
		var osty = "#";
		var link = "<a target='_blank' href='"+osty+"'>"+info+"</a>";

		content += "<p>"+film+" "+link+"</p>";

	}

	document.getElementById("found").innerHTML += content;

}