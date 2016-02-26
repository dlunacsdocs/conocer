/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* global TableContentDT, TableContentdT, EnvironmentData, EnvironmentData, Random, DataTable */

var CM_Carga={width:300, height:500, minWidth:300, minHeight:300,modal:true, title:"Carga de Archivo",
    buttons: {Aceptar: function() {$( this ).dialog( "close" );$( this ).dialog( "destroy" );}}};

var DirectorioOrigen = '', DirectorioDestino = '', IdDirectorioOrigen = 0, IdDirectorioDestino = 0;
var Catalogs = new ClassCatalogAdministrator();
$(document).ready(function()
{        

});

var ClassTools = function()
{
    var self = this;
    
    _ConfirmNewMassiveUpload = function()
    {
        $('#DivConfirmNewMassiveLoad').remove();
        $('body').append('<div id = "DivConfirmNewMassiveLoad"></div>');
        $('#DivConfirmNewMassiveLoad').append('<p>Se ha detectado una carga masiva que no se completo anteriormente.</p><p> Sí de sea continuar, asegurese de haber colocado los documentos en la ruta correspondiente antes de presionar en <b>Iniciar</b></p>');
        $('#DivConfirmNewMassiveLoad').dialog({title:"Mensaje de Confirmación", width:350, minWidth:200, height:250, minHeight:200, modal:true, closeOnEscape:false, close:function(){$(this).remove();}, buttons:{
                Cancelar:function(){$(this).remove();},
                Iniciar:{click:function(){$(this).remove(); _NewMassiveUpload();}, text:"Iniciar"}
        }});
    };
    
    _NewMassiveUpload = function()
    {
        var node = $("#contentTree").dynatree("getActiveNode");    
        if(!node){Advertencia('Debe Seleccionar un Directorio.'); return;}
        var IdFile=$('#table_DetailResult tr.selected').attr('id'); 
        var Path=node.getKeyPath();
        var IdDirectory=node.data.key;

        var IdParent=node.getParent();
        IdParent=IdParent.data.key;
        var IdRepositorio = $('#CM_select_repositorios').val();
        var NombreRepositorio = $('#CM_select_repositorios option:selected').html();
        var IdEmpresa = $('#CM_select_empresas option:selected').attr('id');
        IdEmpresa = parseInt(IdEmpresa);
        var NombreEmpresa = $('#CM_select_empresas option:selected').html();
        var SourceMassiveUpload = $('#SelectMassiverUpload').val();

        $.ajax({
        async:false, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/MassiveUpload.php",
        data: 'opcion=NewMassiveUpload&IdRepository='+IdRepositorio+'&DataBaseName='+EnvironmentData.DataBaseName+'&IdUser='+EnvironmentData.IdUsuario+'&UserName='+EnvironmentData.NombreUsuario+'&RepositoryName='+NombreRepositorio+'&Path='+Path+'&IdParent='+IdParent+'&IdDirectory='+IdDirectory+'&IdEnterprise='+IdEmpresa+"&Random="+Random+"&EnterpriseName="+NombreEmpresa+'&SourceMassiveUpload='+SourceMassiveUpload, 
        success:  function(xml){
            $('#div_MassiveLoad').remove();
            Salida(xml);
        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown) {errorMessage(textStatus +"<br>"+ errorThrown);}
        });
    };
    
    _CheckMassiveUploadIncomplete = function()
    {        
        var xml = 0;

        $.ajax({
        async:false, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/MassiveUpload.php",
        data: 'opcion=CheckMassiveUploadIncomplete&DataBaseName='+EnvironmentData.DataBaseName+'&IdUser='+EnvironmentData.IdUsuario+'&UserName='+EnvironmentData.NombreUsuario, 
        success:  function(response){

            if($.parseXML( response )===null){ errorMessage(response); return 0;}else xml=$.parseXML( response );

            $(xml).find("Exist").each(function()/* Sí existen archivos pendientes */ 
            {                
                xml = 1;
            });

            $(xml).find("NotExist").each(function()/* Sí existen archivos pendientes */ 
            {                      
                xml = 0;
            });

            $(xml).find("Error").each(function()
            {
                $('#div_MassiveLoad').remove();
                var $Error=$(this);
                var estado=$Error.find("Estado").text();
                var mensaje=$Error.find("Mensaje").text();
                errorMessage(mensaje);
                xml = 0;
            });       
        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown) {errorMessage(textStatus +"<br>"+ errorThrown);}
        });

        return xml;
    };

    _ResumeMassiveUpload = function()
    {
        $.ajax({
        async:false, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/MassiveUpload.php",
        data: 'opcion=ResumeMassiveUpload&DataBaseName='+EnvironmentData.DataBaseName+'&IdUser='+EnvironmentData.IdUsuario+'&UserName='+EnvironmentData.NombreUsuario, 
        success:  function(xml){
            $('#div_MassiveLoad').remove();
            
            Salida(xml);
        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown) {errorMessage(textStatus +"<br>"+ errorThrown);}
        });
    };
};

