/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global Permissions, EnvironmentData */

/*******************************************************************************
 * 
 * @returns {true or false dependiendo si existe el usuario en la BD}
 */

function login()
{            
    var User=$('#form_user').val();
    var Password=$('#form_password').val();
    var instancia=$('#select_login_instancias').val();
    var database_name= $("#select_login_instancias option:selected").html();
    
    $.ajax({
      async:true, 
      cache:false,
      dataType:"html", 
      type: 'POST',   
      url: "php/Login.php",
      data: "opcion=Login&user="+User+"&password="+Password+"&instancia="+instancia+"&database_name="+database_name, 
      success:  function(xml){
          $('.loading').remove();

          ($.parseXML( xml )===null) ? Salida(xml) : xml=$.parseXML( xml );

           $(xml).find("StartSession").each(function()
            {                               
                var IdUsuario=$(this).find("IdUsuario").text();
                var NombreUsuario = $(this).find("Login").text();  
                var NombreGrupo= $(this).find("NombreGrupo").text();
                var IdGrupo = $(this).find("IdGrupo").text();
                var NombreInstancia = $("#select_login_instancias option:selected").html();
                if(IdUsuario>0)
                {                
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

                     
                     
                     /* Líneas para DEMO */
                     if(EnvironmentData.NombreUsuario==='eduardo' || EnvironmentData.NombreUsuario==='marco')
                        $('.link_content_management').remove();
                    else
                        $('.link_FollowUp').remove();
                    
                    if(instancia>0)
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
}
