/* 
 * Operaciones sobre el repositorio de archivos (Borrado, Edición, etc)
 */

/* global TableContentdT, EnvironmentData, TableEnginedT, Hdetalle, Wdetalle, GlobalDatePicker, WindowConfirmacion, LanguajeDataTable, DownloadTabledT, BootstrapDialog, TemplateDesigner, TableContentDT */

// noinspection JSAnnotator
TableContentDT = '';
// noinspection JSAnnotator
TableContentdT = '';

var Document = function(){
    var self = this;
    var expedient = new ExpedientClass();
    this.openDocument = function(Source, IdGlobal, IdFile, idRepository, repositoryName, enterpriseKey, idDirectory, templateName){
        console.log("Openning document");
        console.log(idDirectory);
        var activeNode = (parseInt(idDirectory) > 0) ?  null : $('#contentTree').dynatree('getActiveNode');

        if (activeNode === null && idDirectory == undefined)
            return Advertencia("No fue posible obtener el nodo activo");
        console.log(activeNode);
        var DocumentEnvironment = new ClassDocumentEnvironment(Source, IdGlobal, IdFile);
        DocumentEnvironment.GetProperties();

        console.log(DocumentEnvironment);

        if (!DocumentEnvironment.IdFile > 0) {
                Advertencia("No selecciono un documento.");
                return 0;
            }
                        
            var content = $('<div>');
            enterpriseKey = (enterpriseKey != undefined) ? enterpriseKey : $('#CM_select_empresas option:selected').attr('value');
            repositoryName = (repositoryName != undefined) ? repositoryName : $('#CM_select_repositorios option:selected').attr('repositoryname');
            var IdRepositorio = (idRepository != undefined) ? idRepository : $('#CM_select_repositorios option:selected').attr('idrepository');
            var documentData = null;
            
            BootstrapDialog.show({
                title: '<i class = "fa fa-file-text-o fa-lg"></i> ' + DocumentEnvironment.FileName,
                size: BootstrapDialog.SIZE_WIDE,
                closeByBackdrop: true,
                closeByKeyboard: true,
                message: content,
                buttons: [{
                        icon: 'fa fa-pencil fa-lg',
                        label: 'Modificar',
                        cssClass: "btn-primary",
                        hotkey: 13,
                        action: function (dialogRef) {
                            var button = this;
                            button.spin();
                            dialogRef.setClosable(false);
                            dialogRef.enableButtons(false);
                            if (ConfirmDetailModify(content, documentData, DocumentEnvironment))
                                dialogRef.close();
                            else {
                                button.stopSpin();
                                dialogRef.setClosable(true);
                                dialogRef.enableButtons(true);
                            }
                        }
                    },
                    {
                        label: "Imprimir",
                        icon: "fa fa-print fa-lg",
                        cssClass: "btn-primary",
                        action: function(dialogRef){
                            printDocument(content, IdRepositorio);
                        }
                    },
                    {
                        label: 'Cerrar',
                        action: function (dialogRef) {
                            dialogRef.close();
                        }
                    }
                ],
                onshown: function (dialogRef) {
                    var parentFrontPage = getParentFrontPage(activeNode);
                    var templatename = self.getTemplateName(parentFrontPage, idDirectory, templateName);
                    var templateXml = getTemplate(enterpriseKey, repositoryName, templatename);
                    var templateObject = buildObjectOfTemplate(templateXml);
                    content.append(templateObject);
                    documentData = self.getDocumentData(DocumentEnvironment);
                    console.log("documentData--::");
                    console.log(documentData);
                    setDataToDocument(documentData);
                }
            });            
    };

    this.getTemplateName = function(parentFrontPage, idDirectory, templateName){
        console.log(parentFrontPage);
        console.log(templateName);
        if(parentFrontPage != null)
            return parentFrontPage.data.templateName + ".xml";

        if(templateName != null && String(templateName).length > 0)
            return templateName + ".xml"

        return getTemplateFromDirectory(idDirectory);
    }

    var getTemplateFromDirectory = function(idDirectory){
        var parents = self.getDirectoryParents(idDirectory);
        var templateName = null;

        $(parents).each(function(){
            if(parseInt(this.isFrontPage) == 1){
                templateName = this.templateName;
                return 0;
            }
        });

        return templateName+".xml";
    }

    this.getDirectoryParents = function(idDirectory){
        var directories = null;
        console.log("getTemplateNameFromDirectory");
        $.ajax({
            async: false,
            cache: false,
            dataType: "json",
            type: 'POST',
            url: "php/ContentManagement.php",
            data: {opcion: "getDirectoryParents", idDirectory: idDirectory},
            success: function (response){
                directories = response;
            },
            error: function (objXMLHttpRequest) {
                errorMessage(objXMLHttpRequest);
                console.log(objXMLHttpRequest);
            }
        });
        return directories;
    }
        
    this.getDocumentData = function(DocumentEnvironment){
        var documentData = null;
        $.ajax({
            async: false,
            cache: false,
            dataType: "html",
            type: 'POST',
            url: "php/ContentManagement.php",
            data: 'opcion=GetDetalle&IdRepositorio=' + DocumentEnvironment.IdRepository + '&NombreRepositorio=' + DocumentEnvironment.RepositoryName + "&IdArchivo=" + DocumentEnvironment.IdFile + '&NombreArchivo=' + DocumentEnvironment.FileName,
            success: function (xml){
                if ($.parseXML(xml) === null) 
                    return errorMessage(xml);
                else
                    xml = $.parseXML(xml);

                if($(xml).find('Detalle').length > 0)
                    documentData = xml;

                $(xml).find("Error").each(function (){
                    var mensaje = $(this).find("Mensaje").text();
                    errorMessage(mensaje);
                });
            },
            beforeSend: function () {
            },
            error: function (objXMLHttpRequest) {
                errorMessage(objXMLHttpRequest);
                console.log(objXMLHttpRequest);
            }
        });
        return documentData;
    };
    
    var getParentFrontPage = function (activeNode) {
        return ((activeNode != null) ? expedient.frontPage.getParentFrontPage(activeNode) : null);
    };
    var getTemplate = function (enterpriseKey, repositoryName, templateName) {
        return TemplateDesigner.getTemplate(enterpriseKey, repositoryName, templateName);
    };
    /**
     * @description Devuelve un objeto HTML construido a través del XML de la plantilla seleccionada.
     * @param {type} templateXml
     * @returns {Number|$|object}
     */
    var buildObjectOfTemplate = function (templateXml) {
        return TemplateDesigner.buildContentOfTemplate(templateXml, 0, 1);
    };
    
    var setDataToDocument = function(xml){
        $(xml).find("CampoRepositorio").each(function (){
            var $CampoRepositorio = $(this);
            var fieldName = $CampoRepositorio.find('Campo').text();
            var fieldValue = $CampoRepositorio.find('Valor').text();
            var type = $CampoRepositorio.find('type').text();
            var TipoCampo = $CampoRepositorio.find('TipoCampo').text();
            var required = $CampoRepositorio.find('required').text();
            var length = $CampoRepositorio.find("long").text();
            
            if(fieldName === "Numero_Expediente"){
                setBarcode(fieldValue);
                setExpedientBarcode(fieldValue);
            }
                
            if($('#templateForm_' + fieldName).length > 0)
                $('#templateForm_' + fieldName).val(fieldValue);            
        });

        $(xml).find("Catalogo").each(function () {
            var cadena = '';  /* Cadena con los valores  */
            var $Catalogo = $(this);
            $Catalogo.children('Valor').each(function () {
                var $NodoCampo = $(this);
                var Campo = $NodoCampo.find('Campo').text();
                var Valor = $NodoCampo.text();
                cadena += Valor + ' , ';
            });
            var Tipo = $Catalogo.find('Tipo').text();
            var NombreCatalogo = $Catalogo.find('NombreCatalogo').text();
            var IdCatalogo = $Catalogo.find('IdCatalogo').text();

            if ($('#templateForm_' + NombreCatalogo).length > 0)
                $('#templateForm_' + NombreCatalogo).val(cadena).attr('catalogoption',IdCatalogo);
            
        });

    };
    
    var setBarcode = function(expedientNumber){
        var barcode = $('<img>', {src: 'apis/php-barcode/barcode.php?text=' + expedientNumber + '&print=false&size=35'});
        $('#templateForm_CSDocs_barcode').append(barcode);
    };
    
    var setExpedientBarcode = function(expedientNumber){
        console.log("Construyendo cdigo QR en plantilla------->>");
        $('.qrWrapper').qrcode({
            text: expedientNumber,
            size: 70,
            render: "image"
        });
    };
    
    var printDocument = function(content, idRepository){
        if(!validateSystemPermission(idRepository, '6fab6e3aa34248ec1e34a4aeedecddc8', 1))
            return Advertencia("No tiene permiso de realizar esta acción");
        console.log("Generando vista de impresión");
        $(content).printThis({
            debug: true,               // show the iframe for debugging
            importCSS: true,            // import page CSS
            importStyle: true,         // import style tags
            printContainer: true,       // grab outer container as well as the contents of the selector
//                            loadCSS: "path/to/my.css",  // path to additional css file - us an array [] for multiple
            pageTitle: "",              // add title to print page
            removeInline: false,        // remove all inline styles from print elements
            printDelay: 333,            // variable print delay; depending on complexity a higher value may be necessary
            header: null,               // prefix to html
            formValues: true            // preserve input/form values
        });
    };
};