ClassTools.prototype.DisplayMassiveUploadDialog = function()
{
    var self = this;
    var node = $("#contentTree").dynatree("getActiveNode");    
    if(!node){Advertencia('Debe Seleccionar un Directorio.'); return;}
    
    var Buttons = {
        "Cancelar":{click:function(){$(this).remove();}, text:"Cancelar"},"Iniciar":{text:"Nueva Carga",
        click:function(){_NewMassiveUpload();}}
    };
    
    $('#div_MassiveLoad').remove();
    $('body').append('<div id = "div_MassiveLoad"></div>');
    $('#div_MassiveLoad').append('<div class="Loading" id = "LoadingIconMassiveUpload"><img src="../img/loadinfologin.gif"></div>');
    $('#div_MassiveLoad').append('<center><img src="img/upload.png" title="Carga Masiva"></center>');    
    $('#div_MassiveLoad').append('<p>Por favor ingrese en la carpeta compartida   <b>\"Publisher/'+ EnvironmentData.DataBaseName +'/'+EnvironmentData.NombreUsuario +'/ \"</b> la estructura de directorio(s) que desea cargar en el sistema.</p><br><p>Al terminar de ingresar la estructura por favor pulse en el botón <b>\"Nueva Carga\"</p>');
    $('#div_MassiveLoad').append('\
    <select id = "SelectMassiverUpload" class="FormStandart">\n\
        <option value = "1">Local (CSDocs)</option>\n\
        <option value = "2">Capture</option>\n\
    </select>');
    $('#div_MassiveLoad').dialog({width:300,height:500, minWidth:300, minHeight:500, modal:true, title:"Carga Masiva", close:function(){$(this).remove();},
    buttons:Buttons});
    
    $("#div_MassiveLoad button:contains('Confirm')").button("disable");
    
    var UploadIncomplete = _CheckMassiveUploadIncomplete();
    console.log(UploadIncomplete);
    
    if(UploadIncomplete===1)
    {
        Buttons = {
            "Cancelar":{click:function(){$(this).remove();},  text:"Cancelar"},
            "Reanudar":{click:function(){_ResumeMassiveUpload();}, text:"Reanudar Carga Masiva"},
            "Nueva":{click:function(){_ConfirmNewMassiveUpload();}, text:"Nueva Carga Masiva"}
        };
        $('#div_MassiveLoad').dialog('option','width', 500);
        $('#div_MassiveLoad').dialog('option','buttons', Buttons);
        $('#div_MassiveLoad').append('<p><b>Atención:</b> existe una carga masiva "pendiente" por completar</p>');
    }
    
    $("#div_MassiveLoad button:contains('Confirm')").button("enable");
    
    $('#LoadingIconMassiveUpload').remove();
};

/*******************************************************************************
 *  Se comprueba si existen archivos pendientes de carga en la carpeta del usuario
 * @returns {undefined}
 */
