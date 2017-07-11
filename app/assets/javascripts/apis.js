/* COMPONENTES CONTEXTUALES DE LAS URL's */
var protocol = window.location.protocol;
var host = window.location.host;

/* CLAVES REQUERIDAS PARA QUE LAS API's BRINDEN AUTORIZACION */
var key_music = "4268ad0746656798a6616f4bbac67dd1"; //Last.fm
var key_film = "22f58faad6207b2f0dcf3068cc50bb74"; //The Movie Database

/* SEMI-URL's CON LAS CUALES SE REALIZAN LAS PETICIONES AJAX, QUE INCLUYEN LAS CLAVES DE AUTENTICACION */
var sub_url_music = "https://ws.audioscrobbler.com/2.0/?method=track.search&format=json&api_key="+key_music;
var sub_url_film = "https://api.themoviedb.org/3/search/movie?api_key="+key_film;

/* GIF ANIMADO QUE INDICA QUE LA PAGINA ESTA PROCESANDO ALGO */
var loading = "<center><img src='/img/loading.gif' alt='loading...'></center>";

/* ARREGLOS QUE ALMACENAN LA INFORMACION DE LOS ELEMENTOS LISTADOS */
var array_collaboration = null;
var array_music = null;
var array_film = null;

/* ICONOS QUE RESPRESENTAN EL TIPO DE ELEMENTO LISTADO */
var collaboration = "<span class='glyphicon glyphicon-play-circle'></span>";
var music = "<span class='glyphicon glyphicon-music'></span>";
var film = "<span class='glyphicon glyphicon-film'></span>";

/* VARIABLES COMPARTIDAS POR FUNCIONES */
var public_query = null; // Termino de busqueda
var public_page = null; // Pagina actual
var type_from_to_modal = null; // Si es una cancion, se busca peliculas (y viceversa)
var item_from_to_modal = null; // Elemento desde el cual se colaborara con otros
var array_to_songs = null; // Canciones con las cuales relacionar una pelicula
var array_to_movies = null; // Peliculas con las cuales relacionar una cancion
var checked_items = null; // Elementos seleccionados con los cuales enlazar otro
var listener_attached_for_modal = false; // Ya se adjunto un evento para mostrar el modal?

// var AWlist = ["123124", "1231221Java", "656J65av6aScript", "65646Brainfuck", "qwertLOLCODE", "treNode.js", "zzzRuby on Rails",];
var AWlist = [];
// var AWlist2 = ["123124", "1231221Java", "656J65av6aScript", "65646Brainfuck", "qwertLOLCODE", "treNode.js", "zzzRuby on Rails",];
var busqueda = [];

if (!!localStorage.getItem('busqueda')) {
	// console.log("Existe local");
	AWlist = localStorage.getItem('busqueda').split(",");
} else {
	// console.log("No existe local");
	localStorage.setItem('busqueda',AWlist);
}

var check = function(needle) {
    
    // Per spec, the way to identify NaN is that it is not equal to itself
    var findNaN = needle !== needle;
    
    var indexOf;

    if (!findNaN && typeof Array.prototype.indexOf === 'function') {
    
        indexOf = Array.prototype.indexOf;
    
    } else {
    
        indexOf = function(needle) {
    
            var i = -1, index = -1;
    
            for (i = 0; i < this.length; i++) {
                
                var item = this[i];

                if ((findNaN && item!==item) || item===needle) {
                    index = i;
                    break;
                }
            }

            return index;
        
        };
    
    }

    return indexOf.call(this, needle) > -1;

};