/********************************************************************************
 *  Obtiene los metadatas del archivo
 *  
 * @param {type} Source
 * @param {type} IdGlobal
 * @param {type} IdFile
 * @returns {Number}
 */
function GetDetalle(Source, IdGlobal, IdFile, idRepository, repositoryName, enterpriseKey, idDirectory, templateName)
{
    var DocumentEnvironment = new ClassDocumentEnvironment(Source, IdGlobal, IdFile);
    DocumentEnvironment.GetProperties();

    if (!DocumentEnvironment.IdFile > 0) {
        Advertencia("No selecciono un documento.");
        return 0;
    }
    
    var document = new Document();
    document.openDocument(Source, IdGlobal, IdFile, idRepository, repositoryName, enterpriseKey, idDirectory, templateName);
    
}

function getIdFile(source){
    var idFile = 0;
    switch (source){
        case "Content":
            idFile = TableContentDT.$('tr.selected').attr('id');
            break;
    }
    
    return idFile;
}
/**
 * @description Metodo que modifica los metadatos del documento o expediente seleccionado.
 * @param {object} documentContent
 * @param {XML} documentData
 * @param {object} DocumentEnvironment
 * @returns {Number}
 */
function ConfirmDetailModify(documentContent, documentData, DocumentEnvironment){
    var idRepository = DocumentEnvironment.IdRepository;

    if (!parseInt(idRepository) > 0)
        return Advertencia("No fue posible obtener el identificador del repositorio");

    if (!validateSystemPermission(idRepository, '3c59dc048e8850243be8079a5c74d079', 1))
        return Advertencia("No tiene permiso de realizar esta acción");

    var Forms = $(documentContent).find('input:text');
    var FieldsValidator = new ClassFieldsValidator();
    var validation = FieldsValidator.ValidateFields(Forms);

    if (validation === 0)
        return 0;
    
    var content = $('<div>').append('<p>¿Realmente desea modificar el documento?');
    
    BootstrapDialog.show({
                title: '<i class = "fa fa-pencil fa-lg"></i> ' + DocumentEnvironment.FileName,
                size: BootstrapDialog.SIZE_SMALL,
                closeByBackdrop: true,
                closeByKeyboard: true,
                message: content,
                buttons: [{
                        icon: 'fa fa-pencil fa-lg',
                        label: 'Modificar',
                        cssClass: "btn-warning",
                        hotkey: 13,
                        action: function (dialogRef) {
                            var button = this;
                            button.spin();
                            dialogRef.setClosable(false);
                            dialogRef.enableButtons(false);
                            DetailModify(documentData, DocumentEnvironment);
                            dialogRef.close();
                        }
                    },
                    {
                        label: 'Cerrar',
                        action: function (dialogRef) {
                            dialogRef.close();
                        }
                    }
                ],
                onshown: function (dialogRef) {

                }
            });            
}