function CheckMassiveLoadPending()
{
    var node = $("#contentTree").dynatree("getActiveNode");    
    if(!node){Advertencia('Debe Seleccionar un Directorio.'); return;}
    var IdFile=$('#table_DetailResult tr.selected').attr('id'); 
    Loading();
    var Path=node.getKeyPath();
    var IdDirectory=node.data.key;
          
    var IdParent=node.getParent();
    IdParent=IdParent.data.key;
    var IdRepositorio = $('#CM_select_repositorios').val();
    var NombreRepositorio = $('#CM_select_repositorios option:selected').html();
    var IdEmpresa = $('#CM_select_empresas option:selected').attr('id');
    IdEmpresa = parseInt(IdEmpresa);
    var NombreEmpresa = $('#CM_select_empresas option:selected').html();
        
    $.ajax({
    async:true, 
    cache:false,
    dataType:"html", 
    type: 'POST',   
    url: "php/MassiveUpload.php",
    data: 'opcion=CheckMassiveLoadPending&IdRepositorio='+IdRepositorio+'&DataBaseName='+EnvironmentData.DataBaseName+'&id_usuario='+EnvironmentData.IdUsuario+'&nombre_usuario='+EnvironmentData.NombreUsuario+'&NombreRepositorio='+NombreRepositorio+'&Path='+Path+'&IdParent='+IdParent+'&IdDirectory='+IdDirectory+'&IdEmpresa='+IdEmpresa+"&Random="+Random+"&NombreEmpresa="+NombreEmpresa, 
    success:  function(xml){
        $('#Loading').dialog('close');
        if($.parseXML( xml )===null){ errorMessage(xml); return 0;}else xml=$.parseXML( xml );
        $(xml).find("MassiveLoad").each(function()
        {                                   
            var $Carga=$(this);
            var Mensaje=$Carga.find("Mensaje").text();  
            $('#div_MassiveLoad').empty();
            $('#div_MassiveLoad').append('<center><img src="img/upload.png" title="Carga Masiva"></center>');
            $('#div_MassiveLoad').append(Mensaje);
            $('#div_MassiveLoad').dialog({width:300,height:500, minWidth:300, minHeight:500, modal:true, title:"Carga Masiva",
            buttons:{"Iniciar":function(){$(this).dialog('close'); AnswerOfUserML('StartMassiveLoad');},
            "Cancelar":function(){$(this).dialog('close');}}});
        });
        $(xml).find("MassiveLoadPending").each(function()/* Sí existen archivos pendientes */ 
        {                                   
            var $Carga=$(this);
            var Mensaje=$Carga.find("Mensaje").text();
            QuestionResumeMassiveLoad(Mensaje);
        });
        $(xml).find("Error").each(function()
        {
            var $Error=$(this);
            var estado=$Error.find("Estado").text();
            var mensaje=$Error.find("Mensaje").text();
            errorMessage(mensaje);
        });       
    },
    beforeSend:function(){},
    error: function(jqXHR, textStatus, errorThrown) {errorMessage(textStatus +"<br>"+ errorThrown);}
    });
}

/***************************************************************************
 * Respuesta dada por el usuario para reanudar una carga o comenzar una nueva
 * 
 * @param {type} Answer
 * @returns {undefined}
 */
