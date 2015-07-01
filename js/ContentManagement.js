/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* global Permissions, BotonesWindow */

var WindowContentManagement={width:dWidth, height:dHeight, title:"CSDocs", minWidth:800, minHeight:800,closeOnEscape:false};

$(document).ready(function()
{             
   $('.LinkContainer').click(function()
   {        
        CleaningContent();
                        
       $('#content_management').dialog(WindowContentManagement).dialogExtend(BotonesWindow);
       $( "#tabs" ).tabs();
       $( "#tabs li" ).removeClass( "ui-corner-top" );        
                     
       getEmpresas();      
       
   }) ;
   
   $('#CM_select_empresas').change(function()
       {
            CleaningContent();
           
           if(($('#CM_select_empresas').val())>0)
               getRepositorios();
           else
           {
               $('#CM_select_repositorios').empty().append("<option value=\""+0+"\">Seleccione una Empresa</option>");
               
                CleaningContent();      
           }           
       });
       
       $('#CM_select_repositorios').change(function()
       {
           var IdRepositorio = $('#CM_select_repositorios').val();
           if(IdRepositorio>0)
           {
               Permissions.ApplyUserPermissions(IdRepositorio);
               CM_getTree();             
           }                
           else
               CleaningContent();
       });
           
});

function CleaningContent()
{
    /* Se limpia árbol y contenedor de archivos */
    var emptyTest = $('#contentTree').is(':empty');
    if(!emptyTest)
    {
        var node = $("#contentTree").dynatree("getActiveNode");
        if(node)
            $('#contentTree').dynatree("destroy");

        $('#contentTree').empty(); 
    }
    
    $('.contentDetail').empty();
}

/*******************************************************************************
 * Se obtiene el listado de emmpresas y se muestran en el Content Management
 * @returns {List de Empresas}
 */
function getEmpresas()
{
//    var arbol=InitDynatree();
//    var node=arbol.dynatree("getActiveNode");                              
//    if(node){    arbol.dynatree("destroy"); $('#contentTree').empty(); }     
//    $('.contentDetail').empty();
    
    
    $('#CM_select_repositorios').empty().append("<option value=\""+0+"\">Seleccione una Empresa</option>");
    
    var DataBase=$('#database_usr').val();
    var IdUsuario=$('#id_usr').val();
    ajax=objetoAjax();
    ajax.open("POST", 'php/ContentManagement.php',true);
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=utf-8;");
    ajax.send("opcion=getListEmpresas&DataBase="+DataBase+'&IdUsuario='+IdUsuario);
    ajax.onreadystatechange=function() 
    {
       if (ajax.readyState===4 && ajax.status===200) 
       {
          if(ajax.responseXML===null){Error(ajax.responseText);return;     }  
           var xml = ajax.responseXML;
           $("#CM_select_empresas option").remove();
           $("#CM_select_empresas").append("<option value='0'>Seleccione una Empresa</option>");
           $("#CM_engine_empresas option").remove();
           $("#CM_engine_empresas").append("<option value='0'>Seleccione una Empresa</option>");
           $(xml).find("Empresa").each(function()
            {
               var $Empresa=$(this);
               var id=$Empresa.find("IdEmpresa").text();
               var nombre = $Empresa.find("NombreEmpresa").text();  
               $("#CM_select_empresas").append("<option value=\""+id+"\">"+nombre+"</option>");
               $("#CM_engine_empresas").append("<option value=\""+id+"\">"+nombre+"</option>");
            });
            $(xml).find("Error").each(function()
            {
                var $Instancias=$(this);
                var estado=$Instancias.find("Estado").text();
                var mensaje=$Instancias.find("Mensaje").text();
                Error(mensaje);
            });
            
       }       
   };
}