/*
 * 
 * @param {type} XmlDetalle
 * @param {type} IdFile: Desde la tabla de búsqueda se envia el IdGlobal y desde la tabla de documentos (Content) se envía el Id del documento
 * @param {type} NombreArchivo
 * @returns {undefined}
 */

function DetailModify(XmlDetalle, DocumentEnvironment){
    var CatalogosXml = '';
    var active = $("#tabs").tabs("option", "active");

    $(XmlDetalle).find("Catalogo").each(function (){
        var $Catalogo = $(this);
        $Catalogo.children('Valor').each(function (){
            var $NodoCampo = $(this);
            var Campo = $NodoCampo.find('Campo').text();
            var Valor = $NodoCampo.text();

        });

        var Tipo = $Catalogo.find('Tipo').text();
        var NombreCatalogo = $Catalogo.find('NombreCatalogo').text();
        var IdCatalogo = $Catalogo.find('IdCatalogo').text();
        var id = $('#templateForm_' + NombreCatalogo).attr('catalogoption');  /* Se toman los valores de cada catalogo */
        var TextoSelectCatalogo = $('#templateForm_' + NombreCatalogo).val();
        
        if(!parseInt(id) > 0)
            return;
        
        CatalogosXml += '<Catalogo><name>' + NombreCatalogo + '</name><value>' + id + '</value><type>INT</type><TextoSelect>' + TextoSelectCatalogo + '</TextoSelect></Catalogo>';

    });

    var XMLResponse = "<MetaDatas version='1.0' encoding='UTF-8'>";
    $(XmlDetalle).find("CampoRepositorio").each(function (){
        var $Campo = $(this);
        var name = $Campo.find("Campo").text();
        var type = $Campo.find("type").text();
        
        if(!$('#templateForm_' + name).length > 0)
            return;
        var value = $('#templateForm_' + name).val();

        var XML = '<Detalle>\n\
                    <name>' + name + '</name>\n\
                    <value>' + value + '</value>\n\
                    <type>' + type + '</type>\n\
                </Detalle>';
        XMLResponse = XMLResponse + XML;
    });

    XMLResponse += CatalogosXml;
    XMLResponse += '</MetaDatas>';
    console.log("XML Modifier>>>>>>>>>");
    console.log(XMLResponse);
//    return 0;
    $.ajax({
        async: false,
        cache: false,
        dataType: "html",
        type: 'POST',
        url: "php/ContentManagement.php",
        data: 'opcion=DetailModify&' + '&IdRepositorio=' + DocumentEnvironment.IdRepository + '&IdEmpresa = ' + DocumentEnvironment.IdEnterprise + '&NombreEmpresa = ' + DocumentEnvironment.EnterpriseName + '&NombreRepositorio=' + DocumentEnvironment.RepositoryName + "&IdFile=" + DocumentEnvironment.IdFile + '&XMLResponse=' + XMLResponse + '&NombreArchivo=' + DocumentEnvironment.FileName + '&IdGlobal=' + DocumentEnvironment.IdGlobal,
        success: function (xml) {
            if ($.parseXML(xml) === null)
                return errorMessage(xml);
            else
                xml = $.parseXML(xml);

            $(xml).find("DetailModify").each(function (){
                var $DetailModify = $(this);
                var FullText = $DetailModify.find("Full").text();

                Notificacion("Datos Actualizados con éxito del documento " + DocumentEnvironment.FileName);

                switch (active){
                    case 0:
                        $('#table_DetailResult tbody tr[id=' + DocumentEnvironment.IdFile + ']').each(function (){
                            var position = TableContentdT.fnGetPosition(this); // getting the clicked row position
                            TableContentdT.fnUpdate([FullText], position, 3, true);
                        });

                        break;

                    case 1:

                        $('#table_EngineResult tr.selected').each(function (){
                            var position = TableEnginedT.fnGetPosition(this); // getting the clicked row position
                            TableEnginedT.fnUpdate([FullText], position, 5, true);
                        });

                        break;
                }
            });

            $(xml).find("Error").each(function (){
                var $Instancias = $(this);
                var estado = $Instancias.find("Estado").text();
                var mensaje = $Instancias.find("Mensaje").text();
                errorMessage(mensaje);
                return;
            });

        },
        beforeSend: function () {
        },
        error: function (jqXHR, textStatus, errorThrown) {
            errorMessage(textStatus + "<br>" + errorThrown);
        }
    });
}