/* EN RAILS, EL CONTENIDO ESTA REALMENTE LISTO CUANDO TURBOLINKS LO ESTA */
$( document ).on('turbolinks:load', function() {

	var input_q = document.getElementById("q");
	var doneTypingInterval = 1000;
	var typingTimer;

	/* ASIGNACION DE ESCUCHA DE EVENTOS PARA BUSQUEDA Y SUGERENCIAS */

	if (input_q) input_q.addEventListener("change", function () {
		
		if (input_q.value) {
			search(input_q.value, 1);
		}
		
	});

	input_q.addEventListener("keyup", function(evt) {
		
		evt = evt || window.event;
		
		if (evt.keyCode!=37 && evt.keyCode!=39) {
			// evt.keyCode es para IE
			// evt.key es para Netscape/Firefox/Opera
			clearTimeout(typingTimer);
			typingTimer = setTimeout(doneTyping, doneTypingInterval);		
		} else {
			// console.log("Es flecha");
		}
	
	});

	input_q.addEventListener("keydown", function() {
		clearTimeout(typingTimer);
	});

	function doneTyping() {
		
		// console.log("Entro en el search");
		// console.log("valor="+input_q.value);
		
		if (input_q.value) {

			search(input_q.value, 1);
			
			if (!check.call(AWlist, input_q.value)) {				
				
				// AWlist.push(input_q.value);
				
				var agregar = true;
				
				for (var i = 0; i < AWlist.length; i++) {
				
					if (AWlist[i] == input_q.value) {
						agregar = false;
						break;
					}
				
				}

				if (AWlist.length<100 && agregar) {
					AWlist.unshift(input_q.value);
					// console.log("Se agrega");
				}

				if (AWlist.length==100 && agregar){
					AWlist.pop();
					AWlist.unshift(input_q.value);
				}
			
			}

			localStorage.setItem('busqueda', AWlist);	

		}
	
	};

});

/* ESTABLECE CONEXIONES CON ESTA APLICACION Y LAS DOS API's PARA PODER BUSCAR */
function search(query, page) {

	document.getElementById("found").innerHTML = loading;

	public_query = query;
	public_page = page;

	/* SE CONSTRUYEN LAS URL's FINALES CON LAS CUALES COMUNICARSE */
	var url_collaboration = protocol+"//"+host+"/collaborations/search";
	var url_music = sub_url_music+"&track="+query+"&page="+page;
	var url_film = sub_url_film+"&query="+query+"&page="+page;
	var url_check_favorites = protocol+"//"+host+"/favorites/check";
	
	/* VARIABLES EN LAS CUALES SE ALMACENARAN LAS RESPUESTAS A LAS PETICIONES */
	var response_collaboration = null;
	var response_music = null;
	var response_film = null;

	var queue_count = 0; // Se incrementa conforme los servidores responden
	var total = 3; // Indica el total de conexiones a establecer con los servidores

	/* CONFIGURACIONES PARA CADA UNA DE LAS PETICIONES A REALIZAR */

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

	/* COMIENZAS LAS PETICIONES ASINCRONAS HACIA LOS SERVIDORES */

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

	/*
	
	ESTA ES LA ULTIMA LLAMADA REALIZADA A UN SERVIDOR
	-------------------------------------------------
	NECESITA ESPERAR A QUE TERMINEN TODAS LAS LLAMADAS ANTERIORES,
	PUES ESTA DEBE ENVIAR TODOS LOS DATOS PARA PROCESARLOS.

	SE ENTIENDE POR PROCESAR LOS DATOS A:
		1) NORMALIZAR LOS NOMBRES DE LOS ATRIBUTOS CONFORME LOS MDOELOS
		2) CONSTRUIR URL's DE IMAGENES DE OBJETOS (CANCIONES O PELICULAS)
		3) VERIFICAR PARA CADA UNO DE ELLOS, SI ESTA O NO EN FAVORITOS
	
	*/
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
			
			/* VARIABLES PARA LA PAGINACION DE RESULTADOS */
			document.getElementById("found").innerHTML = "";
			document.getElementById("actual").innerHTML = "";
			document.getElementById("pages").innerHTML = "";

			/* CUALES DE DE LOS SIGUIENTES TIPOS DE ITEMS TIENEN RESULTADOS? */
			var found_collaborations = false;
			var found_music = false;
			var found_film = false;

			/* SE RESPONDE A LA PREGUNTA ANTERIOR Y AL MISMO TIEMPO SE MUESTRAN */
			found_collaborations = populateCollaboration(response.collaboration);
			found_music = populateMusic(response.music);
			found_film = populateFilm(response.film);

			/* SE DA LA OPCION DE VOLVER A LA PAGINA ACTUAL (SI CORRESPONDE) */
			if (public_page>1 && (found_collaborations||found_music||found_film)) {
				document.getElementById("actual").innerHTML = "<hr>Página "+public_page+"<hr>";
			} else {
				document.getElementById("actual").innerHTML = "<hr>";
			}

			/* REALIZA LA PAGINACION, SOLAMENTE SI EXISTEN RESULTADOS */
			if (found_collaborations||found_music||found_film) paginate();
		
		});

	}

}