function AnswerOfUserML(Answer)
{    
    var node = $("#contentTree").dynatree("getActiveNode");    
    if(!node){Advertencia('Debe Seleccionar un Directorio.');}
    var IdFile=$('#table_DetailResult tr.selected').attr('id'); 
    Loading();
    var Path=node.getKeyPath();
    var IdDirectory=node.data.key;
          
    Salida();    
          
    var IdParent=node.getParent();
    IdParent=IdParent.data.key;
    var IdRepositorio=$('#CM_select_repositorios').val();
    var NombreRepositorio=$('#CM_select_repositorios option:selected').html();
    var IdEmpresa = $('#CM_select_empresas option:selected').attr('id');
    IdEmpresa = parseInt(IdEmpresa);
    
    ajax=objetoAjax();
        ajax.open("POST", 'php/MassiveUpload.php',true);
        ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=utf-8;");
        ajax.send('opcion=AnswerOfUserML&IdRepositorio='+IdRepositorio+'&DataBaseName='+EnvironmentData.DataBaseName+'&id_usuario='+EnvironmentData.IdUsuario+'&nombre_usuario='+EnvironmentData.NombreUsuario+'&NombreRepositorio='+NombreRepositorio+'&Path='+Path+'&IdParent='+IdParent+'&IdDirectory='+IdDirectory+'&IdEmpresa='+IdEmpresa+'&Answer='+Answer+"&Random="+Random);    
        ajax.onreadystatechange=function() 
        {        
            if (ajax.readyState===4 && ajax.status===200) 
           {
               CM_getTree();
               
               $('#Loading').dialog('close');
               if(ajax.responseXML===null){$('#MensajeSalida').append(ajax.responseText);return;}
               var xml=ajax.responseXML;
               $(xml).find("Resultado").each(function()
                {          
//                    CM_getTree();
                    var $Resultado=$(this);
                    var Mensaje=$Resultado.find("Mensaje").text();  /* Sí existen archivos pendientes */                     
                    
                });
                $(xml).find("Error").each(function()
                {
                    var $Error=$(this);
                    var estado=$Error.find("Estado").text();
                    var mensaje=$Error.find("Mensaje").text();
                    errorMessage(mensaje);
                });       
            }
            else
            {
                $('#MensajeSalida').append(ajax.responseText);
            }
        };
}

/* Sí se detecta alguna carga pendiente se pregunta si desea reanudarla */
function QuestionResumeMassiveLoad(mensaje)
{
    $('#ResumeMassiveLoad').remove();
    $('#content_management').append('<div id="ResumeMassiveLoad" class="Mensajes"><div class="titulo_ventana">Sesión Pendiente de Carga Masiva</div></div>');
    $('#ResumeMassiveLoad').append(mensaje);
    $('#ResumeMassiveLoad').append('<p>Existe una carga masiva anterior, pulse en "Si" para reanudarla, Sí desea iniciar una nueva carga </p>');
    $('#ResumeMassiveLoad').dialog({title:'Sesión de Carga Masiva Detectada', width:400, height:500, minHeight:500,
    minWidth:400, modal:true, buttons:{"Mostrar Archivos":function(){ShowLoadPending();},
    "Si":function(){AnswerOfUserML('ResumeMassiveLoad');},
    "No":function(){AnswerOfUserML('StartMassiveLoad');}}});
}

/*******************************************************************************
 * Se muestran los archivos pendientes de carga (Carga masiva) del usuario.
 * @param {xml} xml     Contiene la estructura de archivos pendientes para una carga masiva
 * @returns {undefined}
 */
function ShowLoadPending(xml)
{
    
}

function CutFile()
{
    var node=$("#contentTree").dynatree("getActiveNode");
    CutIdDirectory= node.data.key;
    DirectorioOrigen = node.data.title;
    var IdFile=$('#table_DetailResult tr.selected').attr('id');
     if(!(IdFile>0)){Advertencia('Seleccione un archivo.');return;}    /* Sino se ha seleccionado un archivo */           
    
    var Tabla=$('#table_DetailResult').dataTable();
    
    $('#table_DetailResult tr.selected').each(function()
    {
        var position = Tabla.fnGetPosition(this); // getting the clicked row position
        CutNombreArchivo = Tabla.fnGetData(position)[0];
        CutRutaArchivo=Tabla.fnGetData(position)[6];
    });
    CutIdFile=IdFile;
    
    CopyNombreArchivo = 0;
    CopyRutaArchivo=0;
    CopyIdFile=0;
}