/*******************************************************************************
 *  Al activar un directorio se obtiene la lista de archivos que se encuentran 
 *  en ese directorio.
 *
 * @param {type} node
 * @returns {undefined}
 */
function GetFiles(node){
    var IdRepositorio = $('#CM_select_repositorios').val();
    var NombreRepositorio = $('#CM_select_repositorios option:selected').html();
    var Search = $('#form_engine').val();
    var arbol = $('#contentTree').dynatree("getTree");
    var idDirectory = node.data.key;
    var idDocDisposition = 0;;
    var expedient = new ExpedientClass();
    var serieNode = null;
    
    if(parseInt(node.data.isFrontPage) === 1 || parseInt(node.data.isLegajo) === 1)
        serieNode = expedient.getParentSerie(node);
    
    if(serieNode !== null)
        idDocDisposition = serieNode.data.idDocDisposition;

    if (!parseInt(idDirectory) > 0)
        return Advertencia("No se ha recuperado un directory id para recuperar los documentos.");
    if ($.type(arbol) !== 'object')
        return Advertencia("No se pudo recuperar el objeto Tree");
    else
        $("#contentTree").dynatree("disable");
    
    $.ajax({
        async: true,
        cache: false,
        dataType: "html",
        type: 'POST',
        url: "php/ContentManagement.php",
        data: {opcion:"GetFiles", IdRepository: IdRepositorio, RepositoryName: NombreRepositorio, Search: Search, IdDirectory: idDirectory, idDocDisposition: idDocDisposition},
        success: function (xml) {
            if ($.parseXML(xml) === null) {
                errorMessage(xml);
                return 0;
            } else
                xml = $.parseXML(xml);
            var emptyTest = $('#contentTree').is(':empty');
            if (!emptyTest)
                $("#contentTree").dynatree("enable");
            $(xml).find("Error").each(function ()
            {
                var $Instancias = $(this);
                var estado = $Instancias.find("Estado").text();
                var mensaje = $Instancias.find("Mensaje").text();
                errorMessage(mensaje);
                return;
            });

            SetSearchResult(IdRepositorio, xml);
        },
        beforeSend: function () {
        },
        error: function (jqXHR, textStatus, errorThrown) {
            errorMessage(textStatus + "<br>" + errorThrown);
        }
    });
}

/* Se dibuja la tabla con el listado de archivos dentro de un directorio */
function SetSearchResult(IdRepository, xml)
{
    $('.contentDetail').empty();
    $('.contentDetail').append('<table id="table_DetailResult" class="display hover"></table>');
    $('#table_DetailResult').append('<thead><tr><th>Nombre</th><th>Fecha</th><th>Tipo</th><th>Resumen</th><th>Ver</th><th>Metadatos</th><th>Ruta</th><th></th></tr></thead><tbody></tbody>');
    // noinspection JSAnnotator
    TableContentdT = $('#table_DetailResult').dataTable({
        oLanguage: LanguajeDataTable,
        "columns": [null, null, null, null, {"width": "7%"}, {"width": "16%"}, null, null]
    });

    // noinspection JSAnnotator
    TableContentDT = new $.fn.dataTable.Api('#table_DetailResult');

    var cont = 0;

    $(xml).find("Resultado").each(function ()
    {
        var $Resultado = $(this);
        var TipoArchivo = $Resultado.find("TipoArchivo").text();
        var FechaIngreso = $Resultado.find("FechaIngreso").text();
        var NombreArchivo = $Resultado.find("NombreArchivo").text();
        var Full = $Resultado.find("Full").text();
        var IdRepositorio = $Resultado.find("IdRepositorio").text();
        var Ruta = $Resultado.find("RutaArchivo").text();
        Full = Full.slice(0, 200);

        var data = [
            /*[0]*/NombreArchivo,
            /*[1]*/FechaIngreso,
            /*[2]*/TipoArchivo,
            /*[3]*/Full, /*Source, IdGlobal, IdFile */
            /*[4]*/'<img src="img/acuse.png" title="vista previa de "' + NombreArchivo + '" onclick="Preview(\'' + TipoArchivo + '\', \'0\', \'' + IdRepositorio + '\' , \'Content\')">',
            /*[5]*/'<img src="img/metadata.png" title="Metadatos de ' + NombreArchivo + '" onclick="GetDetalle(\'Content\', \'0\', \'' + IdRepositorio + '\')">',
            /*[6]*/Ruta,
            /*[7]*/'<center><input type="checkbox" id="' + IdRepositorio + '"  class="checkbox_detail"></center>'
        ];

        var ai = TableContentDT.row.add(data);
        var n = TableContentdT.fnSettings().aoData[ ai[0] ].nTr;
        n.setAttribute('id', IdRepositorio);

        if (cont === 60) {
            TableContentDT.draw();
            cont = 0;
        }
        cont++;

        /* Sí se encuentra el archivo en la lista de descarga se selecciona el Checkbox  */
        if (DownloadTabledT.$('tr[id=' + IdRepository + IdRepositorio + ']').length > 0)
            TableContentdT.$('tr[id=' + IdRepositorio + ']').find('.checkbox_detail').each(function () {
                $(this).prop("checked", "checked");
            });

    });

    TableContentDT.draw();
    TableContentdT.fnSetColumnVis(6, false);

    var downloads = new Downloads();

    /* Se recoge el estado del CheckBox para agregarlo a la lista de descarga */
    TableContentdT.$('.checkbox_detail').click(function () {
        var check = $(this).is(':checked');
        var IdCheck = $(this).attr('id');

        if (check)
            downloads.AddRow('Content', 0, IdCheck);
        else
            downloads.RemoveRow(IdRepository, IdCheck);
    });

    $('#table_DetailResult tbody').on('click', 'tr', function () {
        TableContentDT.$('tr.selected').removeClass('selected');
        $(this).addClass('selected');

    });
}
/**
 * @description Objeto para la carga de documentos.
 * @returns {Upload}
 */
