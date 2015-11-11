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
        
        $('#VistaPrevia').append('<div id="div_vista_previa" class="viewer"></div>');
        
        $('#div_vista_previa').dialog({width:Wvisor, height:Hvisor, minWidth:minWvisor, minHeight:minHvisor, title:"Vista Previa", modal:true,closeOnEscape:false}).dialogExtend(BotonesWindow);
        
        var iv2 = $("#div_vista_previa").iviewer(
                  {
                      src: RutaArchivoServer
                  });

                  $("#chimg").click(function()
                  {
                    iv2.iviewer('loadImage', RutaArchivoServer);
                    return false;
                  });

                  var fill = false;
                  $("#fill").click(function()
                  {
                    fill = !fill;
                    iv2.iviewer('fill_container', fill);
                    return false;
                  });
    }
    
    $('#div_vista_previa').append('<div class = "iviewer_common iviewer_button"><img src = "../img/note.png"></div>');
    
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

