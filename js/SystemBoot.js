

/* global EnvironmentData, Permissions */

$(document).ready(function() {
    
//    $("#spinnerDiv").bind('webkitTransitionEnd', function(){alert('fin alerta');});
    
//Se esconde el dock
$('#dock_').css('display', 'none');

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
    getListInstances();

//-----------------------------------------------------------------------------------
//	2.	Fix Classes after Validate Login
//-----------------------------------------------------------------------------------
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

checkSessionExistance();

function checkSessionExistance()
{
    var activeSession = false;
    
    $.ajax({
      async:false, 
      cache:false,
      dataType:"html", 
      type: 'POST',   
      url: "php/Login.php",
      data: {opcion:"checkSessionExistance"}, 
      success:  function(xml){

          ($.parseXML( xml )===null) ? Salida(xml) : xml=$.parseXML( xml );

           $(xml).find("StartSession").each(function()
            {                               
                var IdUsuario=$(this).find("IdUsuario").text();
                var NombreUsuario = $(this).find("Login").text();  
                var NombreGrupo= $(this).find("NombreGrupo").text();
                var IdGrupo = $(this).find("IdGrupo").text();
                var NombreInstancia = $("#select_login_instancias option:selected").html();
                var idInstance =  $(this).find("idInstance").text();
                
                if(IdUsuario>0)
                {                
                    activeSession = true;
                    
                     $('#id_usr').val(IdUsuario);
                     $('#login_usr').val(NombreUsuario);       
                     $('#database_usr').val($('#select_login_instancias').val());     
                     $('#database_name').val($("#select_login_instancias option:selected").html());
                    
                     $($('<li/>').html('<a href="#all" title = "Usted inició sesión como '+ NombreUsuario +'">'+NombreUsuario+'</a>')).insertAfter('#barra_sup_username');
                     $($('<li/>').html('<a href="#all" title = "Usted se encuentra en la instancia '+NombreInstancia+'">'+NombreInstancia+'</a>')).insertAfter('#barra_sup_username');

                     EnvironmentData.NombreUsuario = NombreUsuario;
                     EnvironmentData.DataBaseName = NombreInstancia;
                     EnvironmentData.IdUsuario = IdUsuario;
                     EnvironmentData.NombreGrupo = NombreGrupo;
                     EnvironmentData.IdGrupo = IdGrupo;

                     UserData = {IDataBaseName: EnvironmentData.DataBaseName, dUser:EnvironmentData.IdUsuario, UserName:EnvironmentData.NombreUsuario, IdGroup:EnvironmentData.IdGrupo, GroupName:EnvironmentData.NombreGrupo};

                     
                     /* Líneas para DEMO */
                     if(EnvironmentData.NombreUsuario==='eduardo' || EnvironmentData.NombreUsuario==='marco')
                        $('.link_content_management').remove();
                    else
                        $('.link_FollowUp').remove();
                    
                    if(idInstance>0)
                    {
                        var ApplyPermissions = Permissions.ApplyUserPermissions();
                        if(ApplyPermissions)
                            StartSystem();
                    }
                    else
                        StartSystem();
                    
                }
                else
                    DeniedSystemStart();
                                
            });              
            
            $(xml).find("Error").each(function()
            {
                var mensaje=$(this).find("Mensaje").text();
                Error(mensaje);
            });
            
      },
      beforeSend:function(){},
      error: function(jqXHR, textStatus, errorThrown){$('.loading').remove(); Error(textStatus +"<br>"+ errorThrown);}
    });
    
    return activeSession;
}