var Upload = function () {
    var self = this;
    var expedient = new ExpedientClass();
    var TableCatalogdT = null;
    var TableCatalogDT = null;
    
    this.file = {
        openUploadInterface: function () {
            var activeNode = $('#contentTree').dynatree('getActiveNode');

            if (activeNode === null)
                return Advertencia("No fue posible obtener el nodo activo");

            if (!parseInt(activeNode.data.isLegajo) > 0)
                return Advertencia("Solo puede ingresar un documento dentro de un legajo.");
            
            var content = $('<div>');
            var enterpriseKey = $('#CM_select_empresas option:selected').attr('value');
            var repositoryName = $('#CM_select_repositorios option:selected').attr('repositoryname');
            var IdRepositorio = $('#CM_select_repositorios option:selected').attr('idrepository');
            var xml = SetTableStructura(repositoryName, "CM_TableMetadatasCarga", 0);/* XML con la estructura de la tabla */
            var Catalogos = getCatalogs(IdRepositorio, repositoryName);

            BootstrapDialog.show({
                title: '<i class = "fa fa-upload fa-lg"></i> Cargar documento',
                size: BootstrapDialog.SIZE_WIDE,
                closeByBackdrop: true,
                closeByKeyboard: true,
                message: content,
                buttons: [{
                        icon: 'fa fa-upload fa-lg',
                        label: 'Cargar',
                        cssClass: "btn-primary",
                        hotkey: 13,
                        action: function (dialogRef) {
                            var button = this;
                            button.spin();
                            dialogRef.setClosable(false);
                            dialogRef.enableButtons(false);
                            if (UploadMetadatas(content, IdRepositorio, xml, Catalogos))
                                dialogRef.close();
                            else {
                                button.stopSpin();
                                dialogRef.setClosable(true);
                                dialogRef.enableButtons(true);
                            }
                        }
                    },
                    {
                        label: 'Cerrar',
                        action: function (dialogRef) {
                            dialogRef.close();
                        }
                    }
                ],
                onshown: function (dialogRef) {
                    var parentFrontPage = getParentFrontPage(activeNode);
                    var templateXml = getTemplate(enterpriseKey, repositoryName, parentFrontPage.data.templateName + ".xml");
                    var templateObject = buildObjectOfTemplate(templateXml);
                    setBrowserFile(content);
                    content.append(templateObject);
                    var frontPageData = expedient.frontPage.getFrontPageData(enterpriseKey, repositoryName, parentFrontPage.getKeyPath(), parentFrontPage.data.templateName + ".xml");
                    console.log("frontPageData");
                    console.log(frontPageData);
                    self.file.setDataToTemplate(frontPageData);
                    var FieldsValidator = new ClassFieldsValidator();
                    FieldsValidator.InspectCharacters(content.find('input'));
                }
            });
        },
        setDataToTemplate: function (templateData) {
            $(templateData).find('field').each(function () {
                var fieldValue = $.trim($(this).find('fieldValue').text());
                var fieldName = $.trim($(this).find('fieldName').text());
                var fieldType = $.trim($(this).find('fieldType').text());
                var fieldLength = $.trim($(this).find('fieldLength').text());
                var columnName = $.trim($(this).find('columnName').text());
                var idField = "#templateForm_" + fieldName;
                var isCatalog = $.trim($(this).find('isCatalog').text());
                var catalogOption = 0;
                
                if(fieldName === "Numero_Expediente")
                    setBarcode(fieldValue);
                
                if ($(idField).length > 0){
                    $(idField).val(fieldValue);
                    if(String(isCatalog) === "true"){
                        catalogOption = $.trim($(this).find('catalogOption').text());
                        $(idField).attr("catalogOption", catalogOption);
                    }
                }
                else
                    console.log("No se encontro el formulario " + idField);
            });
        }
    };
    
    var setBarcode = function(expedientNumber){
        var barcode = $('<img>', {src: 'apis/php-barcode/barcode.php?text=' + expedientNumber + '&print=false&size=35'});
        $('#templateForm_CSDocs_barcode').append(barcode);
    };

    var getParentFrontPage = function (activeNode) {
        return expedient.frontPage.getParentFrontPage(activeNode);
    };

    var setBrowserFile = function (content) {
        content.append('<tr><td><input type="file" id="CM_InputFileCarga" enctype="multipart/form-data"></td><td></td></tr>');
    };

    var getTemplate = function (enterpriseKey, repositoryName, templateName) {
        return TemplateDesigner.getTemplate(enterpriseKey, repositoryName, templateName);
    };

    /**
     * @description Devuelve un objeto HTML construido a través del XML de la plantilla seleccionada.
     * @param {type} templateXml
     * @returns {Number|$|object}
     */
    var buildObjectOfTemplate = function (templateXml) {
        return TemplateDesigner.buildContentOfTemplate(templateXml, 0, 1);
    };
    
    this.openCatalogInterface = function(catalogName, form){
        var repositoryName = $('#CM_select_repositorios option:selected').attr('repositoryname');
        var content = $('<div>', {style: "max-height: calc(100vh - 200px); overflow-y: auto;"});
        BootstrapDialog.show({
            title: '<i class="fa fa-folder-open fa-lg"></i> Catálogo ' + catalogName,
            size: BootstrapDialog.SIZE_WIDE,
            type: BootstrapDialog.TYPE_PRIMARY,
            message: content,
            closable: true,
            closeByBackdrop: false,
            closeByKeyboard: true,
            buttons: [
                {
                    icon: 'fa fa-plus-circle fa-lg',
                    label: 'Seleccionar',
                    cssClass: "btn-primary",
                    hotkey: 13,
                    action: function (dialogRef) {
                        var button = this;
                        dialogRef.enableButtons(false);
                        dialogRef.setClosable(false);
                        if (selectOptionOfCatalog(catalogName, form))
                            dialogRef.close();
                        else {
                            dialogRef.setClosable(true);
                            dialogRef.enableButtons(true);
                        }
                    }
                },
                {
                    label: 'Cerrar',
                    action: function (dialogRef) {
                        dialogRef.close();
                    }
                }
            ],
            onshow: function (dialogRef) {
                
            },
            onshown: function (dialogRef) {
        var catalogData = getCatalogData(repositoryName, catalogName);
                buildCatalogTable(content,repositoryName, catalogName, catalogData, form);
            }
        });
        
        
    };
    
    var getCatalogData = function(repositoryName, catalogName){
        var catalogManager = new ClassCatalogAdministrator();
        var catalogData = catalogManager.GetCatalogRecordsInXml(repositoryName, catalogName, '');
        
        return catalogData;
    };
    
    /**
     * @description Se ingresa al formulario la opcion seleccionada del catalogo.
     * @param {type} catalogName
     * @param {type} form
     * @returns {undefined}
     */
    var selectOptionOfCatalog = function(catalogName, form){
        var catalogOption = $('#' + catalogName + "_catalogTable tr.selected").attr('id');
        if(!$('#' + catalogName + "_catalogTable tr.selected").length > 0)
            return 0;
        
        $('#' + catalogName + "_catalogTable tr.selected").each(function (){
            var position = TableCatalogdT.fnGetPosition(this); // getting the clicked row position
            var data = TableCatalogDT.row( position ).data();
            $(form).val(data.join(", "));
            $(form).attr("catalogOption", catalogOption);
        });
        return 1;
    };

    var buildCatalogTable = function(content,repositoryName, catalogName, catalogData, form){
        var ArrayStruct = new Array();
        var cont = 0;
        var thead = '<thead><tr>';
        var xmlStruct = GeStructure(repositoryName + "_" +catalogName);
        var table = $('<table>', {
            class: "table table-striped table-bordered table-hover table-condensed display hover",
            id: catalogName + "_catalogTable"
        });
        
        $(xmlStruct).find("Campo").each(function () {
            var tipo = $(this).find("tipo").text();
            if (tipo.length > 0)
                return;   /* Tipo del List */
            var name = $(this).find("name").text();
            ArrayStruct[cont] = name;
            cont++;
            thead += '<th>' + name + '</th>';
        });
        
        thead += "</tr></thead>";
        table.append(thead);
        content.append(table);
        
        TableCatalogdT = table.dataTable({
            'bPaginate': false, 'bInfo': false, bFilter: false, "bSort": false, "autoWidth": false, "oLanguage": LanguajeDataTable,
            "dom": 'lfTrtip',
            "oTableTools": {
                "aButtons": [{
                    "sExtends": "collection",
                    "sButtonText": '<i class="fa fa-floppy-o fa-lg"></i>',
                    "aButtons": ["copy", "csv", "xls", "pdf"]
                }]
            },
            "sSwfPath": "../apis/DataTables/extensions/TableTools/swf/copy_csv_xls_pdf.swf"
        });
        
        TableCatalogDT = new $.fn.dataTable.Api('#' + catalogName + "_catalogTable");

        addRecordsToCatalogTable(catalogData, catalogName, ArrayStruct, TableCatalogdT, TableCatalogDT);

        $('#' + catalogName + '_catalogTable tbody').on('click', 'tr', function () {
            TableCatalogDT.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
        });
    };
    
    var addRecordsToCatalogTable = function(catalogData, catalogName, ArrayStruct, TableCatalogdT, TableCatalogDT){
        /* El Array Struct Contiene la estructura del catálogo y a partir de ella se recorre el XML que contiene
         * su información (Del catálogo) */
        $(catalogData).find("CatalogRecord").each(function (){
            var $Campo = $(this);
            var IdRecord = $Campo.find('Id' + catalogName).text();
            var data = [];  /* Guarda la fila que será insertada */
            /* Recorrer los datos que contiene cada fila del catálogo */
            for (var cont = 0; cont < ArrayStruct.length; cont++){
                var field = ArrayStruct[cont];
                var value = $Campo.find(field).text();
                data[data.length] = value;
            }

            var ai = TableCatalogDT.row.add(data).draw();
            var n = TableCatalogdT.fnSettings().aoData[ ai[0] ].nTr;
            n.setAttribute('id', IdRecord);
        });
    };
   
};

