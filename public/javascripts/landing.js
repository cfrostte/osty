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
	 $('html,body').animate({
        scrollTop: $("#divWallpaper").offset().top - 150
    }, 1000);
});

$('#funcionalidades').on('click', function(){

	//alert($("#funcionalidades").offset().top + 500);
	 $('html,body').animate({
        scrollTop: $("#tituloFuncionalidades").offset().top - 150
    }, 1000);
	//$("body").animate({ scrollTop : $("#tituloFuncionalidades").offset().top + 500}, 750 );
});

$('#equipo').on('click', function(){
	 $('html,body').animate({
        scrollTop: $(".footerEquipo").offset().top - 150
    }, 1000);
});

$('#contacto').on('click', function(){
	 $('html,body').animate({
        scrollTop: $(".footerContacto").offset().top - 150
    }, 1000);
});


$('#queesH').on('click', function(){
	$(".menuVertical").animate({
            width: "toggle"
            /*
            width: "show"
            width: "hide"
            */
        });
	 $('html,body').animate({
        scrollTop: $("#divWallpaper").offset().top - 150
    }, 1000);
});

$('#funcionalidadesH').on('click', function(){

	//alert($("#funcionalidades").offset().top + 500);
	$(".menuVertical").animate({
            width: "toggle"
            /*
            width: "show"
            width: "hide"
            */
        });
	 $('html,body').animate({
        scrollTop: $("#tituloFuncionalidades").offset().top - 150
    }, 1000);
	//$("body").animate({ scrollTop : $("#tituloFuncionalidades").offset().top + 500}, 750 );
});

$('#equipoH').on('click', function(){
	$(".menuVertical").animate({
            width: "toggle"
            /*
            width: "show"
            width: "hide"
            */
        });
	 $('html,body').animate({
        scrollTop: $(".footerEquipo").offset().top - 150
    }, 1000);
});

$('#contactoH').on('click', function(){
	$(".menuVertical").animate({
            width: "toggle"
            /*
            width: "show"
            width: "hide"
            */
        });
	 $('html,body').animate({
        scrollTop: $(".footerContacto").offset().top - 150
    }, 1000);
});


$('#barrasMenuVertical').on('click', function(){
	//alert("aca");
	//$('.menuVertical').fadeIn();
	$(".menuVertical").animate({
            width: "toggle"
            /*
            width: "show"
            width: "hide"
            */
        });
});

$('.btnCerrar').on('click', function(){
	$(".menuVertical").animate({
            width: "toggle"
            /*
            width: "show"
            width: "hide"
            */
        });
})