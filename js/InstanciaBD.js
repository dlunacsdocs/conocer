/* 
 *  Variable Global:  @BotonesWindow        Declarada en 
 */
/* global EnvironmentData, visor_Width, visor_Height, BotonesWindow */

$(document).ready(function()
{
    $('.LinkNewInstance').click(function()
    {
        mostrar_crear_instanciaBD();
    });
    $('.LinkDeleteInstance').click(function()
    {
        var instance = new Instances();
         instance.DeleteInstance();
    });
    
    $('#img_ejemplo_xsd').click(function()
    {
        $('#vista_previa_xsd').dialog({width:visor_Width, height:visor_Height, 
            minHeight:500, minWidth:500, title:"XSD Default"}).dialogExtend(BotonesWindow);
    });
});

function getListInstances()
{
    ajax=objetoAjax();
    ajax.open("POST", 'php/Login.php',true);
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=utf-8;");
    ajax.send("opcion=getInstances");
    ajax.onreadystatechange=function() 
    {
       if (ajax.readyState===4 && ajax.status===200) 
       {
          if(ajax.responseXML===null){Error(ajax.responseText);return;     }              
           var xml = ajax.responseXML;
           $(xml).find("Instancia").each(function()
            {
               var $Instancia=$(this);
               var id=$Instancia.find("IdInstancia").text();
               var nombre = $Instancia.find("NombreInstancia").text();  
               $("#select_login_instancias").append("<option value=\""+id+"\">"+nombre+"</option>");
            });
            $(xml).find("Error").each(function()
            {
                var $Instancias=$(this);
                var estado=$Instancias.find("Estado").text();
                var mensaje=$Instancias.find("mensaje").text();
                Error(mensaje);
            });
            
       }       
   };
}

function mostrar_crear_instanciaBD()
{
    $('#window_crear_instanciaBD').empty();
    $('#window_crear_instanciaBD').append('<div class="titulo_ventana">Crear Nueva Instancia</div>');
    $('#window_crear_instanciaBD').append('<p>Ingrese el XML para la creación de la Instancia <img src="img/information.png" class="img_information" id="img_ejemplo_xsd" title="ejemplo de XSD"></p><br>');
    $('#window_crear_instanciaBD').append('<p><input type="file" id="xml_nueva_instancia" accept="text/xml"></p>');
    $('#window_crear_instanciaBD').dialog(
        {
            minHeight:500,minWidth:500,width:500, height:500, title:"Agregar Nueva Instancia al Sistema",
            buttons:{"Aceptar":function(){CreateInstancia();}, "Cancelar":function(){$(this).dialog('close');}}
        }).dialogExtend(BotonesWindow);  
}
/* Se recoge el XML introducido por el Usuario y se envia al servidor para su lectura*/
function CreateInstancia()
{
    var xml_usuario=document.getElementById("xml_nueva_instancia");
    var archivo = xml_usuario.files;     
    var data = new FormData();
      
    if(!(archivo.length>0)){Advertencia('Debe seleccionar un XMl con la estructura de una nueva Instancia'); return;}
      
    for(i=0; i<archivo.length; i++)
      {
            data.append('archivo',archivo[i]);
            data.append('opcion','ReadXML');
            data.append('id_usuario',EnvironmentData.IdUsuario);
            data.append('nombre_usuario',EnvironmentData.NombreUsuario);
      }
      
      Loading();
      
    ajax=objetoAjax();
    ajax.open("POST", 'php/XML.php',true);
//    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=utf-8;");
    ajax.send(data);    
    ajax.onreadystatechange=function() 
    {             
        if (ajax.readyState===4 && ajax.status===200) 
       { 
           $('#Loading').dialog('close');   
           mostrar_crear_instanciaBD();
           Salida(ajax.responseText);
//           if(ajax.responseXML===null){Salida(ajax.responseText);return;}                  
//            var xml=ajax.responseXML;           

        }
    };

//        $.ajax({
//        async:true, 
//        cache:false,
////        dataType:"html", 
//        contentType: false,
//        processData: false,
//        type: 'POST',   
//        url: "php/XML.php",
//        data: data, 
//        success:  function(xml)
//        {     
//            $('#Loading').dialog('close');
//            if($.parseXML( xml )===null){Salida(xml); return 0;}else xml=$.parseXML( xml );         
//
//            $(xml).find("Error").each(function()
//            {
//                var $Error=$(this);
//                var estado=$Error.find("Estado").text();
//                var mensaje=$Error.find("Mensaje").text();
//                Error(mensaje);
//
//            });                 
//
//        },
//        beforeSend:function(){},
//        error: function(jqXHR, textStatus, errorThrown){$('#Loading').dialog('close'); Error(textStatus +"<br>"+ errorThrown);}
//        });    
   };

