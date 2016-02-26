/*******************************************************************************
 * @description Clase que construye el menú "Archivística", agregando cada uno de 
 *              los modulos que este contiene.
 *              
 * @returns {ArchivalClass}
 */


var ArchivalClass = function(){
    
    _getModules = function(){
        _getDocumentaryDisposition();     
        _getDocumentaryValidity();
        _getLegalFoundation();
        _getAdministrativeUnit();
        _getExpedient();
    };
    
    /*
     * @description Agrega el módulo de Disposición Documental al CSDocs.
     * @returns {Boolean}
     */
    _getDocumentaryDisposition = function(){
        var status = false;
        $.ajaxSetup({async: false});
        $.getScript( "Modules/js/DocumentaryDisposition.js" )
            .done(function( script, textStatus ) {
              status = true;
            documentaryDisposition = new DocumentaryDispositionClass();
            documentaryDisposition.setActionToLinkDocumentaryDispositionMenu();
            })
            .fail(function( jqxhr, settings, exception ) {
        });
        $.ajaxSetup({async: true});
        
        return status;
    };
    
    _getDocumentaryValidity = function(){
        var status = false;
        $.ajaxSetup({async: false});
        $.getScript( "Modules/js/DocumentaryValidity.js" )
            .done(function( script, textStatus ) {
              status = true;
              documentaryValidity = new DocumentaryValidity();
              documentaryValidity.setActionToLinkDocumentaryValidity();
            })
            .fail(function( jqxhr, settings, exception ) {
            });
    
        $.ajaxSetup({async: true});
        
        return status;
    };
    
    /***
     * @description Obtiene el script para ejecutar las funciones de la clase Fundamento Legal.
     * @returns {Boolean}
     */
    var _getLegalFoundation = function(){
        var status = false;
        $.ajaxSetup({async: false});
        $.getScript( "Modules/js/LegalFoundation.js" )
            .done(function( script, textStatus ) {
              status = true;
              legalFoundation = new LegalFoundation();
              legalFoundation.setActionToLink();
            })
            .fail(function( jqxhr, settings, exception ) {
            });
    
        $.ajaxSetup({async: true});
        
        return status;
    };
    
    var _getAdministrativeUnit = function(){
        var status = false;
        $.ajaxSetup({async: false});
        $.getScript( "Modules/js/AdministrativeUnit.js" )
            .done(function( script, textStatus ) {
              status = true;
              administrativeUnit = new AdministrativeUnit();
              administrativeUnit.setActionToLink();
            })
            .fail(function( jqxhr, settings, exception ) {
            });
        
        $.ajaxSetup({async: true});
        
        return status;
    };
    
    var _getExpedient = function(){
        console.log("contruyendo menú expediente.");
        var status = false;
        $.ajaxSetup({async: false});
        $.getScript( "Modules/js/Expedient.js" )
            .done(function( script, textStatus ) {
              status = true;
              Expedient = new ExpedientClass();
            })
            .fail(function( jqxhr, settings, exception ) {
            });
        
        $.ajaxSetup({async: true});
        
        return status;
    };
    
};

ArchivalClass.prototype.buildModule = function(){
    console.log("Construyendo Módulo Archivística...");
    
    var li = $('<li>',{class: "here LinkArchival"});
    var vigenciDocLi = $('<li>', {class: "here LinkDocumentaryValidity"}).append('<a href = "#">Vigencia Documental</a>');
    var fundamentoLegal = $('<li>', {class: "here LinkLegalFoundation"}).append('<a href = "#">Fundamento Legal</a>');
    var dispDoc = $('<li>',{class:"LinkDocumentaryDisposition"}).append('<a href="#">Cat. de Dispos. Documental</a>');
    var administrativeUnit = $('<li>',{class:"LinkAdministrativeUnit"}).append('<a href="#">Unidad Administrativa</a>');
    
    var sublist = $('<ul>',{class:"sublist"}).append(dispDoc);
    sublist.append(vigenciDocLi);
    sublist.append(fundamentoLegal);
    sublist.append(administrativeUnit);
    
    var a = $('<a>', {href:"#Disposición Documental"}).append("Archivística");
    
    li.append(a);
    li.append(sublist);

    $('#menu ul:first').append(li);
        
    _getModules();
};


