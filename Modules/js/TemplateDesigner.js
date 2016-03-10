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

                        if (_selectingRepository())
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
                            console.log(templateName);
                            cont++;
                            icon = '<li class = "fa fa-view fa-lg"></li>';
                            data = [enterpriseKey, repositoryName, templateName, icon];

                            var ai = templatesTD.row.add(data).draw();
                            var n = templatesTd.fnSettings().aoData[ ai[0] ].nTr;
                        });
                        
        //                    n.setAttribute('id', idRepository);                        
                    });
                    
                    if(cont === 0){
                        data = [enterpriseKey, repositoryName, '', icon];
                    
                        var ai = templatesTD.row.add(data).draw();
                        var n = templatesTd.fnSettings().aoData[ ai[0] ].nTr;
    //                    n.setAttribute('id', idRepository);
                    }
                });
                
            }
        });
        
        
    };
    
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

    var _selectingRepository = function () {
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
                            if (_buildInterface(enterpriseKey, idRepository, repositoryName))
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

                _buildInterface("DANIEL", 5, "Documentos");
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
    var _buildInterface = function (enterprisekey, idRepository, repositoryname) {
        repositoryName = repositoryname;
        enterpriseKey = enterprisekey;
        
        var status = 1;
        var content = $('<div>', {});
        var header = $('<div>', {class: "row"});
        var dependenceData = $('<div>', {class: "col-xs-6 col-md-6"}).css({"font-size": "2vw"}).append('Datos de dependencia.');
        var logoThumbnail = $('<div>', {class: "col-xs-3 col-md-3"}).append('<a href = "#" class = "thumbnail"><i class="fa fa-picture-o fa-5x icon-border" style = "font-size: 10vw;"></i></a>');
        var qrThumbnail = $('<div>', {class: 'col-xs-3 col-md-3'}).append('<a href = "#" class = "thumbnail"><i class="fa fa-qrcode fa-5x icon-border" style = "font-size: 12vw;"></i></a>');
        ;

        header.append(logoThumbnail);
        header.append(dependenceData);
        header.append(qrThumbnail);

        content.append(header);

        var formsDiv = $('<form>', {class: "form-horizontal"});
        var formWrapper = $('<div>', {class: "row"}).append(formsDiv);
        content.append(formWrapper);

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

        BootstrapDialog.show({
            title: '<i class="fa fa-cog fa-lg"></i> Diseñador de Plantillas',
            message: content,
            closable: true,
            closeByBackdrop: false,
            closeByKeyboard: true,
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
                                                <option width = "4">4</option>\n\\n\
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

        _addInlineForm(templateContent, widthSelect, fieldsSelect, bottomPanelFormTag);

//        var colString = _getColumnsClass(width);
//        
//        var wrapper = $('<div>', {class: "wrapper "+colString});
//        var formGroup = $('<div>', {class: "form-group"});
//        var form = $('<input>', {type: "text", class: "form-control"});
//        var label = $('<label>', {}).append(fieldName);
//        
//        formGroup.append(label)
//                .append(form);
//        
//        wrapper.append(formGroup);
//        
//        wrapper.insertBefore($('#bottomPanelDiv'));
//        
//        fieldsSelect.find('option:selected').remove();

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

        var colXs = "col-xs-" + width;
        var colSm = "col-sm-" + width;
        var colMd = "col-md-" + width;
        var colString = colXs + " " + colSm + " " + colMd;
        
        var colStringDivForm = "col-xs-"+formWidth+" col-sm-"+formWidth+" col-md-"+formWidth;

        var inline =    '<div class = "form-group templateWrapper ' + colString + '" colConfiguration = "'+colString+'">\n\
                            <label \n\
                                for = "templateForm_' + fieldName + '" \n\
                                class = "control-label ' + labelColString + '"\n\
                                colConfiguration = "'+labelColString+'"\n\
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

    var _saveTemplate = function () {        
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
        data: {option: "saveTemplate", xml: xml},
        success: function (respuesta) {
            if ($.parseXML(respuesta) === null)
                return errorMessage(respuesta);
            else
                xml = $.parseXML(respuesta);
            
            $(xml).find('templateSaved').each(function(){
                status = 1;
                var message = $(this).find('Mensaje').text();
                Notificacion(message);
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
        var xml = "<template version='1.0' encoding='UTF-8' enterpriseKey = '"+enterpriseKey+"' repositoryName = '"+ repositoryName+ "' templateName = '"+templateName+"'>";
        var templateWrapper = $('.templateWrapper');

        if(templateWrapper.length === 0)
            return Advertencia('Debe agregar por lo menos un campo');
        
        $(templateWrapper).each(function(){
            var wrapperConfigration = $(this).attr('colConfiguration');
            var labelConfigration;
            
            $(this).find('label').each(function(){
                    labelConfigration = $(this).attr('colConfiguration');
            });
                        
            $(this).find('input').each(function(){
                xml += '\
                <field>\n\
                    <fieldName>' + $(this).attr('fieldName') + '</fieldName>\n\
                    <fieldNameTag>' + $(this).attr('fieldNameTag') + '</fieldNameTag>\n\
                    <fieldType>' + $(this).attr('fieldType') + '</fieldType>\n\
                    <fieldLength>' + $(this).attr('fieldLength') + '</fieldLength>\n\
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
    
    
};

