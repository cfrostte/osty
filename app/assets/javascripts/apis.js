var collaboration = "<span class='glyphicon glyphicon-play-circle'></span>";
var music = "<span class='glyphicon glyphicon-music'></span>";
var film = "<span class='glyphicon glyphicon-film'></span>";

$('document').ready( function() {

	var input = document.getElementById("q");

	if (input) input.addEventListener("change", function () {
		
		document.getElementById("found").innerHTML = "";
		search(input.value, 1);
		search(input.value, 2);
		search(input.value, 3);
	
	});

});

function search(q, type) {

	if (!q) return;

	var k = "22f58faad6207b2f0dcf3068cc50bb74";

	var protocol = window.location.protocol;
	var host = window.location.host;

	var url_osty = protocol+"//"+host+"/collaborations/search?query="+q;	
	var url_spotify = "https://api.spotify.com/v1/search?query="+q+"&type=track";
	var url_themoviedb = "https://api.themoviedb.org/3/search/movie?query="+q+"&api_key="+k+"";
	
	var url = "...";

	if (type==1) url = url_osty;
	if (type==2) url = url_spotify;
	if (type==3) url = url_themoviedb;

	var settings = {
		"async": true,
		"crossDomain": true,
		"url": url,
		"method": "GET",
		"headers": {},
		"data": ""
	}

	$.ajax(settings).done(function (response) {
		if (type==1) populateOsty(response);
		if (type==2) populateSpotify(response);
		if (type==3) populateThemoviedb(response);
	});

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

function populateSpotify(response) {

	var content = "";
	var array = response.tracks.items;
	var l = array.length;

	for (i=0; i<l; i++) {

		var it = array[i];
		var info = it.artists[0].name+" - "+it.name;
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