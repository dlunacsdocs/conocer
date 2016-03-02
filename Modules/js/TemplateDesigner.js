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
            _buildInterface();
        });
    };
    
    /**
     * @description Construye la interfaz príncipal del diseñador de plantillas.
     * @returns {undefined}
     */
    var _buildInterface = function(){
        var content = $('<div>', {class: 'row'});
        var header = $('<div>');
        var dependenceData = $('<div>', {class: "col-xs-6 col-md-6"}).css({"font-size": "2vw"}).append('Datos de dependencia.');
        var logoThumbnail = $('<div>', {class: "col-xs-3 col-md-3"}).append('<a href = "#" class = "thumbnail"><i class="fa fa-picture-o fa-5x icon-border" style = "font-size: 10vw;"></i></a>');     
        var qrThumbnail = $('<div>', {class: 'col-xs-3 col-md-3'}).append('<a href = "#" class = "thumbnail"><i class="fa fa-qrcode fa-5x icon-border" style = "font-size: 12vw;"></i></a>');;
        
        header.append(logoThumbnail);
        header.append(dependenceData);
        header.append(qrThumbnail);
        
        content.append(header);
        
        BootstrapDialog.show({
            title: '<i class="fa fa-cog fa-lg"></i> Diseñador de Plantillas',
            message: content,
            closable: true,
            closeByBackdrop: false,
            closeByKeyboard: true,
            size: BootstrapDialog.SIZE_WIDE,
            type: BootstrapDialog.TYPE_PRIMARY,
            buttons: [
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
    
};