var Instances = function()
{
    _ConfirmDeleteInstance = function()
    {
        var InstanceName = $('#DeleteInstanceForm option:selected').html();
        var IdInstance = $('#DeleteInstanceForm').val();
        
        if(!(IdInstance>0))
            return 0;

        $('body').append('<div id = "DivConfirmDeleteInstance"></div>');
        $('#DivConfirmDeleteInstance').dialog({title:'Mensaje de confirmacion', width:300, minWidth:300, height:300, minHeight:300, modal:true, closeOnEscape:false, 
            buttons:{Aceptar:{text:'Aceptar', click:function(){_DeleteInstance(IdInstance, InstanceName);$(this).dialog('destroy');}}}});
        $('#DivConfirmDeleteInstance').append('<p>¿Realmente desea eliminar la instancia <b>'+InstanceName+'? El proceso no puede revertirse.</b></p>');
    };
    
    _DeleteInstance = function(IdInstance, InstanceName)
    {
        
        $.ajax({
        async:false, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/Instance.php",
        data: 'option=DeleteInstance&IdUser='+EnvironmentData.IdUsuario+'&UserName='+EnvironmentData.NombreUsuario+'&IdInstance='+IdInstance+'&InstanceName='+InstanceName,
        success:  function(xml)
        {     
            if($.parseXML( xml )===null){Salida(xml); return 0;}else xml=$.parseXML( xml );         

            $(xml).find('DeleteInstance').each(function()
            {
                var Mensaje = $(this).find('Mensaje').text();
                Notificacion(Mensaje);
                $('#DivDeleteInstance').dialog('destroy');
            });
            
            $(xml).find("Error").each(function()
            {
                var mensaje = $(this).find("Mensaje").text();
                Error(mensaje);
            });                   

        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){Error(textStatus +"<br>"+ errorThrown);}
        });    
    };
};

Instances.prototype.DeleteInstance = function()
{
    /* Permisos únicamente para root (Modificar para agregarlo a las opciones de permissos) */
    if(EnvironmentData.IdUsuario!==1 && EnvironmentData.NombreUsuario!=='root')
        return;
    
    $("#DivDeleteInstance").remove();
    $('body').append('<div id = "DivDeleteInstance"></div>');
    var xml = this.GetInstances();
    console.log(xml);
    $('#DivDeleteInstance').dialog({title:"Eliminar una instancia", width:400, height:400, minHeight:300, minWidth:300,closeOnEcape:false, 
        buttons:{"Eliminar":{text:"Eliminar", click:function(){_ConfirmDeleteInstance();}}},
        Cancelar:{click:{text:"Cancelar", click:function(){$(this).dialog("destroy");}}}});
    $('#DivDeleteInstance').append('<p>Seleccione la instancia a eliminar, recuerde que este proceso no puede revertirse</p>');
    $('#DivDeleteInstance').append('<br><select id ="DeleteInstanceForm"><option>Seleccione un instancia</option></select>');
    $(xml).find('Instance').each(function()
    {       
        var IdInstance = $(this).find('IdInstancia').text();
        var InstanceName = $(this).find('NombreInstancia').text();
        $('#DeleteInstanceForm').append('<option value = "'+IdInstance+'">'+InstanceName+'</option>');
    });
};

Instances.prototype.GetInstances = function()
{
    var xml = 0;
    $.ajax({
    async:false, 
    cache:false,
    dataType:"html", 
    type: 'POST',   
    url: "php/Instance.php",
    data: 'option=GetInstances&IdUser='+EnvironmentData.IdUsuario+'&UserName='+EnvironmentData.NombreUsuario, 
    success:  function(response)
    {     
        if($.parseXML( response )===null){Salida(response); return 0;}else xml=$.parseXML( response );         

        $(xml).find("Error").each(function()
        {
            var $Error=$(this);
            var estado=$Error.find("Estado").text();
            var mensaje=$Error.find("Mensaje").text();
            Error(mensaje);
            return 0;
        });        
        
        return xml;

    },
    beforeSend:function(){},
    error: function(jqXHR, textStatus, errorThrown){Error(textStatus +"<br>"+ errorThrown);}
    });    
    
    return xml;
};
