/*******************************************************************************
 * @description Clase que construye el menú "Archivística", agregando cada uno de 
 *              los modulos que este contiene.
 *              
 * @returns {ArchivalClass}
 */


var ArchivalClass = function(){
    
    _getModules = function(){
        _getDocumentaryDisposition();
    };
    
    /*
     * @description Agrega el módulo de Disposición Documental al CSDocs.
     * @returns {Boolean}
     */
    _getDocumentaryDisposition = function(){
        
        var status = false;
        $.getScript( "Modules/DocumentaryDisposition.js" )
            .done(function( script, textStatus ) {
              status = true;
              documentaryDisposition = new DocumentaryDispositionClass();
              documentaryDisposition.setActionToLinkDocumentaryDispositionMenu();
            })
            .fail(function( jqxhr, settings, exception ) {
            });
        
        return status;
    };
    
};

ArchivalClass.prototype.buildModule = function(){
    console.log("Construyendo Módulo Archivística...");
    
    var li = $('<li>',{class: "here LinkArchival"});
    
    var dispDoc = $('<li>',{class:"LinkDocumentaryDisposition"}).append('<a href="#">Disposición Documental</a>');
    var sublist = $('<ul>',{class:"sublist"}).append(dispDoc);
        
    var a = $('<a>', {href:"#Disposición Documental"}).append("Archivística");
    
    li.append(a);
    li.append(sublist);

    $('#menu ul:first').append(li);
        
    _getModules();
};