function getListEmpresas(SelectEmpresas)
{
    var DataBase=$('#database_usr').val();
    var IdUsuario=$('#id_usr').val();
   
   $.ajax({
      async:false, 
      cache:false,
      dataType:"xml", 
      type: 'POST',   
      url: "php/ContentManagement.php",
      data: "opcion=getListEmpresas&DataBase="+DataBase+'&IdUsuario='+IdUsuario, 
      success:  function(respuesta){
          if(respuesta===null){Error(respuesta);return 0;}
           var xml=respuesta; 
           $("#"+SelectEmpresas+" option").remove();
           $("#"+SelectEmpresas).append("<option value='0'>Seleccione una Empresa</option>");
           $(xml).find("Empresa").each(function()
            {
               var $Empresa=$(this);
               var id=$Empresa.find("IdEmpresa").text();
               var clave=$Empresa.find("ClaveEmpresa").text();
               var nombre = $Empresa.find("NombreEmpresa").text();  
               $("#"+SelectEmpresas).append("<option value=\""+id+","+clave+"\">"+nombre+" ( "+clave+" )</option>");
            });
            $(xml).find("Error").each(function()
            {
                var $Instancias=$(this);
                var estado=$Instancias.find("Estado").text();
                var mensaje=$Instancias.find("Mensaje").text();
                Error(mensaje);
            });
      },
      beforeSend:function(){},
      error:function(objXMLHttpRequest){Error(objXMLHttpRequest);}
    });
}

function getRepositorios()
{
    var IdEmpresa=$('#CM_select_empresas').val();
  
     $.ajax({
      async:true, 
      cache:false,
      dataType:"html", 
      type: 'POST',   
      url: "php/ContentManagement.php",
      data: "opcion=getListRepositorios&DataBaseName="+EnvironmentData.DataBaseName+'&IdUsuario='+EnvironmentData.IdUsuario+'&IdGrupo='+EnvironmentData.IdGrupo+'&NombreGrupo='+EnvironmentData.NombreGrupo+'&IdEmpresa='+IdEmpresa, 
      success:  function(xml){
          
          if($.parseXML( xml )===null){ Error(xml); return 0;}else xml=$.parseXML( xml );         

           $("#CM_select_repositorios option").remove();
           $("#CM_select_repositorios").append("<option value='0'>Seleccione un Repositorio</option>");
           $(xml).find("Repositorio").each(function()
            {
               var $Empresa=$(this);
               var id=$Empresa.find("IdRepositorio").text();
               var nombre = $Empresa.find("NombreRepositorio").text();  
               $("#CM_select_repositorios").append("<option value=\""+id+"\">"+nombre+"</option>");
            });
            $(xml).find("Error").each(function()
            {
                var mensaje=$(this).find("Mensaje").text();
                Error(mensaje);
            });
      },
      beforeSend:function(){},
      error:function(objXMLHttpRequest){Error(objXMLHttpRequest);}
    });    
   
}


function getListRepositorios(IdEmpresa,SelectRepositorio)
{
   
      $.ajax({
      async:false, 
      cache:false,
      dataType:"html", 
      type: 'POST',   
      url: "php/ContentManagement.php",
      data: "opcion=getListRepositorios&DataBaseName="+EnvironmentData.DataBaseName+'&IdUsuario='+EnvironmentData.IdUsuario+'&IdGrupo='+EnvironmentData.IdGrupo+'&NombreGrupo='+EnvironmentData.NombreGrupo+'&IdEmpresa='+IdEmpresa, 
      success:  function(xml){
          
          if($.parseXML( xml )===null){ Error(xml); return 0;}else xml=$.parseXML( xml );         

           $("#"+SelectRepositorio+" option").remove();
           $("#"+SelectRepositorio).append("<option value='0'>Seleccione una Empresa</option>");
           $(xml).find("Repositorio").each(function()
            {
               var id=$(this).find("IdRepositorio").text();
               var nombre = $(this).find("NombreRepositorio").text();  
               $("#"+SelectRepositorio).append("<option value=\""+id+"\">"+nombre+"</option>");
            });
            $(xml).find("Error").each(function()
            {
                var mensaje=$(this).find("Mensaje").text();
                Error(mensaje);
            });
      },
      beforeSend:function(){},
      error:function(objXMLHttpRequest){Error(objXMLHttpRequest);}
    });    
}
