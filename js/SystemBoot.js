

/* global EnvironmentData, InstanceManager */

$(document).ready(function() {
    
    $('#pageLoading').one('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function(){alert('fin alerta');});
    
//-----------------------------------------------------------------------------------
//	1.	Clock
//-----------------------------------------------------------------------------------

    var monthNames = [ "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Augosto", "Septiembre", "Octubre", "Noviembre", "Deciembre" ]; 
    var dayNames= ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];

    var newDate = new Date();
    newDate.setDate(newDate.getDate());
    $('#DateAbbr').html(dayNames[newDate.getDay()].substr(0,3) + " ");

    setInterval( function() {
            var minutes = new Date().getMinutes();
            $(".min, .mins").html(( minutes < 10 ? "0" : "" ) + minutes);
        },1000);

    setInterval( function() {
            var hours = new Date().getHours();
            $(".hours, .hour").html(( hours < 10 ? "0" : "" ) + hours);
        }, 1000);
    
    
    ExistRoot();    
    
    if(!checkSessionExistance())
        setInstancesToLogin();


    $('#boton_login').click(function() {
        login();  
    });


//-----------------------------------------------------------------------------------
//	4.	Dock
//-----------------------------------------------------------------------------------

    $('.dock ul li').hover(
            function(){
                    $(this).addClass('ok').prev().addClass('prev').prev().addClass('prev-ancor');
                    $(this).addClass('ok').next().addClass('next').next().addClass('next-ancor');
            },
            function(){
                    $('.dock ul li').removeClass('ok prev next next-ancor prev-ancor');
            }
    );
}); 

function StartSystem()
{
     $('input[type=password]').addClass('valid');
     $('#form_user').addClass('valid');
     $('#select_login_instancias').addClass('valid');
     $('#boton_login').removeClass('submit').addClass('charge');
     $('#pageLogin').addClass('initLog').delay(1900).queue(function() { $(this).removeClass('initLog').addClass('initLogExit'); $(this).dequeue(); });;
     $('#page, #head').delay(2500).queue(function() { $(this).addClass('vis'); $(this).dequeue(); });                                
     setTimeout(function() { $('#dock_').css('display', 'block');}, 4000);  
}

function DeniedSystemStart()
{
    $('#form_usuario').select();
    $('#form_password').select();              
    $('.validate').addClass('error').delay(210).queue(function() { $(this).removeClass('error'); $(this).dequeue();});
}

function setInstancesToLogin(){
    var instances = InstanceManager.getInstancesXml();
    
    $(instances).find("Instance").each(function(){
       var $Instancia=$(this);
       var id=$Instancia.find("IdInstancia").text();
       var nombre = $Instancia.find("NombreInstancia").text();  
       $("#select_login_instancias").append("<option value=\""+id+"\">"+nombre+"</option>");
    });
}


