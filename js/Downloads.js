
/* global DataTable, OptionDataTable, EnvironmentData, BootstrapDialog, LanguajeDataTable */
var DownloadTabledT, DownloadTableDT;

$(document).ready(function(){ 
    var download = new Downloads();

    DownloadTabledT = $('#table_download').dataTable({
        "sDom": 'Tfrtlip',
        "bInfo": false, "autoWidth": false, "oLanguage": LanguajeDataTable,
        "tableTools": {
            "aButtons": [
                {"sExtends": "text", "sButtonText": '<i class="fa fa-trash fa-lg"></i> Eliminar', "fnClick": function () {
                    download.delete();
                }}
            ]
        }
    });    
        
    DownloadTableDT = new $.fn.dataTable.Api('#table_download');
    
    DownloadTabledT.fnSetColumnVis(0,false);
    DownloadTabledT.fnSetColumnVis(1,false);
    DownloadTabledT.fnSetColumnVis(4,false);
    DownloadTabledT.fnSetColumnVis(5,false);

    $('#table_download tbody').on( 'click', 'tr', function () {
        DownloadTabledT.$('tr.selected').removeClass('selected');
        $(this).addClass('selected');
    });
            
    $('.download').click(function(){
        download.showInterface();
    });

});

/**
 * @description Clase que administra las descargas de documentos.
 * @returns {Downloads}
 */
var Downloads = function()
{
    var self = this;
    
    var _EmptyTable = function()
    {
        $('#table_download tbody').find('tr').each(function(){
            var IdFile = $(this).attr('id');
            
            if(parseInt(IdFile) > 0){
                var position = DownloadTabledT.fnGetPosition(this); // getting the clicked row position
                var idRepository = DownloadTabledT.fnGetData(position)[0];
                var idFile = $(this).attr('idFile');
                self.RemoveRow(idRepository, idFile);
            }       
        });
            
    };
    
    var _Download = function()
    {        
        $('#iframeDownload').remove();
        var Xml="<Download version='1.0' encoding='UTF-8'>";  
        
        var tr = DownloadTableDT.rows().data();       
        if(tr.length===0){Advertencia("No hay elementos en la lista de descarga"); return;}

        $(tr).each(function()
        {
            var NombreArchivo = $(this)[2];
            var RutaArchivo = $(this)[4];
            var Path = $(this)[5];
            Xml+='<File>\n\
                    <Path>'+Path+'</Path>\n\
                    <RutaArchivo>'+RutaArchivo+'</RutaArchivo>\n\
                    <NombreArchivo>'+NombreArchivo+'</NombreArchivo>\n\
                </File>';
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
                   $('body').append('<iframe id="iframeDownload" src="php/Downloads.php?option=DownloadZip&RutaZip='+RutaZip+'"></iframe>');
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
    
    var _CheckIfExistRow = function(IdRepository, IdFile)
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
    
    this.delete = function(){
        $('#table_download  tr.selected').each(function(){
            var position = DownloadTabledT.fnGetPosition(this); // getting the clicked row position
            var idRepository = DownloadTabledT.fnGetData(position)[0];
            var idFile = $(this).attr('idFile');
            self.RemoveRow(idRepository, idFile);
        });
    };
    
    this.RemoveRow = function(IdRepository,IdRow)
    {
        DownloadTableDT.row('tr[id='+IdRepository+IdRow+']').remove().draw( true );
        $('#table_DetailResult tr[id='+IdRow+']').find('.checkbox_detail').each(function(){
            $(this).prop("checked", "");
        });   
    };
    
    this.showInterface = function()
    {   
        var divDownload = $('#div_download');
        divDownload.css({"display": ''});
        var content = $('<div>').append(divDownload);
        
        BootstrapDialog.show({
            title: '<i class="fa fa-download fa-lg"></i> Descarga de Documentos',
            size: BootstrapDialog.SIZE_NORMAL,
            type: BootstrapDialog.TYPE_PRIMARY,
            message: content,
            closable: true,
            closeByBackdrop: true,
            buttons: [
                {
                    icon: 'fa fa-arrow-circle-down fa-lg',
                    label: "Descargar",
                    cssClass: "btn-primary",
                    action: function (dialogRef) {
                        dialogRef.enableButtons(false);
                        var button = this;
                        button.spin();

                        _Download();
                        _EmptyTable();
                        dialogRef.close();

                        button.stopSpin();
                        dialogRef.enableButtons(true);

                    }
                },
                {
                    icon: 'fa fa-eraser fa-lg',
                    label: "Limpiar",
                    cssClass: 'btn-primary',
                    action: function(dialogRef){
                        _EmptyTable();
                    }
                },
                {
                    label: 'Cerrar',
                    action: function(dialogRef){
                        dialogRef.close();
                    }
                }
            ],
            onshown: function (dialogRef) {
                DownloadTabledT.$('tbody tr:first').click();

            },
            onhide: function (dialogRef) {
                var divDownload = $('#div_download');
                divDownload.css({"display": 'none'});
                $(divDownload).prependTo('body');
            }
        });
    };
    
    this.AddRow = function(Source, IdGlobal, IdFile)
    {
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
        
        var imgDelete = $('<img>', {src: 'img/ArchivoEliminar.png'});
        
        var data=
        [
            DocEnvironment.IdRepository,
            DocEnvironment.RepositoryName,
            DocEnvironment.FileName,
            '<img src="img/acuse.png" style="cursor:pointer" title="vista previa de '+DocEnvironment.FileName+'" onclick = "Preview(\''+DocEnvironment.FileType+'\', \' '+DocEnvironment.IdRepository+' \' ,\''+IdFile+'\', \'Download\')">',
            DocEnvironment.FileRoute,
            FilePathName
        ];
        
        var ai = DownloadTableDT.row.add(data).draw();         
        var n = DownloadTabledT.fnSettings().aoData[ ai[0] ].nTr;
        n.setAttribute('id',DocEnvironment.IdRepository+IdFile);
        n.setAttribute('idFile',IdFile);

    };
};
