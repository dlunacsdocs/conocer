/* 
 * Copyright 2016 danielunag.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* global BootstrapDialog, LanguajeDataTable */

var TemplateDesigner = function () {
    var self = this;
    var repositoryName = null;
    var enterpriseKey = null;
    var templateName = null;  
    var oldTemplateName = null; /* Se utiliza en modo edición para identificar cambios en el nombre de la plantilla */
    var templatesTd;
    var templatesTD;
    
    /**
     * @description Establece la acción al link del menú príncipal para consturir
     * la interfaz de diseñador de plantillas.
     * @returns {undefined}
     */
    this.setActionToLink = function () {
        $('.LinkTemplateDesigner').click(function () {
            _showTemplatesManager();
        });
    };
    
    var _showTemplatesManager = function(){
        var content = $('<div>');
        
        var table = $('<table>', {id: "templatesTable", class: "table table-striped table-bordered table-hover table-condensed"});
        var thead = $('<thead>').append('<tr><th>Clave Empresa</th><th>Repositorio</th><th>Plantilla</th><th></th></tr>');
        table.append(thead);
        
        content.append(table);
         
        BootstrapDialog.show({
            title: '<i class="fa fa-wrench fa-lg"></i> Plantillas',
            message: content,
            closable: true,
            closeByBackdrop: false,
            closeByKeyboard: true,
            size: BootstrapDialog.SIZE_NORMAL,
            type: BootstrapDialog.TYPE_PRIMARY,
            buttons: [
                {
                    icon: 'fa fa-play-circle fa-lg',
                    cssClass: "btn-primary",
                    label: "Nueva Plantilla",
                    action: function (dialogRef) {
                        var button = this;                       
                        button.spin();
                        dialogRef.enableButtons(false);
                        dialogRef.setClosable(false);

                        if (_newTemplate())
                            dialogRef.close();
                        else {
                            button.stopSpin();
                            dialogRef.enableButtons(true);
                            dialogRef.setClosable(true);
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
                templatesTd = table.dataTable({
                    "sDom": 'Tfrtlip',
                    "bInfo":false, "autoWidth" : false, "oLanguage":LanguajeDataTable,
                    "tableTools": {
                        "aButtons": [
                            {"sExtends": "text", "sButtonText": '<i class="fa fa-trash fa-lg"></i> Eliminar', "fnClick": function () {
                                    
                            }},
                            {
                                "sExtends":    "collection",
                                "sButtonText": '<i class="fa fa-floppy-o fa-lg"></i>',
                                "aButtons":    [ "csv", "xls", "pdf", "copy" ]
                            }                          
                        ]
                    }                              
                });  

                templatesTD = new $.fn.dataTable.Api('#templatesTable');
                
                templatesTd.find('tbody').on( 'click', 'tr', function () {
                    templatesTd.$('tr.selected').removeClass('selected');
                    $(this).addClass('selected');
                });
                                
                var templates = self.getTemplates();
                
                $(templates).find('template').each(function(){
                    var idRepository = $(this).find('idRepository').text();
                    var repositoryName = $(this).find('repositoryName').text();
                    var enterpriseKey = $(this).find('enterpriseKey').text();
                    var icon = '';
                    var data = [];
                    var cont = 0;
                    
                    $(this).find('templateList').each(function(){
                        $(this).find('templateName').each(function(){
                            var templateName = $(this).text();
                            templateName = templateName.replace(/\.[^/.]+$/, "");
                            cont++;
                            icon = '<a class = "btn btn-info viewTemplate" title = "visualizar plantilla"><li class = "fa fa-book fa-lg"></li></a>';
                            
                            if($.trim(String(templateName)).length === 0)
                                return true;
                            
                            var data = [enterpriseKey, repositoryName, templateName, icon];

                            var ai = templatesTD.row.add(data).draw();
                            var n = templatesTd.fnSettings().aoData[ ai[0] ].nTr;
                        });
                        
        //                    n.setAttribute('id', idRepository);                        
                    });
                });
                
                _setActionToViewTemplateIcon();
            }
        });
        
    };
    
    /**
     * @description Agrega el disparador al icono de consultar plantilla. 
     * @returns {undefined}
     */
    var _setActionToViewTemplateIcon = function(){
        
        $('.viewTemplate').unbind('click');
        $('.viewTemplate').click(function(){
                    var trIndex = $('.viewTemplate').index($(this));
                    templatesTd.$('tr.selected').removeClass('selected');
                    templatesTd.$('tbody tr').eq(trIndex).addClass('selected');
                    
                    var tr = templatesTd.$('tr.selected');
                    var position = templatesTd.fnGetPosition($(tr)[0]);
                    var enterprisekey = templatesTd.fnGetData(position)[0];
                    var repositoryname = templatesTd.fnGetData(position)[1];
                    var templatename = templatesTd.fnGetData(position)[2];
                    self.openTemplate(enterprisekey, repositoryname, templatename);
                });
    };
    
    /**
     * @description Obtiene las plantillas del sistema ordenadas por empresa y repositorio.
     * @returns {xml|XMLDocument}
     */
    this.getTemplates = function(){
        var templates = null;
        
        $.ajax({
            async: false,
            cache: false,
            dataType: "html",
            type: 'POST',
            url: "Modules/php/TemplateDesigner.php",
            data: {option: "getTemplates"},
            success: function (xml) {
                if ($.parseXML(xml) === null)
                    return errorMessage(xml);
                else
                    xml = $.parseXML(xml);

                if($(xml).find('template').length > 0)
                    templates = xml;


                $(xml).find('Error').each(function ()
                {
                    var Mensaje = $(this).find('Mensaje').text();
                    errorMessage(Mensaje);
                });
            },
            beforeSend: function () {
            },
            error: function (objXMLHttpRequest) {
                errorMessage(objXMLHttpRequest);
            }
        });
        
        return templates;
    };
    
    this.openTemplate = function(enterpriseKey, repositoryName, templateName){
        console.log("opnenning template");
        if(enterpriseKey === undefined)
            return Advertencia("La clave de empresa debe estar definida.");
        
        if(repositoryName === undefined)
            return Advertencia("El nombre del repositorio debe estar definido.");
        
        if(templateName === undefined)
            return Advertencia("El nombre de la plantilla debe estar definida.");
        
        oldTemplateName = templateName;
        
        var template = self.getTemplate(enterpriseKey, repositoryName, templateName+".xml");
                
        var templateContent = self.buildContentOfTemplate(template, 1);
       
        if(templateContent === 0)
            return Advertencia("No fue posible abrir la plantilla");
        console.log("objeto Template:");
        console.log(templateContent);
        
        var content = $('<div>');
        
        var formsDiv = $('<form>', {class: "form-horizontal"});
        var formWrapper = $('<div>', {class: "row"}).append(formsDiv);
        content.append(formWrapper);
        
        formsDiv.append(templateContent);
        
        BootstrapDialog.show({
            title: '<i class="fa fa-pencil-square fa-lg"></i> Plantilla <input type = "text" id = "templateDesigneNameForm" >',
            message: content,
            closable: true,
            closeByBackdrop: false,
            closeByKeyboard: true,
            size: BootstrapDialog.SIZE_WIDE,
            type: BootstrapDialog.TYPE_DEFAULT,
            buttons: [
                {
                    label: 'Cerrar',
                    action: function (dialogRef) {
                        dialogRef.close();
                    }
                }
            ],
            onshown: function (dialogRef) {
                $('#templateDesigneNameForm').val(templateName);
            }
        });
        
    };
    
    /**
     * @description Se genera el objeto que contiene la estructura completa de la plantilla a partir
     * de su Xml.
     * @param {type} templateXml
     * @param {boolean} updateMode Modo en el que se construye el diseñador de plantillas. 
     * En modo update se agregar el panel inferior.
     * @returns {object} contenedor con la estructura de la plantilla ya construida.
     */
    this.buildContentOfTemplate = function(templateXml, updateMode){
        console.log("buildContentOfTemplate");
//        console.log(templateXml);
        
        if(typeof templateXml !== 'object')
            return 0;
        
        var content = $('<div>');
        
        var textareaDependenceData;
        var dependeceData;
        var dependenceDataDiv;
        
        $(templateXml).find('header').each(function(){
            var header = $('<div>', {class: "row headerWrapper"});
            
            dependenceDataDiv = $('<div>', {class: "dependeceData col-xs-6 col-md-6"}).css({"font-size": "2vw"});
            var logoThumbnailDiv = $('<div>', {class: "logoWrapper col-xs-3 col-md-3"});
            var qrThumbnailDiv = $('<div>', {class: 'qrWrapper col-xs-3 col-md-3'});
            textareaDependenceData = $('<textarea>', {class: "form-control", id: "textareaDependenceData", placeHolder: "Datos de la dependecia"});
            dependeceData = $(this).find('dependeceData').text();
                        
            var logoPath = $(this).find('logoPath').text();
            
            if(!$.trim(logoPath).length > 0 || logoPath === undefined)
                logoPath = '<a href = "#" class = "thumbnail"><i class="fa fa-picture-o fa-5x icon-border" style = "font-size: 10vw;"></i></a>';
            
            logoThumbnailDiv.attr('pathLogo', logoPath).append(logoPath);
            
            var qrPath = $(this).find('qrPath').text();
            
            if(!$.trim(qrPath).length > 0 || qrPath === undefined)
                qrPath = '<a href = "#" class = "thumbnail"><i class="fa fa-qrcode fa-5x icon-border" style = "font-size: 12vw;"></i></a>';
            
            qrThumbnailDiv.attr('qrPath', qrPath).append(qrPath);
            
            header.append(logoThumbnailDiv);
            header.append(dependenceDataDiv);
            header.append(qrThumbnailDiv);

            content.append(header);
            
        });
        
        var formsDiv = $('<form>', {class: "form-horizontal"});
        var formWrapper = $('<div>', {class: "row"}).append(formsDiv);
        content.append(formWrapper);

        dependenceDataDiv.append(textareaDependenceData);
        textareaDependenceData.append(dependeceData);
        _insertBottomPanel(content);

        if(updateMode === 0)
            dependenceDataDiv.append(dependeceData);            
        
        
        $(templateXml).find('field').each(function(){
            var wrapperConfigurationTxt = $(this).find('wrapperConfiguration').text();
            var labelConfigurationTxt = $(this).find('labelConfiguration').text();
            var inputConfigrationTxt = $(this).find('inputConfigration').text();
            
            var fieldName = $(this).find('fieldName').text();
            var fieldNameTag = $(this).find('fieldNameTag').text();
            var fieldType = $(this).find('fieldType').text();
            var fieldLength = $(this).find('fieldLength').text();
            var widthSize = $(this).find('widthSize').text();
            var formWidth = $(this).find('formWidth').text();
            
            var wrapperConfiguration = $('<div>', {class: "form-group templateFormWrapper "+wrapperConfigurationTxt, colConfiguration:wrapperConfigurationTxt});
            var labelConfiguration = $('<label>',{for:"templateForm_"+fieldName,
                                        class: "control-label "+labelConfigurationTxt,
                                        colConfiguration: labelConfigurationTxt}).append(fieldNameTag);
            var fieldDiv = $('<div>', {class: "templateField "+inputConfigrationTxt});
            var form = $('<input>', {class: "form-control", 
                                    fieldName: fieldName,
                                    fieldNameTag: fieldNameTag,
                                    widthSize: widthSize,   /* Tamaño del select */
                                    formWidth: formWidth,   /* Tamaño en columnas */
                                    fieldType: fieldType,
                                    fieldLength: fieldLength,
                                    id: "templateForm_" + fieldName,
                                    colConfiguration: inputConfigrationTxt});
            
            fieldDiv.append(form);
            wrapperConfiguration.append(labelConfiguration)
                    .append(fieldDiv);        
            
//            console.log(wrapperConfiguration);
            
            formsDiv.append(wrapperConfiguration);
            
            if(updateMode === 1){
                _buildPophoverOfForm(form, updateMode);
            }
            
        });
        
        $('body').on('click', function (e) {
            $(formsDiv).find('input').each(function () {
                //the 'is' for buttons that trigger popups
                //the 'has' for icons within a button that triggers a popup
                if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                    $(this).popover('hide');
                }
            }); 
        });
        
        return content;
    };
    
    /**
     * @description En modo update cada uno de los formularios podrá editarse mediante la construcción de un pophover.
     * @param {type} form
     * @returns {undefined}
     */
    var _buildPophoverOfForm = function(form, updateMode){
        
        $(form).popover({
            html: true,
            title: function () {
                return $('<div>').append('<li class = "fa fa-pencil-square"></li> Modificar Campo Activo');
            },
            content: function () {
                return _getPopoverBody(form).html();
            },
            placement: "top"
        }).on("show.bs.popover", function () {
            $(this).data("bs.popover").tip().css("min-width", "250px"); 
            
        }).on("shown.bs.popover", function(){
            var field = $(this);
            var widthSize = $(this).attr('widthsize');
            widthSize = parseInt(widthSize) / 2;
            
            $('#popoverTemplateButtonModify').unbind('click').click(function(){
                _modifyFormTarget(field);
                if(updateMode === 1)
                    _saveTemplate(updateMode);
            });
            
            $('#popoverTemplateButtonDelete').unbind('click').click(function(){
                _deleteField(field);
            });            
            
            $('#popoverTemplateWidthSelect option[width='+ widthSize + ']').prop("selected", true);
            
            $('#popoverTemplateWidthSelect').unbind('change').change(function(){
                _modifyFieldWidth(field);
            });
            
            $('#popoverTemplateTagNameButton').unbind('click').click(function(){
                _modifyFormTarget();
            });
            
        });
    };
    
    /**
     * @description Devuelve un objeto que compone el contenido del popover de edición de campos.
     * @returns {$}
     */
    var _getPopoverBody = function(field){        
        var formHorizontal = $('<div>', {class: "form-horizontal"});
        var formGroup = $('<div>', {class: "form-group"});
        var formWrapper = $('<div>', {class: "col-md-9"});
        var widthSelectLabel = $('<label>', {class: "col-md-3"}).append("Tamaño");
        var widthSelect = $('<select>', {id: "popoverTemplateWidthSelect", class: "form-control"});
        var pophoverContent = $('<div>');

        formWrapper.append(widthSelect);
        formGroup.append(widthSelectLabel).append(formWrapper);
        formHorizontal.append(formGroup);

        widthSelect.append('<option width = "1">1</option>\n\
                            <option width = "2">2</option>\n\
                            <option width = "3">3</option>\n\
                            <option width = "4">4</option>\n\
                            <option width = "5">5</option>\n\
                            <option width = "6">6</option>');
        
        var formGroup = $(field).parents()[1];        
        var label = $(formGroup).children()[0];
        var tagNameForm = $('<input>', {id: "popoverTemplateTagNameForm" ,class: "form-control", value: $(label).html()});
        var tagNameLabel = $('<label>', {class: "col-md-3"}).append("Etiqueta");
        var tagNameFormWrapper = $('<div>', {class: "col-md-9"}).append(tagNameForm);
        formGroup = $('<div>', {class: "form-group"}).append(tagNameLabel).append(tagNameFormWrapper);
        formHorizontal.append(formGroup);
        
        /* Botón Eliminar */
        var buttonRemove = $('<a>', {id:"popoverTemplateButtonDelete" , class: "btn btn-danger", href: "#"}).append('<li class = "fa fa-trash-o fa-lg"></li> Eliminar');
        var removeIconWrapper = $('<div>', {class: "col-xs-6 col-sm-6 col-md-6"}).append(buttonRemove);
        formGroup = $('<div>', {class: "form-group"}).append(removeIconWrapper);
        
        /* Boton Modifcar */
        var buttonModify = $('<a>', {id: "popoverTemplateButtonModify", class: "btn btn-warning", href: "#"}).append('<li class = "fa fa-pencil-square"></li> Modificar');
        var buttonAcceptWrapper = $('<div>', {class: "col-xs-6 col-sm-6 col-md-6"}).append(buttonModify);
        formGroup.append(buttonAcceptWrapper);
        formHorizontal.append(formGroup);

        pophoverContent.append(formHorizontal);
        
        return pophoverContent;  
    };
    
    /**
     * @description Modifica  tamaño de un campo del diseñador de formas
     * @param {type} field
     * @returns {undefined}
     */
    var _modifyFieldWidth = function(field){
//        console.log(field);
        var width = $('#popoverTemplateWidthSelect option:selected').attr('width');
        var labelWidth = 3;
        var formWidth = 9;
        var oldWidth = $(field).attr('widthsize');
        var oldFormWidth =  $(field).attr('formWidth');
        var oldLabelWidth = 12 - parseInt(oldFormWidth);
        width = parseInt(width) * 2;
        
        if (width <= 4) {
            labelWidth = 6;
            formWidth = 6;
        }
                 
        var colString = "col-xs-" + width + " " + "col-sm-" + width + " " + "col-md-" + width;     
        var colStringDivForm = "col-xs-"+formWidth+" col-sm-"+formWidth+" col-md-"+formWidth;
        var labelColString = 'col-xs-' + labelWidth + ' col-sm-' + labelWidth + ' col-md-' + labelWidth;
        
        var oldColStringDivForm = "col-xs-"+oldFormWidth+" col-sm-"+oldFormWidth+" col-md-"+oldFormWidth;
        var oldLabelColString = 'col-xs-' + oldLabelWidth + ' col-sm-' + oldLabelWidth + ' col-md-' + oldLabelWidth;
        var oldColString = "col-xs-" + oldWidth + " " + "col-sm-" + oldWidth + " " + "col-md-" + oldWidth;     
        
        var formGroup = $(field).parents()[1];        
        var formWrapper = $(formGroup).find('.templateField')[0];
        var label = $(formGroup).children()[0];
        
        $(formGroup).removeClass(oldColString).addClass(colString)
                .removeAttr('colConfiguration').attr('colConfiguration', colString);
        
        $(formWrapper).removeClass(oldColStringDivForm).addClass(colStringDivForm);
        
        $(field).removeAttr('colConfiguration').attr('colConfiguration', colStringDivForm)
                .removeAttr('widthSize').attr('widthSize', width)
                .removeAttr('formWidth').attr('formWidth',formWidth);
                
        $(label).removeClass(oldLabelColString).addClass(labelColString)
                .removeAttr('colConfiguration').attr('colConfiguration', labelColString);
        
    };
    
    /**
     * @description Modifica la etiqueta de un campo.
     * @param {object} field Formulario seleccionado para modificar etiqueta.
     * @returns {undefined}
     */
    var _modifyFormTarget = function(field){
        var formGroup = $(field).parents()[1];        
        var label = $(formGroup).children()[0];
        var newLabel = $('#popoverTemplateTagNameForm').val();
        $(field).removeAttr('fieldNameTag').attr('fieldNameTag', newLabel);
        $(label).html($.trim(newLabel));
    };
     
    /**
     * @description Elimina un campo del diseñador de formas.
     * @param {type} field
     * @returns {undefined}
     */
    var _deleteField = function(field){
        console.log('deleting field');
        
    };
    
    /**
     * @description Obtiene una plantilla en específico;
     * @param {String} enterpriseKey
     * @param {String} repositoryName
     * @param {String} templateName
     * @returns {xml} Plantilla.
     */
    this.getTemplate = function(enterpriseKey, repositoryName, templateName){
        var templateStructure = null;
        $.ajax({
            async: false,
            cache: false,
            dataType: "html",
            type: 'POST',
            url: "Modules/php/TemplateDesigner.php",
            data: {option: "getTemplate", enterpriseKey:enterpriseKey, repositoryName:repositoryName, templateName:templateName},
            success: function (xml) {
                if ($.parseXML(xml) === null)
                    return errorMessage(xml);
                else
                    xml = $.parseXML(xml);

                if($(xml).find('template').length > 0)
                    templateStructure = xml;

                $(xml).find('Error').each(function ()
                {
                    var Mensaje = $(this).find('Mensaje').text();
                    errorMessage(Mensaje);
                });
            },
            beforeSend: function () {
            },
            error: function (objXMLHttpRequest) {
                errorMessage(objXMLHttpRequest);
            }
        });
        return templateStructure;
    };

    /**
     * @description Interfaz para agregar una nueva plantilla.
     * @returns {undefined}
     */
    var _newTemplate = function () {
        var content = $('<div>').append('<p>Seleccione un repositorio para iniciar con el diseñador de plantillas</p>');

        var formGroup = $('<div>', {class: "form-group"});
        var enterpriseLabel = $('<label>').append("Empresa");
        var enterpriseForm = $('<select>', {class: "form-control"}).append($('<option>', {value: 0}).append('Seleccione una empresa'));

        formGroup.append(enterpriseLabel);
        formGroup.append(enterpriseForm);

        content.append(formGroup);

        formGroup = $('<div>', {class: "form-group"});
        var repositoryLabel = $('<label>').append("Repositorio");
        var repositoryForm = $('<select>', {class: "form-control"}).append($('<option>', {value: 0}).append('Esperando empresa'));
                
        formGroup.append(repositoryLabel).append(repositoryForm);

        content.append(formGroup);
        
        formGroup = $('<div>', {class: "form-group"});
        var templateNameForm = $('<input>', {type:"text" ,class: "form-control"});
        var templateNameLabel = $('<label>').append("Asignar Nombre");
        
        formGroup.append(templateNameLabel)
                .append(templateNameForm);
        
        content.append(formGroup);
        
        BootstrapDialog.show({
            title: '<i class="fa fa-plus-circle fa-lg"></i> Nueva Plantilla',
            message: content,
            closable: true,
            closeByBackdrop: false,
            closeByKeyboard: true,
            size: BootstrapDialog.SIZE_SMALL,
            type: BootstrapDialog.TYPE_PRIMARY,
            buttons: [
                {
                    hotkey: 13,
                    icon: 'fa fa-play-circle fa-lg',
                    cssClass: "btn-primary",
                    label: "Comenzar",
                    action: function (dialogRef) {
                        var button = this;

                        var idRepository = repositoryForm.find('option:selected').attr("idrepository");
                        var repositoryName = repositoryForm.find('option:selected').attr('repositoryname');
                        var enterpriseKey = enterpriseForm.find('option:selected').attr('enterprisekey');
                        var templatename = $.trim(templateNameForm.val());
                        
                        if (!parseInt(idRepository) > 0)
                            return 0;
                        
                        if(!templatename.length > 0)
                            return Advertencia("Debe asignar un nombre a la plantilla");
                        
                        templateName = templatename;

                        button.spin();
                        dialogRef.enableButtons(false);
                        dialogRef.setClosable(false);

                        if (parseInt(idRepository)) {
                            if (_newTemplateInterface(enterpriseKey, idRepository, repositoryName))
                                dialogRef.close();
                            else {
                                button.stopSpin();
                                dialogRef.enableButtons(true);
                                dialogRef.setClosable(true);
                            }
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
                var enterprise = new ClassEnterprise();
                var enterprises = enterprise.GetEnterprises();

                $(enterprises).find('Enterprise').each(function () {
                    var idEnterprise = $(this).find('IdEmpresa').text();
                    var enterpriseKey = $(this).find('ClaveEmpresa').text();
                    var enterpriseName = $(this).find('NombreEmpresa').text();

                    var option = $('<option>', {"enterpriseKey": enterpriseKey, "idEnterprise": idEnterprise}).append("(" + enterpriseKey + ") " + enterpriseName.slice(0, 40));
                    ;
                    enterpriseForm.append(option);
                });

                enterpriseForm.change(function () {
                    var idEnterprise = $(this).find('option:selected').attr("identerprise");
                    var enterpriseKey = $(this).find('option:selected').attr("enterprisekey");

                    if (!parseInt(idEnterprise) > 0) {
                        repositoryForm.empty();
                        return repositoryForm.append('<option>Esperando Empresa</option>');
                    }

                    repositoryForm.empty().append('<option>Seleccione un repositorio</option>');

                    var repository = new ClassRepository();
                    var repositories = repository.GetRepositories(enterpriseKey);

                    $(repositories).find('Repository').each(function () {
                        var idRepository = $(this).find('IdRepositorio').text();
                        var repositoryName = $(this).find('NombreRepositorio').text();
                        var option = $('<option>', {value: idRepository, "idRepository": idRepository, "repositoryName": repositoryName}).append(repositoryName);

                        repositoryForm.append(option);
                    });

                });

                enterpriseForm.focus();

//                _newTemplateInterface("DANIEL", 5, "Documentos");
                self.setTemplateName("pruebaTemplate");
            }
        });
    };
    /**
     * @description Construye la interfaz príncipal del diseñador de plantillas.
     * @param {type} enterprisekey
     * @param {type} idRepository
     * @param {type} repositoryname
     * @returns {Number}
     */
    var _newTemplateInterface = function (enterprisekey, idRepository, repositoryname) {
        repositoryName = repositoryname;
        enterpriseKey = enterprisekey;
        
        var status = 1;
        var content = $('<div>', {});
        var header = $('<div>', {class: "row headerWrapper"});
        var dependenceData = $('<div>', {id: "dependeceData", class: "col-xs-6 col-md-6"}).css({"font-size": "2vw"});
        var logoThumbnail = $('<div>', {id: "logoWrapper", class: "col-xs-3 col-md-3", logoPath:""}).append('<a href = "#" class = "thumbnail"><i class="fa fa-picture-o fa-5x icon-border" style = "font-size: 10vw;"></i></a>');
        var qrThumbnail = $('<div>', {id: "qrWrapper" ,class: 'col-xs-3 col-md-3', qrPath:""}).append('<a href = "#" class = "thumbnail"><i class="fa fa-qrcode fa-5x icon-border" style = "font-size: 12vw;"></i></a>');
        var textareaDependenceData = $('<textarea>', {class: "form-control", id: "textareaDependenceData", placeHolder: "Datos de la dependecia"});

        dependenceData.append(textareaDependenceData);
        
        header.append(logoThumbnail);
        header.append(dependenceData);
        header.append(qrThumbnail);

        content.append(header);

        var formsDiv = $('<form>', {class: "form-horizontal"});
        var formWrapper = $('<div>', {class: "row"}).append(formsDiv);
        content.append(formWrapper);
        
        _insertBottomPanel(content);

        BootstrapDialog.show({
            title: '<i class="fa fa-cog fa-lg"></i> Diseñador de Plantillas <input type = "text" id = "templateDesigneNameForm" value = "' + templateName + '">',
            message: content,
            closable: true,
            closeByBackdrop: false,
            closeByKeyboard: false,
            size: BootstrapDialog.SIZE_WIDE,
            type: BootstrapDialog.TYPE_DEFAULT,
            buttons: [
                {
                    label: 'Almacenar',
                    icon: 'fa fa-floppy-o fa-lg',
                    cssClass: 'btn-primary',
                    action: function (dialogRef) {
                        var button = this;
                        button.spin();
                        dialogRef.setClosable(false);
                        dialogRef.enableButtons(false);
                        
                        if(_saveTemplate())
                            dialogRef.close();
                        else{
                            dialogRef.setClosable(true);
                            dialogRef.enableButtons(true);
                            button.stopSpin();
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
                var bottomPanelSelectWidth = $('#bottomPanelSelectWidth');
                var buttonPanelSelectButtonAdd = $('#buttonPanelSelectButtonAdd');
                var bottomPanelFieldSelect = $('#bottomPanelFieldSelect');
                var bottomPanelFieldType = $('#bottomPanelFieldType');
                var bottomPanelFormTag = $('#bottomPanelFormTag');

                bottomPanelSelectWidth.append('<option width = "1">1</option>\n\
                                                <option width = "2">2</option>\n\
                                                <option width = "3">3</option>\n\
                                                <option width = "4">4</option>\n\
                                                <option width = "5">5</option>\n\
                                                <option width = "6">6</option>');
                                                
                var forms = GeStructure(repositoryName);
                
                $(forms).find("Campo").each(function (index) {
                    var fieldName = $(this).find("name").text();
                    var fieldType = $(this).find("type").text();
                    var fieldLength = $(this).find("long").text();
                    var required = $(this).find("required").text();

                    var option = $('<option>', {"fieldName": fieldName, "fieldType": fieldType, "fieldLength": fieldLength}).append(fieldName);
                    
                    if(index===0){
                        bottomPanelFormTag.val(fieldName);
                        bottomPanelFieldType.val(fieldType);
                    }
                    
                    bottomPanelFieldSelect.append(option);
                });
                                
                bottomPanelFieldSelect.change(function () {
                    _setFielDetail($(this),bottomPanelFormTag, bottomPanelFieldType);
                });

                /* Otras opciones de campo */

                bottomPanelFieldSelect.append($('<option>', {"fieldName": "CSDocs_textType", "fieldType": "text"}).append("Ingresar Texto"));
                bottomPanelFieldSelect.append($('<option>', {"fieldName": "CSDocs_barcode", "fieldType": "Código de Barras"}).append('Código de Barras'));
                
                buttonPanelSelectButtonAdd.click(function () {
                    var fieldTag = $.trim(bottomPanelFormTag.val());
                    
                    if (fieldTag.length > 0)
                        _addForm(formsDiv, bottomPanelSelectWidth, bottomPanelFieldSelect, bottomPanelFormTag);
                    else
                        Advertencia("Ingrese una etiqueta para el campo.");
                });
            }
        });

        return status;
    };
    
    /**
     * @description Panel que controla las formas a insertar en la plantilla.
     * @param {object} content Contenedor donde se inserta el panel.
     * @returns {undefined}
     */
    var _insertBottomPanel = function(content){
        var bottomPanel = $('<div>', {class: "panel panel-info"});/* Panel inferior con los campos a ir agregando */
        var bottomPanelHeading = $('<div>', {class: "panel-heading"}).append('Seleccione el campo a insertar');
        var bottomPanelBody = $('<div>', {class: "panel-body"});

        bottomPanelBody.append('\
                <form class="form-horizontal">\n\
                    <div class="form-group">\n\
                        <label class="col-xs-2 col-sm-2 control-label">Tamaño</label>\n\
                        <div class="col-xs-4 col-sm-4 col-md-4">\n\
                            <select id = "bottomPanelSelectWidth" class = "form-control"></select>\n\
                        </div>\n\
                            <label class="col-xs-2 col-sm-2control-label">Etiqueta</label>\n\
                            <div class="col-xs-4 col-sm-4 col-md-4">\n\
                                <input type = "text" id = "bottomPanelFormTag" class = "form-control">\n\
                    </div>\n\
                    </div>\n\
                    <div class="form-group">\n\
                        <label class="col-xs-2 col-sm-2 control-label">Campo</label>\n\
                        <div class="col-xs-4 col-sm-4 col-md-4">\n\
                            <select id = "bottomPanelFieldSelect" class="form-control"></select>\n\
                        </div>\n\
                        <label class="col-xs-2 col-sm-2 control-label">Tipo</label>\n\
                        <div class="col-xs-4 col-sm-4 col-md-4">\n\
                            <input type = "text" id = "bottomPanelFieldType" class="form-control" disabled>\n\
                        </div>\n\
                    </div>\n\
                    <div class="form-group">\n\
                        <div class="col-sm-offset-2 col-xs-9 col-sm-6">\n\
                            <a id = "buttonPanelSelectButtonAdd" class="btn btn-primary"><li class = "fa fa-plus-circle fa-lg"></li> Agregar</a>\n\
                        </div>\n\
                    </div>\n\
                </form>');

        bottomPanel.append(bottomPanelHeading)
                .append(bottomPanelBody);

        content.append(bottomPanel);
    };

    var _getColumnsClass = function (width) {
        var colXs = "col-xs-" + width;
        var colSm = "col-sm-" + width;
        var colMd = "col-md-" + width;
        var colString = colXs + " " + colSm + " " + colMd;

        return colString;
    };
    
    /**
     * @description Ingresa un nuevo formulario en la interfaz de diseño.
     * @param {type} templateContent
     * @param {type} widthSelect
     * @param {type} fieldsSelect
     * @param {type} bottomPanelFormTag
     * @returns {undefined}
     */
    var _addForm = function (templateContent, widthSelect, fieldsSelect, bottomPanelFormTag) {
        var width = widthSelect.find('option:selected').attr('width');
        var fieldName = fieldsSelect.find('option:selected').attr('fieldname');

        if (fieldName === undefined)
            return Advertencia("Seleccione un campo válido");

        if (!parseInt(width) > 0)
            return Advertencia("La longitud no es válida");

        if (fieldName === 'CSDocs_textType')
            return  _addTextType(templateContent, widthSelect);
        
        if(fieldName === 'CSDocs_barcode')
            return _addBarcode(templateContent, widthSelect, fieldsSelect, bottomPanelFormTag);

        _addInlineForm(templateContent, widthSelect, fieldsSelect, bottomPanelFormTag);

    };
    
    /**
     * @description Inserta el código de barras en la plantilla.
     * @param {object} templateContent Contenedor
     * @param {object} widthSelect Fomrulario con el tamaño del campo
     * @param {object} fieldsSelect Formulario con cada uno de los campos
     * @param {object} bottomPanelFormTag Formulario de etiqueta del campo
     * @returns {boolean}
     */
    var _addBarcode = function(templateContent, widthSelect, fieldsSelect, bottomPanelFormTag){
        var width = widthSelect.find('option:selected').attr('width');
        var bottomPanelFieldType = $('#bottomPanelFieldType');      
        if(parseInt(width) < 3)
            width = 3;
        
        var formDivWidthSettings = "col-xs-"+width+" col-sm-"+width+" col-md-"+width;
        var divWidth = "col-xs-12 col-sm-12 col-md-12";
        
        var formGroup = $('<div>', {class: "form-group templateWrapper "+formDivWidthSettings, "colConfigration": formDivWidthSettings});
        var label = $('<label>');
        var divWrapper = $('<div>', {class: "templateField "+divWidth, style: "text-align: center; font-size: 2vw;"});
        var barcode = $('<i>', {class: "fa fa-barcode fa-5x"});
        
        divWrapper.append(barcode);
        
        formGroup.append(label)
                .append(divWrapper);
        
        templateContent.append(formGroup);
        
        fieldsSelect.find('option:selected').remove();
        
        _setFielDetail(fieldsSelect, bottomPanelFormTag, bottomPanelFieldType);
        
        return true;
    };

    var _addInlineForm = function (templateContent, widthSelect, fieldsSelect, bottomPanelFormTag) {
        var fieldNameTag = bottomPanelFormTag.val();
        var fieldName = fieldsSelect.find('option:selected').attr('fieldname');
        var width = widthSelect.find('option:selected').attr('width');
        var fieldType = fieldsSelect.find('option:selected').attr('fieldType');
        var fieldLength = fieldsSelect.find('option:selected').attr('fieldLength');
        var bottomPanelFieldType = $('#bottomPanelFieldType');      
        
        width = parseInt(width) * 2;

        var labelWidth = 3;
        var formWidth = 9;

        if (width <= 0)
            width = 1;

        if (width <= 4) {
            labelWidth = 6;
            formWidth = 6;
        }

        var labelColString = 'col-xs-' + labelWidth + ' col-sm-' + labelWidth + ' col-md-' + labelWidth;
        var colString = "col-xs-" + width + " " + "col-sm-" + width + " " + "col-md-" + width;     
        var colStringDivForm = "col-xs-"+formWidth+" col-sm-"+formWidth+" col-md-"+formWidth;

        var inline =    '<div class = "form-group templateFormWrapper ' + colString + '" colConfiguration = "'+colString+'">\n\
                            <label \n\
                                for = "templateForm_' + fieldName + '" \n\
                                class = "control-label ' + labelColString + '"\n\
                                colConfiguration = "'+labelColString+'"\n\
                                labelWidth = "' + labelWidth + '"\n\
                            >' 
                                + fieldNameTag + 
                            '</label>\n\
                            <div class = "templateField col-md-' + formWidth + '">\n\
                                <input type = "text" \n\
                                    class = "form-control" \n\
                                    fieldName = "' + fieldName+'" \n\
                                    fieldNameTag = "' + fieldNameTag + '" \n\
                                    fieldType = "' + fieldType + '" \n\
                                    fieldLength = "' + fieldLength + '" \n\
                                    widthSize = "' + width + '"\n\
                                    formWidth = "' + formWidth + '"\n\
                                    id = "templateForm_' + fieldName + '"\n\
                                    colConfiguration = "' + colStringDivForm + '"\n\
                                >\n\
                            </div>\n\
                        </div>';

        templateContent.append(inline);

        fieldsSelect.find('option:selected').remove();
        
        _setFielDetail(fieldsSelect, bottomPanelFormTag, bottomPanelFieldType);
    };
    
    /**
     * @description Ingresa el detalle de cada campo seleccionado en los formularios de "Etiqueta y Tipo"
     * @param {type} fieldSelected
     * @param {type} bottomPanelFormTag
     * @param {type} bottomPanelFieldType
     * @returns {undefined}
     */
    var _setFielDetail = function(fieldSelected, bottomPanelFormTag, bottomPanelFieldType){
        var fieldType = $(fieldSelected).find('option:selected').attr('fieldType');
        var fieldName = $(fieldSelected).find('option:selected').attr('fieldName');

        bottomPanelFormTag.val(fieldName);
        bottomPanelFieldType.val(fieldType);
    };

    var _addTextType = function (templateContent, width) {
        var content = $('<div>');

        content.append("<p>Ingrese el texto deseado</p>");

        var formGroup = $('<div>', {class: "form-group"});
        var textArea = $('<textarea>', {class: "form-control"});
        var label = $('<label>');

        formGroup.append(label)
                .append(textArea);

        content.append(formGroup);

        BootstrapDialog.show({
            title: '<i class="fa fa-font fa-lg"></i> Ingresar Texto',
            message: content,
            closable: true,
            closeByBackdrop: false,
            closeByKeyboard: true,
            size: BootstrapDialog.SIZE_SMALL,
            type: BootstrapDialog.TYPE_PRIMARY,
            buttons: [
                {
                    label: 'Agregar',
                    icon: 'fa fa-plus-circle fa-lg',
                    cssClass: 'btn-primary',
                    action: function (dialogRef) {
                        var colString = _getColumnsClass(width);


                        var wrapper = $('<div>', {class: "wrapper " + colString});

                        wrapper.insertBefore($('#bottomPanelDiv'));
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
    };

    var _saveTemplate = function (updateMode) {        
        var status = 0;
        var xml = _createXmlForSaving();
        
        if(xml === undefined)
            return 0;
 
        $.ajax({
        async: false,
        cache: false,
        dataType: "html",
        type: 'POST',
        url: "Modules/php/TemplateDesigner.php",
        data: {option: "saveTemplate", xml: xml, updateMode:updateMode, oldTemplateName: oldTemplateName},
        success: function (respuesta) {
            if ($.parseXML(respuesta) === null)
                return errorMessage(respuesta);
            else
                xml = $.parseXML(respuesta);
            
            $(xml).find('templateSaved').each(function(){
                status = 1;
                var message = $(this).find('Mensaje').text();
                Notificacion(message);
                templatesTd.$('tr.selected').removeClass('selected');
                var icon = '<a class = "btn btn-info viewTemplate" title = "visualizar plantilla"><li class = "fa fa-book fa-lg"></li></a>';
                var data = [enterpriseKey, repositoryName, templateName, icon];

                var ai = templatesTD.row.add(data).draw();
                var n = templatesTd.fnSettings().aoData[ ai[0] ].nTr;
                n.setAttribute('class', "selected");
                _setActionToViewTemplateIcon();
                
            });

            $(xml).find('Error').each(function ()
            {
                var Mensaje = $(this).find('Mensaje').text();
                errorMessage(Mensaje);
            });
        },
        beforeSend: function () {
        },
        error: function (objXMLHttpRequest) {
            errorMessage(objXMLHttpRequest);
        }
    });
        
        return status;
    };

    /**
     * @description Genera la cadena XML para almacenar la plantilla.
     * @returns {undefined}
     */ 
    var _createXmlForSaving = function () {
        console.log("creating XML for saving");
        
        templateName = $.trim($('#templateDesigneNameForm').val());
        
        if(templateName.length === 0)
            return Advertencia("Seleccione un nombre válido para la plantilla");
        
        var xml = "<template version='1.0' encoding='UTF-8' enterpriseKey = '"+enterpriseKey+"' repositoryName = '"+ repositoryName+ "' templateName = '"+templateName+".xml"+"'>";
        var templateWrapper = $('.templateFormWrapper');
        var headerWrapper = $('.headerWrapper');
        
        if(!headerWrapper.length > 0)
            return Advertencia("No se reconocio el encabezado de la plantilla");
        
        if(templateWrapper.length === 0)
            return Advertencia('Debe agregar por lo menos un campo');
        
        /* Se guarda la configuración de la cabecera */
                
        var dependeceData = $(headerWrapper).find('#textareaDependenceData').val();
        var logoWrapper = $(headerWrapper).find('#logoWrapper');
        var qrWrapper = $(headerWrapper).find('#qrWrapper');
        
        var logoPath = $(dependeceData).attr('logopath');
        var qrPath = $(dependeceData).attr('qrpath');
        
        if(logoPath === undefined)
            logoPath = "";
        
        if(qrPath === undefined)
            qrPath = "";
        
        console.log(dependeceData);
        console.log(logoWrapper);
        console.log(qrWrapper);
        
        xml +="<header>";
            xml += "<dependeceData>"+dependeceData+"</dependeceData>";
            xml += "<logoPath>"+ logoPath +"</logoPath>";
            xml += "<qrPath>"+ qrPath +"</qrPath>";
        xml +="</header>";
        
        /* Se guarda la configuración de cada formulario */
        $(templateWrapper).each(function(){
            var wrapperConfigration = $(this).attr('colconfiguration');
            var labelConfigration;
            
            $(this).find('label').each(function(){
                    labelConfigration = $(this).attr('colconfiguration');
            });
                        
            $(this).find('input').each(function(){
                var fieldName = $(this).attr('fieldName');
                
                if(fieldName !== undefined)
                    xml += '\
                    <field>\n\
                        <fieldName>' + fieldName + '</fieldName>\n\
                        <fieldNameTag>' + $(this).attr('fieldNameTag') + '</fieldNameTag>\n\
                        <fieldType>' + $(this).attr('fieldType') + '</fieldType>\n\
                        <fieldLength>' + $(this).attr('fieldLength') + '</fieldLength>\n\
                        <widthSize>' + $(this).attr('widthSize') + '</widthSize>\n\
                        <formWidth>' + $(this).attr('formWidth') + '</formWidth>\n\
                        <wrapperConfiguration>' + wrapperConfigration + '</wrapperConfiguration>\n\
                        <labelConfiguration>' + labelConfigration + '</labelConfiguration>\n\
                        <inputConfigration> ' + $(this).attr('colConfiguration') + '</inputConfigration> \n\
                    </field>';            
            });
        });
        
        xml+= "</template>";
        
        console.log(xml);
        
        return xml;
       
    };
    
    this.setTemplateName = function(newTemplateName){
        templateName = newTemplateName;
    };
    
    this.setEnterpriseKey = function(newEnterpriseKey){
        enterpriseKey = newEnterpriseKey;
    };
    
    this.setRepositoryName = function(newRepositoryName){
        repositoryName = newRepositoryName;
    };
    
};