/*

EN FUNCION DE LAS RESPUESTAS DEL SERVIDOR MUESTRAN LOS ELEMENTOS
EN EL LISTADO DE RESULTADOS, CADA FUNCION RESPONDE TRUE SI MOSTRO ALGO.

EL CONTENIDO SE CONSTRUYE CONCETENANDO UNA VARIABLE content Y A SU VEZ
ESTA VARIABLE SE CONCATENA CON EL NODO HTML id=found
CADA UNA DE ESTAS FUNCIONES HACE USO DE ESTE ULTIMO

*/

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

		/*
		CUANDO SE HACE CLIC EN COLABORAR DESDE ESTA CANCION,
		SE PASA EL NODO HTML Y SE PASA EL INDICE DEL OBJETO DEL array_music
		QUE CONTIENE LA INFORMACION YA PROCESADA POR EL SERVIDOR
		*/
		// var cooperate = "<span onclick='chooseFrom(this, "+i+")'"+
		// "type='song' class='modal_song glyphicon glyphicon-send'></span>";

		var collaborate = "<span onclick='chooseFrom(this, "+i+")'"
		+" type='song' class='modal_song fa fa-handshake-o spanCollaboration'"
		+" style = 'font-size: 45px; margin-top: 15px; margin-left: 200px'></span>";

		var star = "fa fa-star spanFavourite"; // Estrella vacia

		/* SI ESTA EN FAVORITOS, ENTONCES LA ESTRELLA SE CAMBIA A LLENA */
		if (it.favorited) star += " estrellaFavorito";

		/*
		CUANDO SE HACE CLIC EN AGREGAR ESTA CANCION A FAVORITOS,
		SE PASA EL NODO HTML Y SE PASA EL INDICE DEL OBJETO DEL array_music
		QUE CONTIENE LA INFORMACION YA PROCESADA POR EL SERVIDOR
		*/
		// var add = "<span onclick='addToFavorites(this, "+i+")'"+
		// "type='song' class='"+star+"'></span>";

		var add = "<span onclick='addToFavorites(this, "+i+")'"
		+" type='song' class='"+star+"' style='margin-left: 10px'></span>";

		// content += "<p>"+music+" "+link+" "+cooperate+" "+add+"</p>";
		
		content += "<div class = 'musicContainer' style = 'width: 100%; height : 250px'>" + 
						"<img src = '" + it.img_url + "' style = 'width: 130px; height: 130px; margin: 50px 0; display: inline-block'/>" + 
						"<div style = 'width: 50%; display: inline-block; top: 30px; left: 20px; position: relative;'>" +
							"<p style = 'font-size: 22px; color: #A4A4A4'>" + it.name + add + "</p><p style = 'font-size: 17px; color: white'>" + it.artist + "</p>" +
							"<img src = '/img/iconoMusica.png' style = 'width: 50px; height: 50px; margin-top: 9px'/>" +
						"</div>" +
						"<div style = 'font-size: 17.5px; color: white; width: 50%; position: relative; top: -139px; left: 579px'>" +
							"Escuchar:<br>" +
							"<a href = '" + href + "' class = 'linkSpotify' target = '_blank'><span class = 'fa fa-spotify' style = 'font-size: 45px; margin-top: 15px'></span></a>&nbsp;&nbsp;<a href = '" + it.url + "' class = 'linkLastFM' target = '_blank'><span class = 'fa fa-lastfm-square' style = 'font-size: 45px; margin-top: 15px'></span></a>" +
							collaborate + 
						"</div>" +
					"</div>";
			
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

		/*
		CUANDO SE HACE CLIC EN COLABORAR DESDE ESTA PELICULA,
		SE PASA EL NODO HTML Y SE PASA EL INDICE DEL OBJETO DEL array_film
		QUE CONTIENE LA INFORMACION YA PROCESADA POR EL SERVIDOR
		*/
		var cooperate = "<span onclick='chooseFrom(this, "+i+")'"+
		"type='movie' class='glyphicon glyphicon-send'></span>";

		var star = "glyphicon glyphicon-star-empty"; // Estrella vacia

		/* SI ESTA EN FAVORITOS, ENTONCES LA ESTRELLA SE CAMBIA A LLENA */
		if (it.favorited) star = "glyphicon glyphicon-star";

		/*
		CUANDO SE HACE CLIC EN AGREGAR ESTA PELICULA A FAVORITOS,
		SE PASA EL NODO HTML Y SE PASA EL INDICE DEL OBJETO DEL array_film
		QUE CONTIENE LA INFORMACION YA PROCESADA POR EL SERVIDOR
		*/
		var add = "<span onclick='addToFavorites(this, "+i+")'"+
		"type='movie' class='"+star+"'></span>";

		content += "<p>"+film+" "+link+" "+cooperate+" "+add+"</p>";

	}

	document.getElementById("found").innerHTML += content;

	return (l>0);

}