/*****************************************************************************
 * 
 * @param {String} IdRepositorio Id del repositorio
 * @param {String} repositoryName Nombre del repositorio
 * @returns {undefined}Recupera de la BD los catálogos asociados a un repositorio 
 */
function getCatalogs(IdRepositorio, repositoryName)
{
    var ArrayCatalogos = new Array();
    $.ajax({
        async: false,
        cache: false,
        dataType: "html",
        type: 'POST',
        url: "php/ContentManagement.php",
        data: "opcion=getCatalogos&DataBaseName=" + EnvironmentData.DataBaseName + '&IdUsuario=' + EnvironmentData.IdUsuario + "&IdRepositorio=" + IdRepositorio,
        success: function (respuesta) {
            var xml = respuesta;

            var cont = 0;
            $(xml).find("Empresa").each(function ()
            {
                var $Empresa = $(this);
                var IdCatalogo = $Empresa.find("IdCatalogo").text();
                var NombreCatalogo = $Empresa.find("NombreCatalogo").text();
                //SetListProperties(repositoryName + "_" + NombreCatalogo, repositoryName, NombreCatalogo);
                ArrayCatalogos[cont] = NombreCatalogo;
                cont++;
            });
            $(xml).find("Error").each(function ()
            {
                var $Instancias = $(this);
                var estado = $Instancias.find("Estado").text();
                var mensaje = $Instancias.find("Mensaje").text();
                errorMessage(mensaje);
            });
        },
        beforeSend: function () {
        },
        error: function (objXMLHttpRequest) {
            errorMessage(objXMLHttpRequest);
        }
    });
    return ArrayCatalogos;
}

