/* 
 * Copyright 2016 daniel.
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

/**
 * @description Objeto qeu se encarga del control de las etiquetas de expedientes.
 * La etiqueta se genera a partir de la informacion contenida en la plantilla generada o Front Page Xml
 * @returns {undefined}
 */
var ExpedientTag = function(){
    var self = this;
    var idRepository = 0;
    var repositoryName = null;
    var enterpriseKey = null;
    var expedient = new ExpedientClass();
    this.buildLink = function(){
        $('.expedientModuleLink .dropdown-menu').append('\
                <li class = "expedientTag"><a href="#"><i class="fa fa-tag fa-lg"></i> Etiqueta </span> </a></li>\n\
            ');

        $('.expedientTag').on('click', self.generateTag);
    };
    
    this.generateTag = function(){
        if ($('#contentTree').is(':empty'))
            return Advertencia("Debe seleccionar un expediente");

        var activeNode = $('#contentTree').dynatree('getTree').getActiveNode();

        if (typeof activeNode !== 'object')
            return Advertencia("Debe seleccionar un directorio");
        
        if(!(parseInt(activeNode.data.isFrontPage) === 1) || parseInt(activeNode.data.isLegajo) === 1)
            return Advertencia("Debe seleccionar un expediente o un legajo.");
        
        idRepository = getIdRepository();
        repositoryName = getRepositoryName();
        enterpriseKey = getEnterpriseKey();
        openUserInterface(activeNode);       
    };        
    
    var openUserInterface = function(activeNode){
        var content = $('<div>');
        BootstrapDialog.show({
            title: '<i class="fa fa-tag fa-lg"></i> Generando etiqueta',
            size: BootstrapDialog.SIZE_WIDE,
            type: BootstrapDialog.TYPE_PRIMARY,
            message: content,
            closable: true,
            closeByBackdrop: true,
            closeByKeyboard: true,
            buttons: [
                {
                    icon: 'fa fa-plus-circle fa-lg',
                    label: 'Agregar',
                    cssClass: "btn-primary",
                    hotkey: 13,
                    action: function (dialogRef) {
                        var button = this;
                        dialogRef.enableButtons(false);
                        dialogRef.setClosable(false);
                        /*if ()
                            dialogRef.close();
                        else {
                            dialogRef.setClosable(true);
                            dialogRef.enableButtons(true);
                            
                        }*/
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
               var frontPage = getFrontPageData(activeNode);
               var tagTemplate = generateTagTemplate();
               content.append(tagTemplate);
               console.log(frontPage);
            }
        });
    };
    
    /**
     * @description Genera la plantilla para la etiqueta.
     * @returns {Object}
     */
    var generateTagTemplate = function(){
        var content = $('<div>', {style: "width: 521px; height: 408px; background-color: red;"});
        
        return content;
    };
    
    var getFrontPageData = function(activeNode){
        var parentFrontPage = getParentFrontPage(activeNode);
        var frontPage = expedient.frontPage.getFrontPageData(enterpriseKey, repositoryName, parentFrontPage.getKeyPath(), parentFrontPage.data.templateName + ".xml");
        return frontPage;
    };    
    
    var getParentFrontPage = function (activeNode) {
        return expedient.frontPage.getParentFrontPage(activeNode);
    };
    
    var getIdRepository = function(){        
        return $('#CM_select_repositorios option:selected').attr('idrepository');
    };
    
    var getRepositoryName = function(){
        return $('#CM_select_repositorios option:selected').attr('repositoryname');
    };
    
    var getEnterpriseKey = function(){
        return  $('#CM_select_empresas option:selected').attr('value');
    };
      
};