/******************************************************************************/

/* ESTABLECE UNA CONEXION AL SERVIDOR PARA AGREGAR/QUITAR EL ELEMENTO A FAVORITOS */
function addToFavorites(which, i) {

	var item = null; // A definir mas adelante en funcion de su tipo
	var type = which.getAttribute('type'); // El tipo de elemento que se clickeo
	
	/* BUSCAN LOS ELEMENTOS EN LOS ARREGLOS GLOBALES EN FUNCION DE SU TIPO */

	if (type=='song') {
		item = array_music[i];
	}

	if (type=='movie') {
		item = array_film[i];
	}

	/* CONSTRUYE LA INFORMACION A ENVIAR AL SERVIDOR */

	var json = {
		"item" : item,
		"type" : type,
	};
	
	/* PROCESA LA INFORMACION CONSTRUIDA */
	var data = JSON.stringify(json);

	/* CONSTRUYE LA URL CON LA CUAL ESTABLECER LA COMUNICACION */
	var url = protocol+"//"+host+"/favorites/add";

	/* CONFIGURA DE QUE MANERA SE ESTABLECERA LA CONEXION */
	var settings = {
		"async": true,
		"contentType": 'application/json; charset=utf-8',
		"data": data,
		"dataType": 'json',
		"type": 'POST',
		"url": url,
	}

	$.ajax(settings).done(function (response) {

		/* SI EL USUARIO ESTA LOGUEADO, MODIFICA LA ESTRELLA DEL NODO HTML SEGUN LA RESPUESTA */
		if (response.added) which.setAttribute('class','fa fa-star spanFavourite estrellaFavorito');
		else which.setAttribute('class','fa fa-star spanFavourite');
	
	});

}

/*

ABRE UNA VENTANA MODAL DESDE LA CUAL SE BUSCARAN ELEMENTOS CON LOS CUALES
RELACIONAR AL ELEMENTO DESDE EL CUAL SE ESTA HACIENDO CLIC.

EL SERVIDOR AL RECIBIR LOS ELEMENTOS, CREARA UNA COLABORACION CON CADA UNO,
EN DONDE UNO DE LOS ELEMENTOS (EN EL QUE SE HIZO CLIC) ES SIEMPRE EL MISMO.

*/
function chooseFrom(which, i) {

	type_from_to_modal = which.getAttribute('type'); // Tipo en el que se hizo clic

	/*

	BUSCAN LOS ELEMENTOS QUE CONTIENEN LA INFORMACION,
	EN FUNCION DEL TIPO DEL NODO HTML EN EL CUAL SE CLICKEO

	*/
	
	if (type_from_to_modal=='song') {
		item_from_to_modal = array_music[i];

	}

	if (type_from_to_modal=='movie') {
		item_from_to_modal = array_film[i];
	}

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

	/* INPUT EN DONDE SE INGRESARA EL TERMINO DE BUSQUEDA DE ELEMENTOS */
	var modal_q = document.getElementById('modal_q');

	/* CUANDO CAMBIA, SE COMIENZA A BUSCAR */
	modal_q.addEventListener("change", function () {

		if (modal_q.value) {
			modalSearch(modal_q.value);
		}

	});

	/* BOTON CON EL CUAL REALIZAR LAS COLABORACIONES */
	var collaborate = document.getElementById("collaborate");

	/* SI NO EXISTE UN EVENTO DE ESCUCHA PARA EL BOTON... */
	if (!listener_attached_for_modal) {
		
		collaborate.addEventListener("click", function() {
			
			/* SE TOMAN LOS ELEMENTOS SELECCIONADOS 'CONTRARIOS' AL CLICKEADO */
			if (type_from_to_modal=='song') checked_items = getSelectedMovies();
			if (type_from_to_modal=='movie') checked_items = getSelectedSongs();

			if (checked_items.length>0) {
				collaborateFrom(item_from_to_modal, type_from_to_modal,
					JSON.stringify(checked_items));
			} else {
				alert('Elige al menos un item con el cual relacionar');
			}

			listener_attached_for_modal = true; // Ahora si tiene escucha

		});
	
	}

	modal.style.display = "block";

}