function CopyFile()
{
    var node=$("#contentTree").dynatree("getActiveNode");
    if(!node){Advertencia("Seleccione un directorio y después un documento."); return;}
    var IdFile=$('#table_DetailResult tr.selected').attr('id');
     if(!(IdFile>0)){Advertencia('Seleccione un archivo.');return;}    /* Sino se ha seleccionado un archivo */ 
     
    var searchTable = TableContentdT;
    
    $('#table_DetailResult tr.selected').each(function()
    {
        var position = searchTable.fnGetPosition(this); // getting the clicked row position
        var Ruta = searchTable.fnGetData(position)[6]; // getting the value of the first (invisible) column
        var NombreArchivo=searchTable.fnGetData(position)[0];
        CopyNombreArchivo = NombreArchivo; 
        CopyRutaArchivo=Ruta;    
    });
    CopyIdFile=IdFile;
    DirectorioDestino = node.data.title;
    
    CutNombreArchivo = 0; 
    CutRutaArchivo=0;
    CutIdFile=0;
    CutIdDirectory=0;

}

function PasteFile()
{
    var node = $("#contentTree").dynatree("getActiveNode");
    
    if(CopyIdFile===0 && CutIdFile===0){Advertencia("Debe copiar o cortar un archivo."); return;}
    if(CutIdDirectory===node.data.key){Advertencia("El archivo de origen y de destino es el mismo."); return;}
    if(!(node.data.key>0)){Advertencia("Seleccione un directorio destino."); return;}
    
    IdDirectorioOrigen  = CutIdDirectory;
    IdDirectorioDestino = node.data.key;
    
    var opcion;
    
    if(CopyIdFile===0)
    {
        opcion='opcion=CutFile&RutaArchivo='+CutRutaArchivo;
        opcion+="&NombreArchivo="+CutNombreArchivo+'&IdFile='+CutIdFile+"&DirectorioOrigen="+DirectorioOrigen+"&DirectorioDestino="+DirectorioDestino+'&IdDirectorioOrigen='+IdDirectorioOrigen+'&IdDirectorioDestino='+IdDirectorioDestino;}
    else
    {
        opcion='opcion=CopyFile&RutaArchivo='+CopyRutaArchivo;
        opcion+="&NombreArchivo="+CopyNombreArchivo+'&IdFile='+CopyIdFile+"&DirectorioOrigen="+DirectorioOrigen+"&DirectorioDestino="+DirectorioDestino+'&IdDirectorioOrigen='+IdDirectorioOrigen+'&IdDirectorioDestino='+IdDirectorioDestino;
    }
    
    if(!node){Advertencia('Debe Seleccionar un Directorio.');}
    var IdFile=$('#table_DetailResult tr.selected').attr('id'); 
    
    Loading();

    var Path = node.getKeyPath();
    var IdDirectory = node.data.key;
    var NombreDirectorio = node.data.title;      
    var IdParent = node.getParent();
    IdParent = IdParent.data.key;
    var IdRepositorio = $('#CM_select_repositorios').val();
    var NombreRepositorio = $('#CM_select_repositorios option:selected').html();
    var IdEmpresa = $('#CM_select_empresas option:selected').attr('id');
    IdEmpresa = parseInt(IdEmpresa);
    var NombreEmpresa = $('#CM_select_empresas option:selected').html();
        
    /* Se reinicializan las variables de cortar */
    CutNombreArchivo = 0; 
    CutRutaArchivo=0;
    CutIdFile=0;
    CutIdDirectory=0;          
    
    $.ajax({
    async:true, 
    cache:false,
    dataType:'html', 
    type: 'POST',   
    url: "php/ContentManagement.php",
    data: opcion+'&IdRepositorio='+IdRepositorio+'&NombreRepositorio='+NombreRepositorio+'&Path='+Path+'&IdParent='+IdParent+'&IdDirectory='+IdDirectory+'&IdEmpresa='+IdEmpresa+"&NombreDirectorio="+NombreDirectorio+'&NombreEmpresa='+NombreEmpresa, 
    success:  function(xml){   
      $('#Loading').dialog('close');
      if($.parseXML( xml )===null){errorMessage(xml);return 0;}else xml=$.parseXML( xml );

         $(xml).find("Paste").each(function()
        {
            var $Paste=$(this);
            var mensaje=$Paste.find("Mensaje").text();
            var estado=$Paste.find("Estado").text();
            var NombreArchivo=$Paste.find("NombreArchivo").text();
            var FechaIngreso=$Paste.find("FechaIngreso").text();
            var TipoArchivo=$Paste.find("TipoArchivo").text();
            var Detalle=$Paste.find("Full").text();
            IdRepositorio=$Paste.find("IdRepositorio").text();
            var Ruta=$Paste.find("RutaArchivo").text();
            var RutaArchivo=$Paste.find("RutaArchivo").text();
            var RutaArchivoServer=location.host+'/'+Ruta;                    
            var node = $("#contentTree").dynatree("getActiveNode");

            var data =
            [
                NombreArchivo,
                FechaIngreso,
                TipoArchivo,
                Detalle,
                '<img src="img/acuse.png" title="vista previa de "'+NombreArchivo+'" onclick="Preview(\''+TipoArchivo+'\', \'0\', \''+ IdRepositorio +'\' , \'Content\')">',
                '<img src="img/metadata.png" title="vista previa de '+NombreArchivo+'" onclick="GetDetalle(\'Content\', \'0\', \''+IdRepositorio+'\')">',
                Ruta,
                '<center><input type="checkbox" id="'+IdRepositorio+'"  class="checkbox_detail"></center>'
            ];

            /* Se inserta la Fila y su Id */
            var ai = TableContentDT.row.add(data);         
            var n = TableContentdT.fnSettings().aoData[ ai[0] ].nTr;
            n.setAttribute('id',IdRepositorio);
            TableContentDT.draw();

            /* Sí se encuentra el archivo en la lista de descarga se selecciona el Checkbox  */
            if($('#table_download tbody tr[id='+IdRepositorio+']').length>0)
            {                    
                $('#table_DetailResult tbody tr[id='+IdRepositorio+'] input').prop("checked", true);
            }

            $('#table_DetailResult tbody tr[id='+IdRepositorio+']').addClass('selected');

                /* Se recoge el estado del CheckBox para agregarlo a la lista de descarga */
            $('#table_DetailResult tbody tr input').click(function(){
                var check= $(this).is(':checked');
                var IdCheck=$(this).attr('id');
                var IdTr=0;
                if(check)
                {
                    AddRowTableDownload(IdCheck);
                }
            });

            Notificacion(mensaje);

        });


        $(xml).find("Error").each(function()
        {
            var $Error=$(this);
            var estado=$Error.find("Estado").text();
            var mensaje=$Error.find("Mensaje").text();
            errorMessage(mensaje);
        });   
    },
    beforeSend:function(){},
    error:function(objXMLHttpRequest){errorMessage(objXMLHttpRequest); $('#Loading').dialog('close');}
    });
    
    
}

