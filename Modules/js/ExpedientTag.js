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
        
        if(!(parseInt(activeNode.data.isFrontPage) === 1 || parseInt(activeNode.data.isLegajo) === 1))
            return Advertencia("Debe seleccionar un expediente o un legajo.");
        
        idRepository = getIdRepository();
        repositoryName = getRepositoryName();
        enterpriseKey = getEnterpriseKey();
        openUserInterface(activeNode);       
    };        
    
    var openUserInterface = function(activeNode){
        var content = $('<div>', {class: "row", style: "max-height: calc(100vh - 200px); overflow-y: auto;"});
        BootstrapDialog.show({
            title: '<i class="fa fa-tag fa-lg"></i> Generando etiqueta',
            size: BootstrapDialog.SIZE_WIDE,
            type: BootstrapDialog.TYPE_PRIMARY,
            message: content,
            closable: true,
            closeByBackdrop: false,
            closeByKeyboard: true,
            buttons: [
                {
                    icon: 'fa fa-print fa-lg',
                    label: 'Imprimir',
                    cssClass: "btn-primary",
                    hotkey: 13,
                    action: function (dialogRef) {
                        var button = this;
                        dialogRef.enableButtons(false);
                        dialogRef.setClosable(false);
                        $(content).printArea();
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
               var frontPageData = getFrontPageData(activeNode);
               var tagTemplate = generateTagTemplate(activeNode);
               content.append(tagTemplate);
               console.log(frontPageData);
               setTemplateDataToExpedientTag(frontPageData, activeNode);
            }
        });
    };
    
    /**
     * @description Genera la plantilla para la etiqueta.
     * @param {object} activeNode Expediente o legajo seleccionado
     * @returns {Object}
     */
    var generateTagTemplate = function(activeNode){
        var content = $('<div>', {style: "width: 521px; height: 408px; background-color: #ddff2; margin: 0px auto;"});
        var header = $('<div>', {class: "expedientTagHeader"});
        var bodyForm = $('<form>', {class: "form-horizontal"});
        var body = $('<div>');
        var footer = $('<div>');
        
        var companyLogo = getCompanyLogo();
        var companyData = getCompanyData();
        header.append(companyLogo)
                .append(companyData);
        
        var fields = getExpedientTagFields();
        
        for (var i = 0; i < fields.length; i++) {
                    var obj = fields[i];
                    for (var key in obj) {
                        var tagType = obj.field.tagType;
                        var fieldTag = obj.field.label;
                        var fieldName = String(obj.field.fieldName);
                            
                        if(String(tagType) === "text")
                            bodyForm.append("<div col-md-12><p>" + fieldTag + "</p></div>");
                        else{
                            var form = getInlineForm(obj.field);                            
                            bodyForm.append(form.formGroup); 
                            if(fieldName === 'Total_Legajos'){
//                                $(form).removeClass().addClass('form-group col-md-6');
                                setLegajosTotal(form.form, activeNode);
                            }
                        }
                    }
                }
        body.append(bodyForm);
        content.append(header)
                .append(body)
                .append(footer);
        
        return content;
    };
    
    var getCompanyLogo = function(){
        var content = $('<div class = "col-md-12">').append('<img src = "../../img/Logos/Conocer.png" width = "100%" height = "50px">');
        
        return content;
    };
    
    var getCompanyData = function(){
        return "<center><p>CONSEJO NACIONAL DE NORMALIZACIÓN Y CERTIFICACIÓN DE COMPETENCIAS LABORALES ARCHIVO DE TRAMITE</p></center>";
    };
    
    var getExpedientTagFields = function(){
        return [
            {field:{fieldName: "Seccion", label: "Seccion", columnSize: 12, labelSize: 3, formSize: 9}},
            {field: {fieldName: "Serie", label:"Serie", columnSize: 12, labelSize: 3, formSize: 9}},
            {field: {fieldName: "Numero_Expediente", label:"NUMERO DE EXPEDIENTE", columnSize: 12, labelSize: 4, formSize: 8}},
            {field: {fieldName: "Fecha_Apertura", label: "FECHA DE APERTURA", columnSize: 12, labelSize: 5, formSize: 7}},
            {field: {fieldName: "Fecha_Cierre", label: "FECHA DE CIERRE", columnSize: 12, labelSize: 5, formSize: 7}},
            {field: {fieldName: "Descripcion", label: "DESCRIPCION", columnSize: 12, labelSize: 3, formSize: 9}},
            {field: {fieldName: "Total_Legajos", label: "LEGAJOS", columnSize: 12, labelSize: 3, formSize: 5}},
            {field: {fieldName: "Archivo_Tramite", label: "VIGENCIA DOCUMENTAL ARCHIVO TRAMITE", columnSize: 12, labelSize: 10, formSize: 2}},
            {field: {fieldName: "Archivo_Concentracion", label: "VIGENCIA DOCUMENTAL ARCHIVO CONCENTRACION", columnSize: 12, labelSize: 10, formSize: 2}},
            {field: {fieldName: "Fundamento_Legal", label: "FUNDAMENTO LEGAL", columnSize: 12, labelSize: 3, formSize: 9}},
            {field: {fieldName: "Fecha_Reserva", label: "FECHAS DE RESERVA", columnSize: 6, labelSize: 4, formSize: 5}},
            {field: {fieldName: "Anos_Reserva", label: "AÑOS DE RESERVA", columnSize: 6, labelSize: 6, formSize: 6}},
            {field: {fieldName: "Funcionario_Reserva", label: "FUNCIONARIO DE RESERVA", columnSize: 12, labelSize: 5, formSize: 7}},
            {field: {label: "NOMBRE Y FIRMA DEL FUNCIONARIO DE RESERVA", tagType: "text", columnSize: 12}}
        ];
    };
    
    var getInlineForm = function(field){
        console.log(field);
        var form = $('<input>', {
                    type: "text", 
                    class: "form-control input-sm",
                    id: "expedientTag_"+field.fieldName
                });
        var formGroup = $('<div>', {class: "form-group col-md-"+field.columnSize})
                                .append($('<label>', {for: "expedientTag_"+field.fieldName,
                                                      class: "control-label col-md-"+field.labelSize
                                                      }).append(field.label))
                                .append($('<div>', {class: "expedientTag col-md-"+field.formSize
                                                    }).append(form));
        return {formGroup: formGroup, form: form};
    };
    
    var getFrontPageData = function(activeNode){
        var parentFrontPage = getParentFrontPage(activeNode);
        var frontPage = expedient.frontPage.getFrontPageData(enterpriseKey, repositoryName, parentFrontPage.getKeyPath(), parentFrontPage.data.templateName + ".xml");
        return frontPage;
    };    
    
    var getParentFrontPage = function (activeNode) {
        return expedient.frontPage.getParentFrontPage(activeNode);
    };
    
    /**
     * @description Ingresa la informacin a la etiqueta generada.
     * @param {Object} activeNode Expediente o Legajo seleccionado.
     * @param {type} templateData
     * @returns {undefined}
     */
    var setTemplateDataToExpedientTag = function(templateData, activeNode){
        $(templateData).find('field').each(function () {
                var fieldValue = $.trim($(this).find('fieldValue').text());
                var fieldName = String($.trim($(this).find('fieldName').text()));
                var idField = "#expedientTag_" + fieldName;
                
                if(fieldName === 'Fundamento_Legal')
                    fieldValue = fieldValue.slice(0, 80);
                    
                if ($(idField).length > 0)
                    $(idField).val(fieldValue);
                else
                    console.log("No se encontro el formulario " + idField);
            });
    };
    
    var setLegajosTotal = function(form, activeNode){
        var legajosData  = getLegajosTotal(activeNode);
        var legajoNumber = legajosData.number;
        var legajosTotal = legajosData.total;
        
        if(legajoNumber === undefined)
            legajoNumber = 0;
        
        if(legajosTotal === undefined)
            legajosTotal = 0;
        
        console.log("Legajos Total ");
        console.log(legajosData);
        
        $(form).val(legajoNumber + "  de " + legajosTotal);
    };
    
    /**
     * @description Retorna la cantidad de legajos
     * @param {type} activeNode
     * @returns {undefined}
     */
    var getLegajosTotal = function(activeNode){
        if(parseInt(activeNode.data.isFrontPage) === 1)
            return getTotalLegajosOfFrontPage(activeNode, null);

        var frontPageNode = getFrontPageNode(activeNode);
        return getTotalLegajosOfFrontPage(frontPageNode, activeNode);
    };
    
    var getFrontPageNode = function(activeNode){
        return expedient.frontPage.getFrontPageNode(activeNode);
    };
    
    /**
     * @description Obtiene el total de legajos de un expediente seleccionado.
     * @param {object} frontPageNode Expediente que sera analizado
     * @param {object} activeNode Legajo que esta activo (Si esta activo un expediente este es null)
     * @returns {ExpedientTag.getTotalLegajosOfFrontPage.ExpedientTagAnonym$26|ExpedientTag.getTotalLegajosOfFrontPage.ExpedientTagAnonym$27}
     */
    var getTotalLegajosOfFrontPage = function(frontPageNode, activeNode){
        console.log("getTotalLegajosOfFrontPage");
        console.log(frontPageNode);
        var children = frontPageNode.getChildren();
        if(children !== null){
            var number = 1;
            for(var cont = 0; cont < children.length; cont++){
                var child = children[cont];
                if(child !== null){             
                    if(activeNode !== null){
                        if(parseInt(activeNode.data.key) === parseInt(child.data.key))
                            number = cont + 1;
                    }
                    if(child.getChildren() !== null)
                        children = children.concat(child.getChildren());
                }
            }     
            
            if(activeNode === null)
                number = children.length;
            
            return {number: number, total: children.length};
        }
        
        return {number: 0, total: 0};
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