/* REALIZA UNA BUSQUEDA DE ITEMS 'CONTRARIOS' AL CUAL SE HIZO CLIC */
function modalSearch(query) {

	document.getElementById("modal_found").innerHTML = loading;

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

	if (type_from_to_modal=='song') {
		settings = settings_film; //Desde una cancion a varias pelis
	}

	if (type_from_to_modal=='movie') {
		settings = settings_music; //Desde una peli a varias canciones
	}

	$.ajax(settings).done(function (response) {
		
		if (type_from_to_modal=='song') { //Desde una cancion a varias pelis

			array_to_movies = response.results;

			modalPopulateFilm(response, item_from_to_modal);
						
			collaborate.innerHTML = "<i>"+item_from_to_modal.artist+" - "
			+item_from_to_modal.name+"</i> es OST de todas esas películas";

		} 

		if (type_from_to_modal=='movie') { //Desde una peli a varias canciones
		
			array_to_songs = response.results.trackmatches.track;

			modalPopulateMusic(response, item_from_to_modal);
						
			collaborate.innerHTML = "Todas esas canciones son OST de <i>"+
			item_from_to_modal.name+"("+item_from_to_modal.year+")</i>";
		
		}

	});

}

/*

OBTIENEN TODOS LOS ELEMENTOS SELECCIONADOS CON DETERMINADA CLASE,
Y LOS PROCESA PARA SER COMPRENSIBLES POR EL SERVIDOR

*/

function getSelectedMovies() {

	var to_check_movies = document.getElementsByClassName('to_check_movie');

	var checked_movies = [];

	for (var i=0; i<to_check_movies.length; i++) {

		var t_c_m = to_check_movies[i];

		if (t_c_m.checked) {

			var item = array_to_movies[t_c_m.value];

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

	return checked_movies;

}

function getSelectedSongs() {

	var to_check_songs = document.getElementsByClassName('to_check_song');

	var checked_songs = [];

	for (var i=0; i<to_check_songs.length; i++) {

		var t_c_s = to_check_songs[i];

		if (t_c_s.checked) {

			var item = array_to_songs[t_c_s.value];

			var img_url = item.image;

			if (img_url) img_url = item.image[item.image.length-1]['#text']

			checked_songs.push({
				"album" : "Desconocido",
				"artist" : item.artist,
				"name" : item.name,
				"info" : "Sin info",
				"img_url" : img_url,
			});

		}

	}

	return checked_songs;

}

/******************************************************************************/

/* LLENAN EL MODAL CON LOS RESULTADOS OBTENIDOS DE LAS API's */

function modalPopulateFilm(response, this_song) {

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

}

function modalPopulateMusic(response, this_movie) {

	var content = "";
	var array = response.results.trackmatches.track;
	var l = array.length;

	for (i=0; i<l; i++) {

		var it = array[i];
		var info = it.artist+" - "+it.name;
		var href = "https://open.spotify.com/search/songs/"+info+"";
		var link = "<a target='_blank' href='"+href+"'>"+info+"</a>";

		content += "<p><input value='"+i+"' class='to_check_song' type='checkbox'> "+link+"</input></p>";

	}

	document.getElementById("modal_found").innerHTML = content;

}

/******************************************************************************/

/* ESTABLECE UNA CONEXION AL SERVIDOR Y REALIZA TODAS LAS COLABORACIONES */
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

		var message = "Error desconocido";

		if (response.all_were_made) {
		
			message = "Todas las colaboraciones fueron realizadas";
		
		} else if (response.not_logged) {
		
			message = "Necesitamos llevarte a la página de login";
		
			if (confirm(message)) {
				return window.location.replace(protocol+"//"+host+"/auth/login");
			} else {
				return "El usuario no desea loguearse";
			}
			
		} else {
		
			message = "No se pudieron realizar todas las colaboraciones";
		
		}

		alert(message);

	});

}

/* SISTEMA DE PAGINACION */

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

/******************************************************************************/

/* OBTIENEN DATOS FALSOS GENERADOS CON NUMEROS RANDOMICOS */

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