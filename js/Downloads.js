/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global DataTable, OptionDataTable, EnvironmentData */

var DownloadTabledT, DownloadTableDT;

$(document).ready(function()
{
    
    var download = new Downloads();
    download.BuildTable();
    $('.download').click(function(){
        download.ShowTable();
    });

});

var Downloads = function()
{
    var self = this;
    
    
    _RemoveRow = function(IdFile)
    {
        /* Se elimina la fila de la tabla de descarga y se deselecciona el check de la tabla de repositorio */
        DownloadTableDT.row('tr[id='+IdFile+']').remove().draw( false );
        $('#table_DetailResult tbody tr[id='+IdFile+'] input').prop("checked", "");
    };
    
    _EmptyTable = function()
    {
        var tr=$('#table_download tbody tr');
        for(var cont=0; cont<tr.length; cont++)
        {
            var IdFile=tr[cont].id;
            DownloadTableDT.row('tr[id='+IdFile+']').remove().draw( false );
    //        $('#table_download').DataTable().row('tr[id='+IdFile+']').remove().draw( false );
            $('#table_DetailResult tbody tr[id='+IdFile+'] input').prop("checked", "");
        }
    };
    
    _Download = function()
    {
        $('#GroupPermissionsPanel').append('<div class="Loading" id = "LoadingIconDownload"><img src="../img/loadinfologin.gif"></div>');
        
        $('#iframeDownload').remove();
        var Xml="<Download version='1.0' encoding='UTF-8'>";  
        
        var tr = DownloadTableDT.rows().data();       
        if(tr.length===0){Advertencia("No hay elementos en la lista de descarga"); return;}

        $(tr).each(function()
        {
            var NombreArchivo = $(this)[2];
            var RutaArchivo = $(this)[5];
            var Path = $(this)[6];
            Xml+='<File><Path>'+Path+'</Path><RutaArchivo>'+RutaArchivo+'</RutaArchivo><NombreArchivo>'+NombreArchivo+'</NombreArchivo></File>';
        }); 
   
        Xml+='</Download>';
        
        $.ajax({
            async:true, 
            cache:false,
            dataType:"html", 
            type: 'POST',   
            url: "php/Downloads.php",
            data: 'option=Download&XmlDownload='+Xml+'&DataBaseName='+EnvironmentData.DataBaseName+'&IdUser='+EnvironmentData.IdUsuario+'&UserName='+EnvironmentData.NombreUsuario, 
            success:  function(xml){
                $('#LoadingIconDownload').remove();
                if($.parseXML( xml )===null){errorMessage(xml); return 0;}else xml=$.parseXML( xml );                
               $(xml).find("Download").each(function()
                {          
                    var $Download=$(this);
                    var RutaZip= $Download.find('RutaZip').text();
                   $('#div_download').append('<iframe id="iframeDownload" src="php/Downloads.php?option=DownloadZip&RutaZip='+RutaZip+'"></iframe>');
                   Notificacion("Confirmación de descarga");
                });
                
                $(xml).find("Error").each(function()
                {
                    var mensaje = $(this).find("Mensaje").text();
                    errorMessage(mensaje);
                });

            },
            beforeSend:function(){},
            error: function(jqXHR, textStatus, errorThrown){errorMessage(textStatus +"<br>"+ errorThrown);}
        });        
    };
    
    _CheckIfExistRow = function(IdRepository, IdFile)
    {
        var exist = false;

        $('#table_download tr[id='+ IdFile +']').each(function()
        {
            var position = DownloadTabledT.fnGetPosition(this); // getting the clicked row position
            var IdExistingRepository = DownloadTabledT.fnGetData(position)[0]; // getting the value of the first (invisible) column        
            if(IdExistingRepository===IdRepository)
                exist = true;
        });
        
        return exist;
    };
};

Downloads.prototype.BuildTable = function()
{
    var self = this;
    
    $('#table_download').append('<thead><tr><th></th><th></th><th>Nombre del Archivo</th><th>Vista Previa</th><th>Remover</th><th>Ruta Archivo</th><th></th></tr></thead><tbody></tbody>');
    DownloadTabledT = $('#table_download').dataTable(OptionDataTable);    
    DownloadTableDT = new $.fn.dataTable.Api('#table_download');
    
    $('#table_download').dataTable().fnSetColumnVis(0,false);
    $('#table_download').dataTable().fnSetColumnVis(1,false);
    $('#table_download').dataTable().fnSetColumnVis(5,false);
    $('#table_download').dataTable().fnSetColumnVis(6,false);
    
    $('#table_download tbody').on( 'click', 'tr', function () {
        DownloadTableDT.$('tr.selected').removeClass('selected');
        $(this).addClass('selected');
        var IdUser = $('#table_download tr.selected').attr('id');  
    });
};

Downloads.prototype.AddRow = function(Source, IdGlobal, IdFile)
{
    var self = this;
    
    var DocEnvironment = new ClassDocumentEnvironment(Source, IdGlobal, IdFile);
    DocEnvironment.GetProperties();
    
    if(($.type(DocEnvironment))!=='object')
    {
        console.log("Se devolvio a doc environmente diferente a un objecto");
        return;
    }
    
    var CheckIfExistRow = _CheckIfExistRow(DocEnvironment.IdRepository, IdFile);
    if(CheckIfExistRow===true)
        return 0;
    

        
    var Tree = new ClassTree();
    var FilePathName = Tree.GetPath('#contentTree');
           
    var data=
    [
        DocEnvironment.IdRepository,
        DocEnvironment.RepositoryName,
        DocEnvironment.FileName,
        '<img src="img/acuse.png" style="cursor:pointer" title="vista previa de '+DocEnvironment.FileName+'" onclick = "Preview(\''+DocEnvironment.FileType+'\', \' '+DocEnvironment.IdRepository+' \' ,\''+IdFile+'\', \'Download\')">',
        '<img src="img/ArchivoEliminar.png" style="cursor:pointer"  title="Quitar de lista de descarga a '+DocEnvironment.FileName+'" onclick="_RemoveRow(\''+IdFile+'\')" class="img_delete_descarga">',
        DocEnvironment.FileRoute,
        FilePathName
    ];
    
    var ai = DownloadTableDT.row.add(data).draw();         
    var n = DownloadTabledT.fnSettings().aoData[ ai[0] ].nTr;
    n.setAttribute('id',IdFile);
    
};

Downloads.prototype.ShowTable = function()
{
    var self = this;
    
    $('#div_download').dialog({title:'Archivos listos para descarga', width:500, height:500, minWidth:500, 
        minHeight:500,
        buttons:{
            "Cerrar":function(){$(this).dialog('close');},            
            "Limpiar Lista":function(){_EmptyTable();},
            "Descargar":function(){_Download();}}
        });
};

Downloads.prototype.RemoveRow = function(IdRepository,IdRow)
{
    _RemoveRow(IdRow);
};






