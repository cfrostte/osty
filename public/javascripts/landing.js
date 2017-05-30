$("#btn-ingresar").click(function (e) {
	e.preventDefault();
	window.location.href="/auth/login";
});

$("#btn-buscar").click(function (e) {
	e.preventDefault();
	window.location.href="/search/index";
});

//$("#main").animate({ scrollTop : $("#dangerNuevaIncidencia").offset().top + 100 }, 750 );

$('#quees').on('click', function(){
	$("#main").animate({ scrollTop : $("#divWallpaper").offset().top }, 750 );
});

$('#funcionalidades').on('click', function(){

	alert($("#funcionalidades").offset().top + 500);
	$("#main").animate({ scrollTop : $("#funcionalidades").offset().top + 500}, 750 );
});

$('#equipo').on('click', function(){
	$("#main").animate({ scrollTop : $("#footer").offset().top }, 750 );
});

$('#contacto').on('click', function(){
	$("#main").animate({ scrollTop : $("#footer").offset().top }, 750 );
});