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
            }
        });
    };
    
    /**
     * @description Construye la interfaz príncipal del diseñador de plantillas.
     * @returns {undefined}
     */
    var _buildInterface = function(enterpriseKey,idRepository, repositoryName){
        var status = 1;
        var content = $('<div>', {class: 'row'});
        var header = $('<div>');
        var dependenceData = $('<div>', {class: "col-xs-6 col-md-6"}).css({"font-size": "2vw"}).append('Datos de dependencia.');
        var logoThumbnail = $('<div>', {class: "col-xs-3 col-md-3"}).append('<a href = "#" class = "thumbnail"><i class="fa fa-picture-o fa-5x icon-border" style = "font-size: 10vw;"></i></a>');     
        var qrThumbnail = $('<div>', {class: 'col-xs-3 col-md-3'}).append('<a href = "#" class = "thumbnail"><i class="fa fa-qrcode fa-5x icon-border" style = "font-size: 12vw;"></i></a>');;
        
        header.append(logoThumbnail);
        header.append(dependenceData);
        header.append(qrThumbnail);
        
        content.append(header);
        
        var bottomPanelDiv = $('<div>', {class: "col-xs-12 col-md-12"});
        var bottomPanel = $('<div>', {class: "panel panel-info"});/* Panel inferior con los campos a ir agregando */
        var bottomPanelHeading = $('<div>', {class: "panel-heading"}).append('Seleccione el campo a insertar');
        var bottomPanelBody = $('<div>', {class: "panel-body"});
        
        bottomPanelBody.append('\
                <form class="form-horizontal">\n\
                    <div class="form-group">\n\
                      <label for="inputEmail3" class="col-xs-2 col-sm-2 control-label">Cuadrícula</label>\n\
                      <div class="col-xs-7 col-sm-4">\n\
                        <select id = "bottomPanelSelectWidth" class = "form-control">\n\
                            <option width = "1">1</option>\n\
                            <option width = "2">2</option>\n\
                            <option width = "3">3</option>\n\
                            <option width = "4">4</option>\n\
                        </select>\n\
                      </div>\n\
                    </div>\n\
                    <div class="form-group">\n\
                        <div class="col-sm-offset-2 col-xs-9 col-sm-6">\n\
                            <div class="checkbox">\n\
                                <label>\n\
                                  <input type="checkbox"> Horizontal \n\
                                </label>\n\
                            </div>\n\
                        </div>\n\
                    </div>\n\
                    <div class="form-group">\n\
                      <label for="bottomPanelFieldSelect" class="col-xs-2 col-sm-2 control-label">Cuadrícula</label>\n\
                        <div class="col-xs-7 col-lg-4">\n\
                            <select id = "bottomPanelFieldSelect" class="form-control"><option selected>Seleccione un Campo</option></select>\n\
                        </div>\n\
                    </div>\n\
                    <div class="form-group">\n\
                        <div class="col-sm-offset-2 col-xs-9 col-sm-6">\n\
                          <button id = "buttonPanelSelectButtonAdd" class="btn btn-primary">Agregar</button>\n\
                        </div>\n\
                    </div>\n\
                </form>');
        
        bottomPanel.append(bottomPanelHeading)
                .append(bottomPanelBody);
        
        bottomPanelDiv.append(bottomPanel);
        
        content.append(bottomPanelDiv);
        
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
                
                bottomPanelSelectWidth.append('<option width = "2">2</option>\n\
                                                <option width = "4">4</option>\n\
                                                <option width = "4">4</option>\n\
                                                <option width = "4">4</option>');
                
                var forms = GeStructure(repositoryName);
                $(forms).find("Campo").each(function(){               
                    var fieldName = $(this).find("name").text();
                    var fieldType = $(this).find("type").text();
                    var fieldLength = $(this).find("long").text();
                    var required = $(this).find("required").text();
                    
                    var option = $('<option>', {fieldName: fieldName, fieldType:fieldType, fieldLength:fieldLength}).append(fieldName);
                    
                    bottomPanelFieldSelect.append(option);
               });
               
               buttonPanelSelectButtonAdd.click(function(){
                   _addForm(content, bottomPanelSelectWidth, bottomPanelFieldSelect);
               });
            }
        });
        
        return status;
    };    
    
    /**
     * @description Ingresa un nuevo formulario en la interfaz de diseño.
     * @param {object} templateContent Objeto que envuelve el contenido de la interfaz del diseñador de plantillas.
     * @returns {undefined}
     */
    var _addForm = function(templateContent, bottomPanelSelectWidth, bottomPanelSelect){
        alert(
                bottomPanelSelectWidth.find('option:selected').attr('width') + ", " +
                bottomPanelSelect.find('option:selected').attr('fieldname') + ", "
                );
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

