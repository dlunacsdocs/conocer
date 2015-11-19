/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */




/* global BotonesWindow, PDFJS, Wvisor, minWvisor, minHvisor, Hvisor */

/******************************************************************************
 * 
 * @param {type} tipo
 * @param {type} IdGlobal
 * @param {type} IdFile
 * @param {type} Source
 * @returns {undefined}
 */
function Preview(tipo, IdGlobal, IdFile,  Source)
{    
    $('#div_vista_previa').remove();   
    
    switch (Source)
    {
        case 'Content':
            
            DocEnvironment = new ClassDocumentEnvironment(Source, IdGlobal, IdFile);         
            DocEnvironment.GetProperties();
            break;
            
        case 'Download':            
            DocEnvironment = new ClassDocumentEnvironment(Source, IdGlobal, IdFile);         
            DocEnvironment.GetProperties();
            break;
    }
    
    tipo = String(tipo.toLowerCase());
    
    if(tipo ==='jpg' || tipo==='png' || tipo==='tiff' || tipo==='jpge')
    {      
        var RutaArchivoServer=location.host+'/'+DocEnvironment.FileRoute;
        
        $('#VistaPrevia').remove();
        $('body').append('<div id = "VistaPrevia"></div>');
        $('#VistaPrevia').append('<div id="div_vista_previa" class="viewer imageViewer"></div>');
        $('#div_vista_previa').append('<div id = "viewerImageNavBar" class = "viewerImageNavBar"></div>');
        $('#div_vista_previa').append('<div id = "viewerImageBody" class = "viewerImageBody"></div>');
        $('#viewerImageNavBar').append('\n\
            <nav class="navbar navbar-inverse">\n\
            <ul class="nav navbar-nav">\n\
                <li class="active"><a href="#"><span class = "toolbarButton pageUpIcon" /></a></li>\n\
                <li class="active"><a href="#"><span class = "toolbarButton pageDownIcon" /></a></li>\n\
                <li class="active"><a href="#"><span class = "zoomDown glyphicon glyphicon glyphicon-zoom-in" /></a></li>\n\
                <li class="active"><a href="#"><span class = "zoomUp glyphicon glyphicon glyphicon-zoom-out" /></a></li>\n\
                <li class="active"><a href="#"><span class = "glyphicon glyphicon glyphicon-resize-full" /></a></li>\n\
            </ul>\n\
            <div class="navbar-form navbar-left" role="search">\n\
                <div class="form-group">\n\
                  <input type="text" class="form-control iviewer_zoom_status" disabled>\n\
                </div>\n\
            </div>\n\
          </nav>\n\
        ');
        
        $('#div_vista_previa').dialog({responsive:true, fluid:true ,width:Wvisor, 
            height:Hvisor, minWidth:minWvisor, minHeight:minHvisor, title:"Vista Previa", 
            modal:true,closeOnEscape:true,
        open:function(){
            
            $('#div_vista_previa.ui-dialog-content').css({"padding": "0em"});
            $('#div_vista_previa.ui-dialog').css({"padding": "0em"});
            
        }
            
        }).dialogExtend(BotonesWindow);
        
        var iv1 = $("#viewerImageBody").iviewer(
        {
            src: RutaArchivoServer,
            update_on_resize: true,
            zoom_animation: true,
            mousewheel: true,
//            onDrag: function(ev, coords) { },
            onZoom: function(ev, coords){ var zoomPercent = $(this).iviewer("update_status"); $('#viewerImageNavBar input.iviewer_zoom_status').val(zoomPercent+"%");   }
        });

        $('#viewerImageBody .iviewer_common').hide();
        
        
        $("#viewerImageNavBar .pageUpIcon").click(function(){iv1.iviewer('angle', +90); });
        $("#viewerImageNavBar .pageDownIcon").click(function(){iv1.iviewer('angle', -90); });
        $("#viewerImageNavBar .zoomDown").click(function(){ iv1.iviewer('zoom_by', 1); });
        $("#viewerImageNavBar .zoomUp").click(function(){ iv1.iviewer('zoom_by', -1); });
        $("#viewerImageNavBar .glyphicon-resize-full").click(function(){ iv1.iviewer('fit'); });
        
//        $('#viewerImageNavBar .iviewer_zoom_status').click(function(){var zommObject = iv1.iviewer("update_status"); console.log(zommObject);});
//        $("#orig").click(function(){ iv1.iviewer('set_zoom', 100); });
//        $("#update").click(function(){ iv1.iviewer('update_container_info'); });

    }
    
//    $('#div_vista_previa').append('<div class = "iviewer_common iviewer_button"><img src = "../img/note.png"></div>');
    
    if(tipo==='pdf')
        pdfViewer(DocEnvironment);
    
}



function pdfViewer(DocEnvironment){
     PDFJS.workerSrc = 'apis/pdf.js-master/src/worker_loader.js';
    ArrayNotes=new Array();
    PaginaActual=0;
    ArrayObteinNotes=0;
//            alert(DocumentEnvironment+DocumentEnvironment.FileRoute+tipo+IdGlobal+IdFile+Source);
    DEFAULT_URL = DocEnvironment.FileRoute;
    PDFView.open(DocEnvironment.FileRoute, 0);     

    if($.type(DocEnvironment)==='object');
        Notes = new ClassNotes(DocEnvironment.IdRepository, DocEnvironment.RepositoryName, DocEnvironment.IdFile, DocEnvironment.FileName, DocEnvironment.IdGlobal);

    $('#DivPdfViewer').dialog({width:Wvisor, height:Hvisor, minWidth:minWvisor, minHeight:minHvisor, title:"Vista Previa", modal:true}).dialogExtend(BotonesWindow);
}