/*******************************************************************************
 *  Elimina un archivo del repositorio
 * @returns {undefined}
 */
function ConfirmDelete()
{
    var idRepository = $('#CM_select_repositorios').val();
    if(!parseInt(idRepository) > 0)
        return Advertencia("No fue posible obtener el identificador del repositorio seleccionado");
    
    if(!validateSystemPermission(idRepository, 'b6d767d2f8ed5d21a44b0e5886680cb9', 1))
        return Advertencia("No tiene permiso de realizar esta acción");

    var IdFile=$('#table_DetailResult tr.selected').attr('id'); 
    if(!(IdFile>0)){Advertencia('Seleccione antes un archivo'); return;}
    $('#div_confirmDelete').remove();
    $('#content_management').append('<div id="div_confirmDelete" class="Mensajes"></div>');
//    var NombreArchivo=$('#table_DetailResult tbody tr').find("td").eq(0).html();
    var NombreArchivo;
    
    $('#table_DetailResult tr.selected').each(function() {                                
        var position = TableContentdT.fnGetPosition(this); // getting the clicked row position                
        NombreArchivo=TableContentdT.fnGetData(position)[0];
    }); 
    
    $('#div_confirmDelete').append('<p>Está apunto de eliminar el archivo '+NombreArchivo+'. ¿Desea continuar?</p>');
    $('#div_confirmDelete').dialog({width:300, height:250, title:"Mensaje de Confirmación",modal:true,
        minHeight:250, minWidth:300, buttons:{
            "Aceptar":function(){$(this).dialog('close');DeleteFile();},
            "Cancelar":function(){$(this).dialog('close');}
        }});
}