/**
 * @description Recolecta los metadatos del documento que será cargado al sistema.
 * @param {type} content
 * @param {type} xml
 * @param {type} Catalogs
 * @returns {Number|FormData|_CollectNewMetadatas.data}
 */
function _CollectNewMetadatas(content, xml, Catalogs){
    console.log("CollectNewMetadatas");
    var Forms = $(content).find('input:text');
    var FieldsValidator = new ClassFieldsValidator();
    FieldsValidator.ValidateFields(Forms);

    if (!FieldsValidator)
        return 0;

    var IdRepositorio = $('#CM_select_repositorios').val();
    var NombreRepositorio = $('#CM_select_repositorios option:selected').html();
    var IdEmpresa = $('#CM_select_empresas option:selected').attr('id');
    IdEmpresa = parseInt(IdEmpresa);
    var NombreEmpresa = $('#CM_select_empresas option:selected').html();

    if (!(IdEmpresa) > 0)
        return Advertencia("El identificador de la empresa no es correcto");

    var ArchivoFile = $('#CM_InputFileCarga').val();
    ArchivoFile = ArchivoFile.split('\\');
    var NombreArchivo = ArchivoFile[ArchivoFile.length - 1];

    var node = $("#contentTree").dynatree("getActiveNode");
    if (!node) {
        Advertencia("Seleccione un directorio");
        return 0;
    }

    var IdDirectory = node.data.key, Path = node.getKeyPath(), IdParentDirectory = node.getParent();

    IdParentDirectory = IdParentDirectory.data.key;
    var FlagCamposDetalle = 0;  /* Validación de los campos */
    var CatalogosXml = '';

    /*--------------- Se recoge el valor de los catálogos -----------------*/
    $(Forms).each(function(){
        if(String($(this).attr('iscatalog')) !== "true"){
            
        }
        else{
            var CatalogName = $(this).attr('fieldName');
            if(CatalogName === undefined)
                return;
            var id = $('#templateForm_' + CatalogName).attr('catalogoption');  /* Se toman los valores de cada catalogo */

            if (!(id > 0)) {
                FieldsValidator.AddClassRequiredActive($('#templateForm_' + CatalogName));
                FlagCamposDetalle = 1;
            }
            else
                FieldsValidator.RemoveClassRequiredActive($('#templateForm_' + CatalogName));

            var TextoSelectCatalogo = $('#templateForm_' + CatalogName).val();

            CatalogosXml += '<Catalogo><name>' + CatalogName + '</name><value>' + id + '</value><type>INT</type><TextoSelect>' + TextoSelectCatalogo + '</TextoSelect></Catalogo>';
        }
    });
       
    /* Valores de Cada Campos de Texto */

    var XMLResponse = "<MetaDatas version='1.0' encoding='UTF-8'>";
    $(xml).find("Campo").each(function ()
    {
        var $Campo = $(this);
        var name = $Campo.find("name").text();
        var type = $Campo.find("type").text();
        var long = $Campo.find("long").text();
        var required = $Campo.find("required").text();
        var id = 'templateForm_' + name;
        var value = $('#' + id).val();
        var XML = '<MetaData>\n\
                        <name>' + name + '</name>\n\
                        <value>' + value + '</value>\n\
                        <type>' + type + '</type>\n\
                        <long>' + long + '</long>\n\
                    </MetaData>';
        XMLResponse = XMLResponse + XML;
    });

    /* Campos por default como el IdDirectory y IdEmpresa se envian en el XML */
    XMLResponse += '<MetaData><name>IdDirectory</name><value>' + IdDirectory + '</value><type>INT</type></MetaData>';
    XMLResponse += '<MetaData><name>UsuarioPublicador</name><value>' + EnvironmentData.NombreUsuario + '</value><type>VARCHAR</type></MetaData>';

    XMLResponse += CatalogosXml;
    XMLResponse += '</MetaDatas>';                     /* Fin del XML */

    var xml_usuario = document.getElementById("CM_InputFileCarga");
    var archivo = xml_usuario.files;
    var data = new FormData();

    if (archivo.length === 0) {
        FieldsValidator.AddClassRequiredActive($('#CM_InputFileCarga'));
        return 0;
    }
    else
        FieldsValidator.RemoveClassRequiredActive($('#CM_InputFileCarga'));

    if (FlagCamposDetalle)
        return 0;

    for (i = 0; i < archivo.length; i++) {
        data.append('archivo', archivo[i]);
        data.append('opcion', 'UploadMetadatas');
        data.append('IdUsr', EnvironmentData.IdUsuario);
        data.append('UploadMetadatas', UploadMetadatas);
        data.append('DataBaseName', EnvironmentData.DataBaseName);
        data.append('IdEmpresa', IdEmpresa);
        data.append('NombreEmpresa', NombreEmpresa);
        data.append('nombre_usuario', EnvironmentData.NombreUsuario);
        data.append('IdParentDirectory', IdParentDirectory);
        data.append('IdDirectory', IdDirectory);
        data.append('XmlReponse', XMLResponse);
        data.append('IdRepositorio', IdRepositorio);
        data.append('Path', Path);
        data.append('NombreRepositorio', NombreRepositorio);
        data.append('NombreArchivo', NombreArchivo);
    }

    return data;
}

