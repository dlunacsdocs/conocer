/*******************************************************************************
 *  Clase que administra las Notas en el sistema: ingreso, modificación y
 *  borrado.
 *******************************************************************************/

/* global TableEnginedT, TableContentdT, OptionDataTable, PDFViewerApplication, HideClose, EnvironmentData, Hvisor, Notes, LanguajeDataTable, BootstrapDialog */

var ArrayObteinNotes = 0;
var ArrayNotes = new Array();
var PaginaActual = 0;   

var TableNotesdT;
var TableNotesDT;

$(document).ready(function()
{
    /* Se abre la ventana de Notas al Pulsar sobre la Imagen de Note */                
    $('.LinkNotes').click(function(){
        Notes.ShowListOfNotes();
        $('#secondaryToolbarToggle').click();
    });     
});

var ClassNotes = function(viewerType,IdRepository,RepositoryName, IdFile, FileName, IdGlobal)
{
    /*******************************************************************************
    * @description  Muestra u oculta el icono de Nota dentro de una página
    * LLamdo: pdf_viewer.js
    * @returns {undefined}                 
    *******************************************************************************/
   var self = this;
   this.viewerType = viewerType;
   this.IdRepository = IdRepository;
   this.IdFile = IdFile;
   this.FileName = FileName;
   this.IdGlobal = IdGlobal;
   this.RepositoryName = RepositoryName;
   this.Page = 0;
   
   this.HideAndShowNoteIcon = function(){
       
       if(self.Page === $('#pageNumber').val())
           return;

       self.Page = $('#pageNumber').val();
    
       $('.NotesIcon').remove();


       if(ArrayObteinNotes===0)
       {
           var XmlArrayNotes = self.ObtainXmlNotes();
           console.log("XMLNotes =  "+XmlArrayNotes);
           $(XmlArrayNotes).find("Note").each(function()
           {         
               var IdNota = $(this).find('IdNote').text();
               var NoPagina = $(this).find("Page").text();               

               if(ArrayNotes[NoPagina]=== undefined )
                   ArrayNotes[NoPagina] = new Array();

               var Notes = ArrayNotes[NoPagina];
               Notes[Notes.length] = IdNota;
               ArrayNotes[NoPagina] = Notes;
           });
       }

       var NoPagina = $('#pageNumber').val();
       
       $('.NotesIcon').remove();
       
       if($.type(ArrayNotes[NoPagina])==='array'){
           var IdNotes = ArrayNotes[NoPagina];
           if($.type(IdNotes)==='array'){
                if(IdNotes.length > 0){            
                    var IdNote = IdNotes[0];
                    if(IdNote > 0){
                        if((!$("#NoteIcon"+ IdNote).length>0)){
                            $('#NotesZone').append('<img src="../img/note.png"  title="Nota(s) en la pagina '+self.Page+'" id="NoteIconPerPage" class="NotesIcon">');          
                            $('#NoteIconPerPage').click(function(){
                                var notes = self.getNotesPerPage(NoPagina);
                         
                                _listingNotesPerPage(notes, NoPagina);
                            });
                        }
                    }
                } 
            }
       }
   };
   
   /****************************************************************************
    * @description Lista las notas contenidas en una página al hacer click sobre
    *              el icono de "Nota" en un popover. Se muestran los primeros 200 
    *              caracteres por cada nota.
    * @param {type} notes
    * @returns {undefined}
    ***************************************************************************/
   _listingNotesPerPage = function(notes, pageNumber){
        TableNotesdT = undefined;
        TableNotesDT = undefined;
        var $table = $('<table>',{id:"notesPerPageTable", class:"able table-striped table-bordered table-hover table-condensed"});     
        var thead = $('<thead>').append('<tr><th>Contenido Nota</th><th>Fecha</th><th>Creador</th><th></th></tr>');
        $table.append(thead);
        
        BootstrapDialog.show({
            title: 'Notas Página '+pageNumber,
            message: $table,
            buttons: [{
                label: 'Cerrar',
                action: function(dialogRef){
                    dialogRef.close();
                }
            }
            ],
            onshown: function(dialogRef){
                TableNotesdT = $('#notesPerPageTable').dataTable({
                    "bInfo":false, "autoWidth" : false, "oLanguage":LanguajeDataTable
                });  

                TableNotesDT = new $.fn.dataTable.Api('#notesPerPageTable');                                
                
                $(notes).find('note').each(function(){
                    var idNote = $(this).find('IdNote').text();
                    var noteText = $(this).find('Text').text().slice(0,200);;
                    var creationDate = $(this).find('CreationDate').text();
                    var creator = $(this).find('UserName').text();
                    var pageNumber = $(this).find('Page').text();
                    var noteIcon = '<img src = "img/SeeNote.png" onclick = "_PreviewNote(\''+noteText+'\', \''+pageNumber+'\', \''+idNote+'\')" title = "Consultar Nota" width = "30px" height = "30px" style = "cursor:pointer">';
                    
                    var data = [noteText, creationDate, creator, noteIcon];
                    var ai = TableNotesDT.row.add(data).draw();
                    var n = TableNotesdT.fnSettings().aoData[ ai[0] ].nTr;
                    n.setAttribute('id',idNote);
                });
                
                $('#notesPerPageTable tbody').on( 'click', 'tr', function ()
                {
                    TableNotesDT.$('tr.selected').removeClass('selected');
                    $(this).addClass('selected');
                } ); 
                
                $('#notesPerPageTable tbody tr:eq(0)').click();
                
            }
        });
        
        
   };
   
   
   
   /****************************************************************************
    * @description  Obtiene un XML Con las paginas que contienen una Nota (Consulta más ligera 
    *               que la que contiene la descripción de las Notas)
    * @param {without parameters}  
    * @returns  {Xml con el contenido de cada una de las Notas del documento 
    *           órdenadas por página}
    ****************************************************************************/
   this.ObtainXmlNotes = function(){   
       ArrayObteinNotes=1;            

       if(!this.IdFile > 0 || !this.IdRepository > 0)
           return;

       var xml=0;

       $.ajax({
       async:false, 
       cache:false,
       dataType:'html', 
       type: 'POST',   
       url: "php/Notes.php",
       data: 'opcion=ObtainXmlNotes&DataBaseName='+EnvironmentData.DataBaseName+'&IdUsuario='+EnvironmentData.IdUsuario+'&IdRepositorio='+self.IdRepository+"&IdFile="+self.IdFile+'&nombre_usuario='+EnvironmentData.NombreUsuario, 
       success:  function(response)
       {   
           if($.parseXML( response )===null){ Error(response); return 0;}else xml=$.parseXML( response );

           if($(xml).find("Notes").length > 0)
               return xml;

           if($(xml).find("Error").length>0)
           {
               ErrorXml(xml);
               return 0;
           }
       },
       beforeSend:function(){          },
       error: function(jqXHR, textStatus, errorThrown){Error(textStatus +"<br>"+ errorThrown);}
       });
       return xml;
   };
   
   /*******************************************************************************
    * Llamado desde Viewers.js      Method: VistaPrevia();
    * 
    * @returns {undefined}
    *
    * *****************************************************************************/
   this.ShowListOfNotes = function(){                
       var estado=0;         

        $.ajax({
        async:true, 
        cache:false,
        dataType:'xml', 
        type: 'POST',   
        url: "php/Notes.php",
        data: 'opcion=ShowNotes&IdRepositorio='+self.IdRepository+"&IdFile="+self.IdFile, 
        success:  function(xml)
        {   
            if(typeof (xml)!=='object')
            {
                $('#div_notes').dialog('close');
                Salida(xml);
            } 
            if($(xml).find("Notes").length>0)      
                _BuildNotesTable(xml);
 
            if($(xml).find("Error").length>0)
                ErrorXml(xml);
        },
        beforeSend:function(){         
            $('#div_notes').remove();
            $('body').append('<div id = "div_notes"></div>');
            $('#div_notes').append('<div class="loading"><img src="../img/loadinfologin.gif"></div>');
            /*  Venatan de dialogo que espera la consulta con las notas  */    
            $('#div_notes').dialog({title:"Cargando Notas...", width:700, 
                minWidth:500,height:550, minHeight:400},HideClose);
        },
        error: function(jqXHR, textStatus, errorThrown){Error(textStatus +"<br>"+ errorThrown);}
   });

       $('.loading').remove();

       return estado;
   };
   
   /*******************************************************************************
    * Construye la tabla que muestra el listado de Notas
    *
    * @param {type} xml
    * @returns {undefined}
    */
   _BuildNotesTable = function(xml){

       $('#div_notes').empty();      
       $('#div_notes').dialog('option','title','Listado de Notas');
       $('#div_notes').append('<table id="table_notes" class="display hover"><thead><tr><th>Texto</th><th>No. Página</th><th>Usuario</th><th>Fecha de Creación</th><th>Ir</th><th>Ver Nota</th></tr></thead><tbody></tbody></table>');    

       TableNotesdT = $('#table_notes').dataTable({
           "sDom": 'lfTrtip',
            "bInfo":false, "autoWidth" : false, "oLanguage":LanguajeDataTable,
            "tableTools": {
                "aButtons": [
                    {"sExtends":"text", "sButtonText": "Agregar Nota", "fnClick" :function(){_WriteNote();}},
                    {"sExtends":"text", "sButtonText": "Eliminar Nota", "fnClick" :function(){_DeleteNote();}},
                    {"sExtends": "copy","sButtonText": "Copiar Tabla"},
                    {
                        "sExtends":    "collection",
                        "sButtonText": "Exportar...",
                        "aButtons":    [ "csv", "xls", "pdf" ]
                    }                          
                ]
            }                   
       });  
       TableNotesDT = new $.fn.dataTable.Api('#table_notes');

       $(xml).find("Note").each(function()
       {
           var $Note = $(this);
           var IdNota = $(this).find("IdNote").text();
           var FechaCreacion = $Note.find("CreationDate").text();
           var NoPagina = $Note.find("Page").text();
           var NombreUsuario = $Note.find("UserName").text();
           var Texto=$Note.find("Text").text();
           Texto = Texto.slice(0,100);
           var ai = TableNotesDT.row.add( [
           /*[0]*/Texto,
           /*[1]*/NoPagina,
           /*[2]*/NombreUsuario,
           /*[3]*/FechaCreacion,                        
           /*[4]*/'<img src="img/redirect.png" style="cursor:pointer" title="Ir a Pagina" onclick="_JumpToPage('+NoPagina+')" >',
           /*[5]*/'<img src="img/SeeNote.png" style="cursor:pointer" title="Vista Previa Nota" onclick="_ReadNote(\''+IdNota+'\')" >'
           ]).draw();

           var n = TableNotesdT.fnSettings().aoData[ ai[0] ].nTr;
           n.setAttribute('id',IdNota);

       });

       $('#table_notes tbody').on( 'click', 'tr', function ()
       {
           $('#table_notes tr').removeClass('selected');
           $(this).addClass('selected');
           var IdRow = $('#table_notes tr.selected').attr('id');              

       } );  

   };

   _JumpToPage = function(Page){
       PDFViewerApplication.page=Page;         
   };
   
   _ReadNote = function(IdNote){
       var NoteXml = _GetNote(IdNote);

       $(NoteXml).find("Note").each(function()
       {
           var Text = $(this).find("Text").text();
           var NoPagina = $(this).find("Page").text();

           _PreviewNote(Text,NoPagina, IdNote);
       });
   };

   _GetNote = function(IdNote){
       $('#div_notes').append('<div class="PlaceWaiting" id = "NotesPlaceWaiting"><img src="../img/loadinfologin.gif"></div>');       
       
       var xml;

       $.ajax({
       async:false, 
       cache:false,
       dataType:"html", 
       type: 'POST',   
       url: "php/Notes.php",
       data: "opcion=GetNote&DataBaseName="+EnvironmentData.DataBaseName+'&IdUsuario='+EnvironmentData.IdUsuario+'&NombreUsuario='+EnvironmentData.NombreUsuario+'&IdGrupo='+EnvironmentData.IdGrupo+ "&NombreGrupo = "+ EnvironmentData.NombreGrupo+'&IdNote='+IdNote+'&IdRepository='+self.IdRepository+'&FileName='+self.FileName+'&Page='+self.Page, 
       success:  function(response)
       {            
           $('#NotesPlaceWaiting').remove();
           if($.parseXML( response )===null){ Error(response); return 0;}else xml=$.parseXML( response );         

           if($(xml).find("Note").length>0)
               return xml;
          

           $(xml).find("Error").each(function()
           {
               var mensaje=$(this).find("Mensaje").text();
               Error(mensaje);
               $('#NotesPlaceWaiting').remove();
           });                 

       },
       beforeSend:function(){},
       error: function(jqXHR, textStatus, errorThrown){$('#NotesPlaceWaiting').remove(); Error(textStatus +"<br>"+ errorThrown);}
       });      
       
       return xml;
   };

   _PreviewNote = function(Text,NoPagina, idNote){
       
       var textArea = $('<textarea>',{class:"TextAreaPreviewNotes", id:"PreviewNoteText"});
       textArea.append(Text);
       
       BootstrapDialog.show({
            title: 'Consulta de Nota Pag.  '+NoPagina,
            message: textArea,
            size: BootstrapDialog.SIZE_SMALL,
            type: BootstrapDialog.TYPE_INFO,
            buttons: [{
                label: 'Cerrar',
                action: function(dialogRef){
                    dialogRef.close();
                }
            },
            {
                label: 'Modificar',
                action: function(dialogRef){
                    _confirmModifyNote(idNote);
                }
            }
            ],
            onshown: function(dialogRef){
                
            }
        });

   };

    _confirmModifyNote = function(idNote){
        
        BootstrapDialog.show({
            type: BootstrapDialog.TYPE_WARNING,
            size: BootstrapDialog.SIZE_SMALL,
            title: 'Mensaje de Confirmación',
            message: "¿Realmente desea realizar la modificación de la Nota seleccionada?",
            buttons: [{
                label: 'Cancelar',
                action: function(dialogRef){
                    dialogRef.close();
                }
            },{
                label: 'Modificar',
                action: function(dialogRef){
                    _ModifyNote(idNote);
                    dialogRef.close();
                }
            }
            ]
        });

    };

   /*********************************************************************************
    * Descripción: Abre una ventana con un TextArea para introducir el texto de Nota*
    * @returns {undefined}                                                          *
    *******************************************************************************/
   _WriteNote = function(){
       var NoPagina=$('#pageNumber').val();
       $('#WriteNote').remove();
       $('body').append('<div id="WriteNote"><textarea class="TextAreaNotes" id="TextAreaNotes" placeholder="Escribir nota..."></textarea>\n\
       <br><p>Página: <input type="text" id="InputNoPagina" class = "FormStandart" disabled> </p></div>');

       $('#InputNoPagina').val(NoPagina);   

       $('#WriteNote').dialog({width:500,height:600,draggable:false, modal:true},HideClose,
             {open: function() { $(this).closest(".ui-dialog").find(".ui-dialog-titlebar:first").hide(); },
             buttons:{"Agregar":{text:"Agregar",click:function(){_AddNote();}},
             "Cancelar":{text:"Cancelar",click:function(){$(this).dialog('destroy');}}}});
   };

   /********************************************************************************
    * Se envia la Nota introducida por el usuario al servidor, para ser almacenada *
    * active == 0     :: Panel Principal                                           *
    * active == 1     :: Busqueda                                                  *
    * @returns {undefined}                                                         *
    ********************************************************************************/

   _AddNote = function(){
       $('#div_notes').append('<div class="PlaceWaiting" id = "NotesPlaceWaiting"><img src="../img/loadinfologin.gif"></div>');       

       var TextNote=$('#TextAreaNotes').val();

       $.ajax({
       async:true, 
       cache:false,
       dataType:'html', 
       type: 'POST',   
       url: "php/Notes.php",
       data: "opcion=AddNote&DataBaseName="+EnvironmentData.DataBaseName+'&IdUsuario='+EnvironmentData.IdUsuario+'&IdRepository='+IdRepository+'&NombreUsuario='+EnvironmentData.NombreUsuario+'&Text='+TextNote+'&Page='+self.Page+'&IdFile='+self.IdFile+'&IdGlobal='+self.IdGlobal+'&RepositoryName='+self.RepositoryName+'&FileName='+self.FileName+'&Page='+self.Page, 
       success:  function(xml)
       {                    
          $('#NotesPlaceWaiting').remove();
          if($.parseXML( xml )===null){Error(xml); return 0;}else xml=$.parseXML( xml );   

          $(xml).find("AddNote").each(function()
           {
               var Mensaje = $(this).find('Mensaje').text();
               var IdNote = $(this).find('IdNote').text();                        
               var FechaCreacion = $(this).find("CreationDate").text();
               var NoPagina = $(this).find("Page").text();
               var NombreUsuario = $(this).find("UserName").text();
               var Texto=$(this).find("Text").text();
               Texto = Texto.slice(0,100);

               Notificacion(Mensaje);

               var ai = TableNotesDT.row.add(
               [
                   Texto,
                   NoPagina,
                   NombreUsuario,
                   FechaCreacion,                        
                   '<img src="img/redirect.png" style="cursor:pointer" title="Ir a Pagina" onclick="_JumpToPage('+NoPagina+')" >',
                   '<img src="img/SeeNote.png" style="cursor:pointer" title="Vista Previa Nota" onclick="_ReadNote(\''+IdNote+'\')" >'
               ]).draw();

               var n = TableNotesdT.fnSettings().aoData[ ai[0] ].nTr;
               n.setAttribute('id',IdNote);

               if(ArrayNotes[NoPagina]=== undefined )
               {
                   ArrayNotes[NoPagina] = new Array();
               }

               var Notes = ArrayNotes[NoPagina];
               Notes[Notes.length] = IdNote;
               ArrayNotes[NoPagina] = Notes;
               console.log("If se agrego la nota "+IdNote+" a la página "+NoPagina);

               if((!$("#NoteIcon"+ IdNote).length>0))
                   $('#NotesZone').append('<img src="../img/note.png"  title="Nota(s) en la pagina '+NoPagina+'" id="NoteIcon'+ IdNote +'" class="NotesIcon" onclick = "_ReadNote(\''+ IdNote +'\')">');

               $('#WriteNote').dialog('destroy');    
           });

          $(xml).find("Error").each(function()
           {
               var mensaje=$(this).find("Mensaje").text();
               Error(mensaje);
           });  
       },
       beforeSend:function(){          
       },
       error: function(jqXHR, textStatus, errorThrown){$('#NotesPlaceWaiting').remove(); Error(textStatus +"<br>"+ errorThrown);}
       });                    
   };
   

   
   _ModifyNote = function(IdNote){
        var NoteText = $('#PreviewNoteText').val();               


        $.ajax({
        async:false, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/Notes.php",
        data: 'opcion=ModifyNote&IdNote='+IdNote+'&Text='+NoteText+'&IdRepository='+IdRepository+'&RepositoryName='+ RepositoryName +'&IdFile='+IdFile+'&IdGlobal='+IdGlobal+'&FileName='+FileName, 
        success:  function(xml)
        {            
            $('#NotesPlaceWaiting').remove();
                if($.parseXML( xml )===null){ Error(xml); return 0;}else xml=$.parseXML( xml );         

            $(xml).find('ModifyNote').each(function()
            {
                var Mensaje = $(this).find('Mensaje').text();
                Notificacion(Mensaje);
                $('#table_notes tbody tr[id=' + IdNote + ']').each(function ()
                {
                    var position = TableNotesdT.fnGetPosition(this); // getting the clicked row position
                    TableNotesdT.fnUpdate([NoteText.slice(0,100)],position,0,true);                       
                });
                
            });

            $(xml).find("Error").each(function()
            {
                var mensaje=$(this).find("Mensaje").text();
                Error(mensaje);
                $('#NotesPlaceWaiting').remove();
            });                 

        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){$('#NotesPlaceWaiting').remove(); Error(textStatus +"<br>"+ errorThrown);}
        });      
       
   };
   
   _DeleteNote = function(){
        var NoteText = undefined;
        var IdNote = 0;
        $('#table_notes tr.selected').each(function()
        {
            var position = TableNotesdT.fnGetPosition(this); // getting the clicked row position  
            NoteText = TableNotesdT.fnGetData(position)[0];
            IdNote = $(this).attr('id');
        });
        
        if(!IdNote>0)
            return Advertencia("Debe seleccionar una nota");
       
        $.ajax({
        async:false, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/Notes.php",
        data: "opcion=DeleteNote&DataBaseName="+EnvironmentData.DataBaseName+'&IdUser='+EnvironmentData.IdUsuario+'&UserName='+EnvironmentData.NombreUsuario+'&IdGroup='+EnvironmentData.IdGrupo+ "&GroupName = "+ EnvironmentData.NombreGrupo+'&IdNote='+IdNote+'&Text='+NoteText+'&IdRepository='+self.IdRepository+'&RepositoryName='+ self.RepositoryName +'&IdFile='+self.IdFile+'&IdGlobal='+self.IdGlobal+'&FileName='+self.FileName+'&Page='+self.Page, 
        success:  function(xml)
        {            
            $('#NotesPlaceWaiting').remove();
                if($.parseXML( xml )===null){ Error(xml); return 0;}else xml=$.parseXML( xml );         

            $(xml).find('DeleteNote').each(function()
            {
                var Mensaje = $(this).find('Mensaje').text();
                Notificacion(Mensaje);
                TableNotesDT.row('tr[id='+IdNote+']').remove().draw( false );
                $('#NoteIcon'+ IdNote).remove();
                if(ArrayNotes[self.Page]!== undefined)
                {
                    var Notes = ArrayNotes[self.Page];
                    for(var cont = 0; cont<Notes.length; cont++)
                    {
                        var IdBackgroundNote = Notes[cont];
                        if(IdNote === IdBackgroundNote)
                            Notes[cont] = undefined;
                    }
                    ArrayNotes[self.Page] = Notes;
                }
                
            });

            $(xml).find("Error").each(function()
            {
                var mensaje=$(this).find("Mensaje").text();
                Error(mensaje);
                $('#NotesPlaceWaiting').remove();
            });                 

        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){$('#NotesPlaceWaiting').remove(); Error(textStatus +"<br>"+ errorThrown);}
        });      
   };
   
};

/*******************************************************************************
 * Descripción: Se obtienen las notas del documento por página.
 * 
 * @param {type} pageNumber
 * @returns {notes}
 *******************************************************************************/
ClassNotes.prototype.getNotesPerPage = function(pageNumber){
    var notes = {};
    var self = this;
    $.ajax({
        async:false, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/Notes.php",
        data: 'opcion=getNotesPerPage&pageNumber='+pageNumber+'&idRepository='+self.IdRepository+'&repositoryName='+ self.RepositoryName +'&idFile='+self.IdFile+'&idGlobal='+self.IdGlobal, 
        success:  function(xml)
        {                   
            if($.parseXML( xml )===null){errorMessage(xml); return 0;}else xml=$.parseXML( xml );

            if($(xml).find('note').length > 0)
                notes =  xml;

            $(xml).find("Error").each(function()
            {
                var mensaje=$(this).find("Mensaje").text();
                Error(mensaje);
            });                 

        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){errorMessage(textStatus +"<br>"+ errorThrown);}
        });      
    
    return notes;
};


