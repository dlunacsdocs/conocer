/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var UserData = undefined;

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
      data: "opcion=Login&UserName="+User+"&Password="+Password+"&IdDataBase="+instancia+"&DataBaseName="+database_name, 
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
                     EnvironmentData.idDataBase = instancia;
                     EnvironmentData.DataBaseName = NombreInstancia;
                     EnvironmentData.IdUsuario = IdUsuario;
                     EnvironmentData.NombreGrupo = NombreGrupo;
                     EnvironmentData.IdGrupo = IdGrupo;
                     console.log(EnvironmentData);
                     UserData = {IDataBaseName: EnvironmentData.DataBaseName, dUser:EnvironmentData.IdUsuario, UserName:EnvironmentData.NombreUsuario, IdGroup:EnvironmentData.IdGrupo, GroupName:EnvironmentData.NombreGrupo};

                     
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