function DeleteFile()
{   
    var IdFile=$('#table_DetailResult tr.selected').attr('id'); 
    if(!(IdFile>0)){Advertencia('Seleccione antes un archivo'); return;}
    Loading();
    var node = $("#contentTree").dynatree("getActiveNode");
    var Path=node.getKeyPath();
    var IdDirectory=node.data.key;    
    var IdParent=node.getParent();
    IdParent=IdParent.data.key;
    var IdRepositorio=$('#CM_select_repositorios').val();
    var NombreRepositorio=$('#CM_select_repositorios option:selected').html();
    var IdEmpresa = $('#CM_select_empresas option:selected').attr('id');

    if(!(node.data.key>0)){return;}
        
    $.ajax({
      async:true, 
      cache:false,
      dataType:'html', 
      type: 'POST',   
      url: "php/ContentManagement.php",
      data: "opcion=DeleteFile&IdRepositorio="+IdRepositorio+'&NombreRepositorio='+NombreRepositorio+'&Path='+Path+'&IdParent='+IdParent+'&IdDirectory='+IdDirectory+'&IdEmpresa='+IdEmpresa+'&IdFile='+IdFile, 
      success:  function(xml){   
          $('#Loading').dialog('close');
          if($.parseXML( xml )===null){errorMessage(xml);return 0;}else xml=$.parseXML( xml );
          
             $(xml).find("DeleteFile").each(function()
            {
                var $UploadFile=$(this);
                var estado=$UploadFile.find("Estado").text();
                var mensaje=$UploadFile.find("Mensaje").text();
                Notificacion(mensaje);
                TableContentDT.row('tr[id='+IdFile+']').remove().draw( false );
            });
            $(xml).find("Error").each(function()
            {
                var $Error=$(this);
                var estado=$Error.find("Estado").text();
                var mensaje=$Error.find("Mensaje").text();
                errorMessage(mensaje);
            });   
      },
      beforeSend:function(){},
      error:function(objXMLHttpRequest){errorMessage(objXMLHttpRequest); $('#Loading').dialog('close');}
    });
}



/*******************************************************************************
 *  Se edita el nombre de un archivo
 * @returns {undefined}
 */
function FileDedit()
{
    var IdFile=$('#table_DetailResult tr.selected').attr('id');
    if(!(IdFile>0)){Advertencia('Seleccione un archivo.');return;}    /* Sino se ha seleccionado un archivo */    
    var NombreArchivoActual='';

    $('#table_DetailResult tr[id='+IdFile+']').each(function() {                                
        var position = TableContentdT.fnGetPosition(this); // getting the clicked row position                
        NombreArchivoActual=TableContentdT.fnGetData(position)[0];
    }); 
    
    var extension= NombreArchivoActual.substr( (NombreArchivoActual.lastIndexOf('.') +1) );
    
    $('#div_FileEdit').empty();
    $('#div_FileEdit').append('<p>Nombre Actual: <input type="text" id="form_FileEditActual"></p>');
    $('#form_FileEditActual').val(NombreArchivoActual).attr('disabled',true);
    $('#div_FileEdit').append('<br>');
    $('#div_FileEdit').append('<p>Ingrese el nuevo nombre: <input type="text" id="form_FileEditNuevo"><input type = "text" value=".'+extension+'" style="width:60px" disabled></p>');
    $('#div_FileEdit').dialog({width:500, height:300, minHeight:500, minWidth:300, modal:true,draggable:false,
        title:"Renombrar archivo "+NombreArchivoActual, buttons:{
            "Aceptar":function(){$(this).dialog('close');FileEditPhp();}, "Cancelar":function(){$(this).dialog('close');}}});    
    $(":text").keyup(function(){valid(this);});
}