/**
 * @description Funcion que carga los metadatos.
 * @param {object} content Contenedor del dialog con la estructura de la plantilla.
 * @param {type} IdRepositorio
 * @param {type} xml
 * @param {type} Catalogos
 * @returns {Number}
 */
function UploadMetadatas(content, IdRepositorio, xml, Catalogos)
{
    var status = 0;
    var data = _CollectNewMetadatas(content, xml, Catalogos);

    if (data === 0 || data === undefined || data === '0')
        return 0;
   
    $.ajax({
        async: false,
        cache: false,
        processData: false,
        contentType: false,
        dataType: "html",
        type: 'POST',
        url: "php/ContentManagement.php",
        data: data,
        success: function (xml)
        {
            if ($.parseXML(xml) === null)
                return errorMessage(xml);
            else
                xml = $.parseXML(xml);

            if ($(xml).find("SetMetadatas").length > 0) {
                AddNewRow(IdRepositorio, xml);
                status = 1;
            }

            $(xml).find("Error").each(function () {
                var mensaje = $(this).find("Mensaje").text();
                errorMessage(mensaje);
            });

        },
        beforeSend: function () {
        },
        error: function (jqXHR, textStatus, errorThrown) {
            errorMessage(textStatus + "<br>" + errorThrown);
        }
    });

    return status;
}

function AddNewRow(IdRepository, xml) {
    $(xml).find("SetMetadatas").each(function () {
        var mensaje = $(this).find("Mensaje").text();
        var IdFile = $(this).find('IdRepositorio').text();
        var NombreArchivo = $(this).find("NombreArchivo").text();
        var FechaIngreso = $(this).find("FechaIngreso").text();
        var TipoArchivo = $(this).find("TipoArchivo").text();
        var Detalle = $(this).find("Full").text();
        var IdRepositorio = $(this).find("IdRepositorio").text();
        var Ruta = $(this).find("RutaArchivo").text();

        Notificacion(mensaje);

        var data = [
            NombreArchivo,
            FechaIngreso,
            TipoArchivo,
            Detalle,
            '<img src="img/acuse.png" title="vista previa de "' + NombreArchivo + '" onclick="Preview(\'' + TipoArchivo + '\', \'0\' ,\'' + IdRepositorio + '\', \'Content\')">',
            '<img src="img/metadata.png" title="vista previa de ' + NombreArchivo + '" onclick="GetDetalle(\'Content\', \'0\', \'' + IdRepositorio + '\')">',
            Ruta,
            '<center><input type="checkbox" id="' + IdRepositorio + '"  class="checkbox_detail"></center>'
        ];

        /* Se inserta la Fila y su Id */
        $('#table_DetailResult tr').removeClass('selected');
        var ai = TableContentDT.row.add(data);
        var n = TableContentdT.fnSettings().aoData[ ai[0] ].nTr;
        n.setAttribute('id', IdRepositorio);
        n.setAttribute('class', 'selected');
        TableContentDT.draw();

    });

    var downloads = new Downloads();

    /* Se recoge el estado del CheckBox para agregarlo a la lista de descarga */
    $('#table_DetailResult tbody tr input').click(function () {
        var check = $(this).is(':checked');
        var IdCheck = $(this).attr('id');

        if (check)
            downloads.AddRow('Content', 0, IdCheck);
        else
            downloads.RemoveRow(IdRepository, IdCheck);
    });
}

