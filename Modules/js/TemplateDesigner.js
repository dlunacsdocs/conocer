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

/* global BootstrapDialog */

var TemplateDesigner = function(){
    var fieldCounter = 0;
    /**
     * @description Establece la acción al link del menú príncipal para consturir
     * la interfaz de diseñador de plantillas.
     * @returns {undefined}
     */
    this.setActionToLink = function(){
        $('.LinkTemplateDesigner').click(function(){
            _selectingRepisitory();
        });
    };
    
    var _selectingRepisitory = function(){
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
        
        BootstrapDialog.show({
            title: '<i class="fa fa-cog fa-lg"></i> Elección de Repositorio',
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
                    action: function(dialogRef){
                        var button = this;
                        
                        var idRepository = repositoryForm.find('option:selected').attr("idrepository");
                        var repositoryName = repositoryForm.find('option:selected').attr('repositoryname');
                        var enterpriseKey = enterpriseForm.find('option:selected').attr('enterprisekey');
                        
                        if(!parseInt(idRepository) > 0)
                            return;
                            
                        button.spin();
                        dialogRef.enableButtons(false);
                        dialogRef.setClosable(false);
                        
                        if(parseInt(idRepository)){
                            if(_buildInterface(enterpriseKey,idRepository, repositoryName))
                                dialogRef.close();
                            else{
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
                                
                $(enterprises).find('Enterprise').each(function (){
                    var idEnterprise = $(this).find('IdEmpresa').text();
                    var enterpriseKey = $(this).find('ClaveEmpresa').text();
                    var enterpriseName = $(this).find('NombreEmpresa').text();
                    
                    var option = $('<option>', {"enterpriseKey": enterpriseKey, "idEnterprise":idEnterprise}).append("("+enterpriseKey+") "+enterpriseName.slice(0, 40));;
                    enterpriseForm.append(option);
                });
                
                enterpriseForm.change(function(){
                    var idEnterprise = $(this).find('option:selected').attr("identerprise");
                    var enterpriseKey = $(this).find('option:selected').attr("enterprisekey");
                    
                    if(!parseInt(idEnterprise) > 0){
                        repositoryForm.empty();
                        return repositoryForm.append('<option>Esperando Empresa</option>')
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
                
                _buildInterface("DANIEL",5, "Documentos");
            }
        });
    };
    
    /**
     * @description Construye la interfaz príncipal del diseñador de plantillas.
     * @returns {undefined}
     */
    var _buildInterface = function(enterpriseKey,idRepository, repositoryName){
        var status = 1;
        var content = $('<div>', {});
        var header = $('<div>', {class: "row"});
        var dependenceData = $('<div>', {class: "col-xs-6 col-md-6"}).css({"font-size": "2vw"}).append('Datos de dependencia.');
        var logoThumbnail = $('<div>', {class: "col-xs-3 col-md-3"}).append('<a href = "#" class = "thumbnail"><i class="fa fa-picture-o fa-5x icon-border" style = "font-size: 10vw;"></i></a>');     
        var qrThumbnail = $('<div>', {class: 'col-xs-3 col-md-3'}).append('<a href = "#" class = "thumbnail"><i class="fa fa-qrcode fa-5x icon-border" style = "font-size: 12vw;"></i></a>');;
        
        header.append(logoThumbnail);
        header.append(dependenceData);
        header.append(qrThumbnail);
        
        content.append(header);
        
        var formsDiv = $('<div>', {class: "form-horizontal"});
        var formHorizontalDiv = $('<div>', {class: 'form-group'});
//        formsDiv.append(formHorizontalDiv);
        content.append(formsDiv);

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
                                <input type = "text" id = "bottomPanelFieldTypeSelect" class="form-control" disabled>\n\
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
                    action: function(dialogRef){
                        
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
                
                bottomPanelSelectWidth.append('<option width = "1">1</option>\n\
                                                <option width = "2">2</option>\n\
                                                <option width = "3">3</option>\n\
                                                <option width = "4">4</option>\n\\n\
                                                <option width = "5">5</option>\n\
                                                <option width = "6">6</option>');
                
                var forms = GeStructure(repositoryName);
                $(forms).find("Campo").each(function(){               
                    var fieldName = $(this).find("name").text();
                    var fieldType = $(this).find("type").text();
                    var fieldLength = $(this).find("long").text();
                    var required = $(this).find("required").text();
                    
                    var option = $('<option>', {fieldName: fieldName, fieldType:fieldType, fieldLength:fieldLength}).append(fieldName);
                    
                    bottomPanelFieldSelect.append(option);
               });
               
               /* Otras opciones de campo */
               
               bottomPanelFieldSelect.append($('<option>', {fieldName: "CSDocs_textType", fieldType: "text"}).append("Ingresar Texto"));
               
               buttonPanelSelectButtonAdd.click(function(){
                   _addForm(formsDiv, bottomPanelSelectWidth, bottomPanelFieldSelect);
                   
               });
            }
        });
        
        return status;
    };    
    
    var _getColumnsClass = function(width){
        var colXs = "col-xs-"+width;
        var colSm = "col-sm-"+width;
        var colMd = "col-md-"+width;
        var colString = colXs+" "+colSm+" "+colMd;
        
        return colString;
    };
    
    /**
     * @description Ingresa un nuevo formulario en la interfaz de diseño.
     * @param {object} templateContent Objeto que envuelve el contenido de la interfaz del diseñador de plantillas.
     * @returns {undefined}
     */
    var _addForm = function(templateContent, widthSelect, fieldsSelect){
        var width = widthSelect.find('option:selected').attr('width');
        var fieldName = fieldsSelect.find('option:selected').attr('fieldname');
        
        if(fieldName === undefined)
            return Advertencia("Seleccione un campo válido");
        
        if(!parseInt(width) > 0)
            return Advertencia("La longitud no es válida");
                
        if(fieldName === 'CSDocs_textType')
           return  _addTextType(templateContent, widthSelect);
             
         _addInlineForm(templateContent, widthSelect, fieldsSelect);
                
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
    
    var _addInlineForm = function(templateContent, widthSelect, fieldsSelect){
        var fieldName = fieldsSelect.find('option:selected').attr('fieldname');
        var width = widthSelect.find('option:selected').attr('width');
        width = parseInt(width) * 2;

        var labelWidth = 2;
        
        if(width <= 0)
            width = 1;
        
        var labelColString = 'col-xs-'+labelWidth+' col-sm-'+labelWidth+' col-md-'+labelWidth;
        
        var colXs = "col-xs-"+width;
        var colSm = "col-sm-"+width;
        var colMd = "col-md-"+width;
        var colString = colXs+" "+colSm+" "+colMd;
        
        var inline = '  <div class = "form-group '+colString+'"\n\
                            <label for="templateForm_'+fieldName+'" class = "control-label col-md-3">' + fieldName + '</label>\n\
                            <div class = "col-md-9">\n\
                                <input type="text" class="form-control" id="templateForm_'+fieldName+'">\n\
                            </div>\n\
                        </div>\n\
                    ';
           
        $(templateContent).append(inline);
        
        fieldsSelect.find('option:selected').remove();
    };
    
    
    
    var _addTextType = function(templateContent, width){
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
                    action: function(dialogRef){
                        var colString = _getColumnsClass(width);
                        
                        
                        var wrapper = $('<div>', {class: "wrapper "+colString});

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
    
    var _saveTemplate = function(){
        
    };
    
    /**
     * @description Genera la cadena XML para almacenar la plantilla.
     * @returns {undefined}
     */
    var _createXmlForSaving = function(){
        
    };
};