/*******************************************************************************
 * Se envia realiza la operación de renombrado en el servidor
 * @returns {undefined}
 */
function FileEditPhp()
{       
    var IdFile=$('#table_DetailResult tr.selected').attr('id');
    var NombreArchivoNuevo=$('#form_FileEditNuevo').val();    
    var NombreArchivoActual=$('#form_FileEditActual').val();
    var extension= NombreArchivoActual.substr( (NombreArchivoActual.lastIndexOf('.') +1) );
    var Ruta='';
    $('#table_DetailResult tr.selected').each(function()
    {
        var position = TableContentdT.fnGetPosition(this); // getting the clicked row position
        Ruta = TableContentdT.fnGetData(position)[6]; // getting the value of the first (invisible) column 
    });  
    
    if(NombreArchivoNuevo.length===0){Advertencia("Debe Ingresar un nombre nuevo");return;}
    
    Loading();
        
    var IdRepositorio=$('#CM_select_repositorios').val();
    var NombreRepositorio=$('#CM_select_repositorios option:selected').html();

       
    $.ajax({
      async:true, 
      cache:false,
      dataType:'html', 
      type: 'POST',   
      url: "php/ContentManagement.php",
      data: 'opcion=FileEdit&IdRepositorio='+IdRepositorio+'&NombreRepositorio='+NombreRepositorio+"&Ruta="+Ruta+"&NombreArchivoNuevo="+NombreArchivoNuevo+"&IdFile="+IdFile+"&NombreArchivoActual="+NombreArchivoActual, 
      success:  function(xml){   
          $('#Loading').dialog('close');
          if($.parseXML( xml )===null){errorMessage(xml);return 0;}else xml=$.parseXML( xml );
           
             $(xml).find("FileEdit").each(function()
            {
                var $FileEdit=$(this);
                var estado=$FileEdit.find("Estado").text();
                var mensaje=$FileEdit.find("Mensaje").text();
                var Ruta=$FileEdit.find("Ruta").text();
                var NombreArchivo=$FileEdit.find("NombreArchivo").text();
                var Full=$FileEdit.find("Full").text();
                var TipoArchivo=$FileEdit.find("TipoArchivo").text();
                
                $('#table_DetailResult tr[id=' + IdFile + ']').each(function ()
                {
                    var position = TableContentdT.fnGetPosition(this); // getting the clicked row position
                    TableContentdT.fnUpdate([NombreArchivo],position,0,false);                                      
                    TableContentdT.fnUpdate(['<img src="img/acuse.png" title="vista previa de "'+NombreArchivo+'" onclick="Preview(\''+TipoArchivo+'\', \'0\', \''+ IdRepositorio +'\', \'Content\')">'],position,4,false);
                    TableContentdT.fnUpdate([Ruta],position,6,false);
                    TableContentdT.fnUpdate([Full],position,3,true);                    
                });                                 
                Notificacion(mensaje);               
            });    
            
            $(xml).find("Error").each(function()
            {
                var $Instancias=$(this);
                var estado=$Instancias.find("Estado").text();
                var mensaje=$Instancias.find("Mensaje").text();
                errorMessage(mensaje);
            });     
            
            $(xml).find("Advertencia").each(function()
            {
                var $Instancias=$(this);
                var estado=$Instancias.find("Estado").text();
                var mensaje=$Instancias.find("Mensaje").text();
                Advertencia(mensaje);
            }); 
      },
      beforeSend:function(){},
      error:function(objXMLHttpRequest){errorMessage(objXMLHttpRequest); $('#Loading').dialog('close');}
    });        
}
