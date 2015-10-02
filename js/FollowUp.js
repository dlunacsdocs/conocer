
var TableFollowUpdT;
var TableFollowUpDT;

var FlagAceptarSolicitud = 0;

$(document).ready(function()
{            
   $('.link_FollowUp').click(function(){FollowUp.ShowFollowUp();}) ;
});

var ClassFollowUp = function()
{
    this.ShowFollowUp = function()
    {
        $('.DivFollowUp').remove();
        $('body').append('<div class = "DivFollowUp" style = "display:none"><div class = "titulo_ventana">Seguimiento</div></div>');               
        $('.DivFollowUp').append('<div class = "TreeSpace"><div id = "TreeFollowUp"></div></div> <div id = "WSTreeFollowUp" class = "WorkSpaceWithTree"></div>');
        
        $('#TreeFollowUp').append('<ul><li id = "FU_00" data = "icon: \'Repositorio.png\'" class = "folder"> Mesa Control <ul id = "FU_0"></ul></ul>');        
        $('#FU_0').append('<li id="MSR_1" class="folder" data="icon: \'Repositorio.png\'">Solicitudes<ul id="1_MSR"></ul>');             
        $('#1_MSR').append('<li id="MSR_2" class="folder" data="icon: \'Repositorio.png\'">Por Abrobar<ul id="2_MSR"></ul>');
        $('#1_MSR').append('<li id="MSR_3" class="folder" data="icon: \'Repositorio.png\'">Aprobabas<ul id="3_MSR"></ul>');
                 
        $('#TreeFollowUp').dynatree({generateIds: false, expand: true, minExpandLevel: 3,
            onFocus: function(node, event)
            {
                _ShowTableFollowUp(node.data.key);     
            }
        });        
        
        $('.DivFollowUp').dialog({title:"Administración de Seguimiento", width: (($(window).width())-30), height:500, minWidth:600, minHeight:500}).dialogExtend(BotonesWindow);
                       
    };
    
    _ShowTableFollowUp = function(IdTreeMenu)
    {
        $('#WSTreeFollowUp').empty();
        $('#WSTreeFollowUp').append('<table id = "TableFollowUp"><thead><tr><th>No Solicitud</th><th>Titular</th><th>Dictaminado</th><th>Estado</th><th>Fecha Vencimineto</th><th>Tipo</th><th>Semáforo</th><th></th></tr></thead><tbody></tbody></table>');
        
        TableFollowUpdT = $('#TableFollowUp').dataTable(OptionDataTable);  
        TableFollowUpDT = new $.fn.dataTable.Api('#TableFollowUp');

        switch (IdTreeMenu)
        {
            case "MSR_2":
                if(FlagAceptarSolicitud !== 1)
                {
                    var data1 = ['<input type = "button" id = "Solicitud100" class = "FUButtons" value = "100">', "Marco", "Eduardo", "En espera de revisión Documental", "14", "Créditos Empresariales", '<img src = "img/GreenCircle.png" width = "20px" height = "20px">','<input type = "checkbox" value = "1" class = "FUCheckPendingApproval">'];        
                    var ai = TableFollowUpDT.row.add(data1).draw();
                    var n = TableFollowUpdT.fnSettings().aoData[ ai[0] ].nTr;
                    n.setAttribute('id',"1");
                }
                

                var data2 = ['<input type = "button" id = "Solicitud99" class = "FUButtons" value = "99">', "Marco", "Eduardo", "En espera de revisión Documental", "12", "Operaciones Pasivas", '<img src = "img/GreenCircle.png" width = "20px" height = "20px">','<input type = "checkbox" value = "2" class = "FUCheckPendingApproval">'];        
                ai = TableFollowUpDT.row.add(data2).draw();
                n = TableFollowUpdT.fnSettings().aoData[ ai[0] ].nTr;
                n.setAttribute('id',"2");

                var data3 = ['<input type = "button" id = "Solicitud98" class = "FUButtons" value = "98">', "Marco", "Eduardo", "En espera de revisión Documental", "10", "Operaciones Pasivas", '<img src = "img/GreenCircle.png" width = "20px" height = "20px">','<input type = "checkbox" value = "3" class = "FUCheckPendingApproval">'];        
                ai = TableFollowUpDT.row.add(data3).draw();
                n = TableFollowUpdT.fnSettings().aoData[ ai[0] ].nTr;
                n.setAttribute('id',"3");
        
        $('#TableFollowUp tbody').on( 'click', 'tr', function ()
        {
            TableFollowUpDT.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
            var IdUser=$('#TableFollowUp tr.selected').attr('id');    
        } );    
        
        
        $('.FUButtons').button();
        
        $('#Solicitud100').click(function(){_MonitoringInformation100();});
        $('#Solicitud99').click(function(){_MonitoringInformation99();});
        $('#Solicitud98').click(function(){_MonitoringInformation98();});
        
        $('.FUCheckPendingApproval').change(function(){ if(this.checked)Turnar(this.value); });
        
            break;
                
            case "MSR_3":
                
                var data1 = ["97", "Marco", "Eduardo", "Dictamen Aprovado", "0", "Créditos Empresariales", '<img src = "img/GreenCircle.png" width = "20px" height = "20px">','<input type = "checkbox" value = "1" class = "FUCheckApproval">'];        
                var ai = TableFollowUpDT.row.add(data1).draw();
                var n = TableFollowUpdT.fnSettings().aoData[ ai[0] ].nTr;
                
                if(FlagAceptarSolicitud === 1)
                {
                    data1 = ["100", "Marco", "Eduardo", "Dictamen Aprovado", "0", "Créditos Empresariales", '<img src = "img/GreenCircle.png" width = "20px" height = "20px">','<input type = "checkbox" value = "1" class = "FUCheckApproval">'];        
                    ai = TableFollowUpDT.row.add(data1).draw();
                    n = TableFollowUpdT.fnSettings().aoData[ ai[0] ].nTr;
                }
                
        //        n.setAttribute('id',IdGrupo);
                break;
        }                
    };
    
    var _MonitoringInformation100 = function()
    {
        //../Estructuras/AUTOFIN/Creditos_Empresariales/1/2/Solicitud de credito.pdf
        var RutaArchivo = "../Estructuras/AUTOFIN/Creditos_Empresariales/1/2/3/5/Solicitud de credito.pdf";
        var TipoArchivo = "pdf";                
        
        $('.DivMonitoringInformation').remove();
        $('body').append('<div class = "DivMonitoringInformation" style = "display:none"><div class = "titulo_ventana">Detalle del Folio <b>100</b></div></div>');               
        
        if(EnvironmentData.NombreUsuario === 'eduardo')
        {
            $('.DivMonitoringInformation').append('<input type = "button" id = "EduardoAceptar100" value = "Aceptar Solicitud" class = "FUAgreeTurno">');
            $('.DivMonitoringInformation').append('<input type = "button" id = "EduardoAceptar100" = "100" value = "Rechazar Solicitud" class = "FUDeniedTurno"><br><br>');
            $('.FUAgreeTurno').button(); $('.FUDeniedTurno').button();
            
            
            $('#EduardoAceptar100').click(function()
            {

                FlagAceptarSolicitud = 1;
                TableFollowUpDT.row('tr.selected').remove().draw( false );
            });
            
            
        }
        
        $('.DivMonitoringInformation').append('<table class = "TableMI TableStandart"></table>');                        
        $('.TableMI').append('<tr><td>Fecha de Solicitud</td><td><input type = "text" class = "FormStandart"  value = "20 - feb - 2015"></td></tr>');
        $('.TableMI').append('<tr><td>Tipo</td><td><input type = "text" class = "FormStandart" value = "Créditos Empresariales"></td></tr>');
        $('.TableMI').append('<tr><td>Sucursal</td><td><input type = "text" class = "FormStandart" value = "Única DF"></td></tr>');
        $('.TableMI').append('<tr><td>Dictamen</td><td><input type = "text" class = "FormStandart" value = "En revisión"></td></tr>');
        $('.TableMI').append('<tr><td></td><td><select><option>Análisis de Crédito</option><option>Investigación Buró de Crédito</option><option>Inv. de Garantías</option><option>Fallo</option></select></td></tr>');
        $('.TableMI').append('<tr><td>Aprobado</td><td><input type = "text" class = "FormStandart" value = "Sin/No"></td></tr>');
        $('.TableMI').append('<tr><td>No_Cliente</td><td><input type = "text" class = "FormStandart" value = "1005"></td></tr>');
        $('.TableMI').append('<tr><td>No_Credito</td><td><input type = "text" class = "FormStandart" value = "0899877-001-2015"></td></tr>');
        $('.TableMI').append('<tr><td>Nombre</td><td><input type = "text" class = "FormStandart" value = "CONSTRUCOCONA S.A. DE C.V"></td></tr>');
        $('.TableMI').append('<tr><td>RFC</td><td><input type = "text" class = "FormStandart" value = "CON9905055T0"></td></tr>');
        $('.TableMI').append('<tr><td>-</td><td></td></tr>');
        $('.TableMI').append('<tr><td colspan = "2" style = "text-align:center"><b>Documentos</b></td></tr>');
        $('.TableMI').append('<tr><td><a href = "#" onclick = "VistaPrevia(\''+RutaArchivo+'\',\''+TipoArchivo+'\')">1. Solicitud</a></td><td></td></tr>');
        $('.TableMI').append('<tr><td><a href = "#">1.1 Acta de Hacienda (Cédula de identificación Fiscal)</a></td><td></td></tr>');
        $('.TableMI').append('<tr><td><a href = "#">1.2 Acta Constitutiva</a></td><td></td></tr>');
        $('.TableMI').append('<tr><td><a href = "#">1.3 Poder Legal</a></td><td></td></tr>');
        $('.TableMI').append('<tr><td><a href = "#">1.3.1 Identificación de Representante Legal</a></td><td></td></tr>');
        $('.TableMI').append('<tr><td><a href = "#">1.3.2 Copia de Identificación del Aval</a></td><td></td></tr>');
        $('.TableMI').append('<tr><td><a href = "#">1.3.2.1 Copia del Comprobante de Domicilio del Aval</a></td><td></td></tr>');
        $('.TableMI').append('<tr><td><a href = "#">1.3.2.2 Copia de la Declaración Patrimonial del Aval</a></td><td></td></tr>');
        $('.TableMI').append('<tr><td><a href = "#">1.3.3 Comprobante de Domicilio Representante Legal</a></td><td></td></tr>');
        $('.TableMI').append('<tr><td><a href = "#">1.4 Comprobante de Domicilio Fiscal</a></td><td></td></tr>');
        
        
        $('.DivMonitoringInformation').dialog({title:"Información del Dictamen", width:600, height:(($(window).height())-40), minWidth:500, minHeight:400, modal:true, buttons:{"Cerrar":{text:"Cerrar", click:function(){$(this).dialog('close');}}}});
    };
    
    var _MonitoringInformation99 = function()
    {
        var RutaArchivo = "../Estructuras/AUTOFIN/Creditos_Empresariales/1/2/3/5/Solicitud de credito.pdf";
        var TipoArchivo = "pdf";
        
        $('.DivMonitoringInformation').remove();
        $('body').append('<div class = "DivMonitoringInformation" style = "display:none"><div class = "titulo_ventana">Detalle del Folio <b>99</b></div></div>');               
        if(EnvironmentData.NombreUsuario === 'eduardo')
        {
            $('.DivMonitoringInformation').append('<input type = "button" id = "EduardoAceptar99" value = "Aceptar Solicitud" class = "FUAgreeTurno">');
            $('.DivMonitoringInformation').append('<input type = "button" id = "EduardoAceptar99" value = "Rechazar Solicitud" class = "FUDeniedTurno"><br><br>');
            $('.FUAgreeTurno').button(); $('.FUDeniedTurno').button();
            
            $('#EduardoAceptar99').click(function(){TableFollowUpDT.row('tr.selected').remove().draw( false );});
        }
        $('.DivMonitoringInformation').append('<table class = "TableMI TableStandart"></table>');
        $('.TableMI').append('<tr><td>Fecha de Solicitud</td><td><input type = "text" class = "FormStandart" value = "14 - feb - 2015"></td></tr>');
        $('.TableMI').append('<tr><td>Tipo</td><td><input type = "text" class = "FormStandart" value = "Operaciones Pasivas"></td></tr>');
        $('.TableMI').append('<tr><td>Sucursal</td><td><input type = "text" class = "FormStandart" value = "Única DF"></td></tr>');
        $('.TableMI').append('<tr><td>Dictamen</td><td><input type = "text" class = "FormStandart" value = "En revisión"></td></tr>');
        $('.TableMI').append('<tr><td></td><td><select><option>Análisis de Crédito</option><option>Investigación Buró de Crédito</option><option>Inv. de Garantías</option><option>Fallo</option></select></td></tr>');
        $('.TableMI').append('<tr><td>-</td><td></td></tr>');
        $('.TableMI').append('<tr><td>Aprobado</td><td><input type = "text" class = "FormStandart" value = "Sin/No"></td></tr>');
        $('.TableMI').append('<tr><td>No_Cliente</td><td><input type = "text" class = "FormStandart" value = "700"></td></tr>');
        $('.TableMI').append('<tr><td>No_Credito</td><td><input type = "text" class = "FormStandart" value = "89300332-01-2015"></td></tr>');
        $('.TableMI').append('<tr><td>Nombre</td><td><input type = "text" class = "FormStandart" value = "ALBERTO TREJO AREVALO"></td></tr>');
        $('.TableMI').append('<tr><td>RFC</td><td><input type = "text" class = "FormStandart" value = "TEAAS80425HFRRLO5"></td></tr>');
        $('.TableMI').append('<tr><td colspan = "2" style = "text-align:center"><b>Documentos</b></td></tr>');
        $('.TableMI').append('<tr><td><a href = "#" onclick = "VistaPrevia(\''+RutaArchivo+'\',\''+TipoArchivo+'\')">1. Solicitud</a></td><td></td></tr>');
        $('.TableMI').append('<tr><td><a href = "#">1. Solicitud (Cédula de identificación Fiscal)</a></td><td></td></tr>');
        $('.TableMI').append('<tr><td><a href = "#">1.1 Identificación de Oficial</a></td><td></td></tr>');
        $('.TableMI').append('<tr><td><a href = "#">1.2 Copia de Identificación del Aval</a></td><td></td></tr>');
        $('.TableMI').append('<tr><td><a href = "#">1.2 Copia de Identificación del Aval</a></td><td></td></tr>');
        $('.TableMI').append('<tr><td><a href = "#">1.3 Copia del Comprobante de Domicilio del Aval</a></td><td></td></tr>');
        $('.TableMI').append('<tr><td><a href = "#">1.3.1 Copia de la Declaración Patrimonial del Aval</a></td><td></td></tr>');
        $('.TableMI').append('<tr><td><a href = "#">1.4 Comprobante de Domicilio</a></td><td></td></tr>');
        $('.TableMI').append('<tr><td><a href = "#">1.5 Copia de Estados de Cuenta</a></td><td></td></tr>');
        $('.TableMI').append('<tr><td><a href = "#">2. Garantías </a></td><td></td></tr>');
        $('.TableMI').append('<tr><td><a href = "#">3. Autorización para solicitar consulta al buró de crédito</a></td><td></td></tr>');
        $('.TableMI').append('<tr><td><a href = "#">4. Dictamen de crédito</a></td><td></td></tr>');                
        $('.DivMonitoringInformation').dialog({title:"Información del Dictamen", width:600, height:(($(window).height())-40), minWidth:500, minHeight:400, modal:true, buttons:{"Cerrar":{text:"Cerrar", click:function(){$(this).dialog('close');}}}});
    };
    
    var _MonitoringInformation98 = function()
    {
        var RutaArchivo = "../Estructuras/AUTOFIN/Creditos_Empresariales/1/2/3/5/Solicitud de credito.pdf";
        var TipoArchivo = "pdf";
        
        $('.DivMonitoringInformation').remove();
        $('body').append('<div class = "DivMonitoringInformation" style = "display:none"><div class = "titulo_ventana">Detalle del Folio <b>98</b></div></div>');               
        if(EnvironmentData.NombreUsuario === 'eduardo')
        {
            $('.DivMonitoringInformation').append('<input type = "button" id = "EduardoAceptar98" value = "Aceptar Solicitud" class = "FUAgreeTurno">');
            $('.DivMonitoringInformation').append('<input type = "button" id = "EduardoRechazar98" value = "Rechazar Solicitud" class = "FUDeniedTurno"><br><br>');
            $('.FUAgreeTurno').button(); $('.FUDeniedTurno').button();
            
            $('#EduardoAceptar98').click(function(){TableFollowUpDT.row('tr.selected').remove().draw( false );});
            
        }
        $('.DivMonitoringInformation').append('<table class = "TableMI TableStandart"></table>');
        $('.TableMI').append('<tr><td>Fecha de Solicitud</td><td><input type = "text" class = "FormStandart" value = "10 - feb - 2015"></td></tr>');
        $('.TableMI').append('<tr><td>Tipo</td><td><input type = "text" class = "FormStandart" value = "Operaciones Pasivas"></td></tr>');
        $('.TableMI').append('<tr><td>Sucursal</td><td><input type = "text" class = "FormStandart" value = "Única DF"></td></tr>');
        $('.TableMI').append('<tr><td>Dictamen</td><td><input type = "text" class = "FormStandart" value = "En revisión"></td></tr>');
        $('.TableMI').append('<tr><td></td><td><select><option>Análisis de Crédito</option><option>Investigación Buró de Crédito</option><option>Inv. de Garantías</option><option>Fallo</option></select></td></tr>');        
        $('.TableMI').append('<tr><td>Aprobado</td><td><input type = "text" class = "FormStandart" value = "Sin/No"></td></tr>');
        $('.TableMI').append('<tr><td>No_Cliente</td><td><input type = "text" class = "FormStandart" value = "701"></td></tr>');
        $('.TableMI').append('<tr><td>No_Credito</td><td><input type = "text" class = "FormStandart" value = "89300333-01-2015"></td></tr>');
        $('.TableMI').append('<tr><td>Nombre</td><td><input type = "text" class = "FormStandart" value = "ESCOBEDO MARRON FELIX ENRIQUE"></td></tr>');
        $('.TableMI').append('<tr><td>RFC</td><td><input type = "text" class = "FormStandart" value = "ESMF51548FFC"></td></tr>');
        $('.TableMI').append('<tr><td>-</td><td></td></tr>');
        $('.TableMI').append('<tr><td colspan = "2" style = "text-align:center"><b>Documentos</b></td></tr>');
        $('.TableMI').append('<tr><td><a href = "#" onclick = "VistaPrevia(\''+RutaArchivo+'\',\''+TipoArchivo+'\')">1. Solicitud</a></td><td></td></tr>');
        $('.TableMI').append('<tr><td><a href = "#">1. Solicitud (Cédula de identificación Fiscal)</a></td><td></td></tr>');
        $('.TableMI').append('<tr><td><a href = "#">1.1 Identificación de Oficial</a></td><td></td></tr>');
        $('.TableMI').append('<tr><td><a href = "#">1.2 Copia de Identificación del Aval</a></td><td></td></tr>');
        $('.TableMI').append('<tr><td><a href = "#">1.2 Copia de Identificación del Aval</a></td><td></td></tr>');
        $('.TableMI').append('<tr><td><a href = "#">1.3 Copia del Comprobante de Domicilio del Aval</a></td><td></td></tr>');
        $('.TableMI').append('<tr><td><a href = "#">1.3.1 Copia de la Declaración Patrimonial del Aval</a></td><td></td></tr>');
        $('.TableMI').append('<tr><td><a href = "#">1.4 Comprobante de Domicilio</a></td><td></td></tr>');
        $('.TableMI').append('<tr><td><a href = "#">1.5 Copia de Estados de Cuenta</a></td><td></td></tr>');
        $('.TableMI').append('<tr><td><a href = "#">2. Garantías </a></td><td></td></tr>');
        $('.TableMI').append('<tr><td><a href = "#">3. Autorización para solicitar consulta al buró de crédito</a></td><td></td></tr>');
        $('.TableMI').append('<tr><td><a href = "#">4. Dictamen de crédito</a></td><td></td></tr>');                
        $('.DivMonitoringInformation').dialog({title:"Información del Dictamen", width:600, height:(($(window).height())-40), minWidth:500, minHeight:400, modal:true, buttons:{"Cerrar":{text:"Cerrar", click:function(){$(this).dialog('close');}}}});
    };
    
    this.AddDocumentOnDuty = function(IdTr)
    {
        var active = $( "#tabs" ).tabs( "option", "active" );  
        var NombreArchivo;
        var IdRepositorio=0;
        var NombreRepositorio='';
        var IdFile = 0;
        
        var Mensaje = "Se turnó el documento ";
        
        switch(active)
        {
            case 0:                                    
                $('#table_DetailResult tr[id='+IdTr+']').each(function() {                                
                    var position = TableContentdT.fnGetPosition(this); // getting the clicked row position                
                    NombreArchivo=TableContentdT.fnGetData(position)[0];
                    IdRepositorio=$('#CM_select_repositorios').val();
                    NombreRepositorio=$('#CM_select_repositorios option:selected').html();
                    Mensaje+=NombreArchivo;
                });                 

                break;

            case 1:
                $('#table_EngineResult tr[id='+IdTr+']').each(function()
                {
                    var position = TableEnginedT.fnGetPosition(this); // getting the clicked row position                
                    NombreArchivo = TableEnginedT.fnGetData(position)[2];
                    NombreRepositorio = TableEnginedT.fnGetData(position)[1];
                    IdRepositorio = TableEnginedT.fnGetData(position)[11];
                    IdFile  = TableEnginedT.fnGetData(position)[9];
                    Mensaje+=NombreArchivo;
                }); 

              break;
        }    
        
        Notificacion(Mensaje);
        
    };
    
    var Turnar = function(IdCheck)
    {
        if(IdCheck === "1" || IdCheck === "2")
        {
            $('.DivTurnar').remove();
            $('body').append('<div class = "DivTurnar"><div class = "titulo_ventana">Turnar un documento</div><div id = "TurnarTree"></div></div>');
            $('#TurnarTree').append('<ul><li id = "Turnar_00" data = "icon: \'user.png\'" class = "folder"> Usuarios <ul id = "Turnar_0"></ul></ul>');        
            $('#Turnar_0').append('<li id="MSR_1" class="folder" data="icon: \'user.png\'">Eduardo<ul id="1_MSR"></ul>');             
            $('#Turnar_0').append('<li id="MSR_2" class="folder" data="icon: \'user.png\'">Fernanda<ul id="2_MSR"></ul>');
            $('#Turnar_0').append('<li id="MSR_3" class="folder" data="icon: \'user.png\'">Rocio<ul id="3_MSR"></ul>');

            var arbol = $('#TurnarTree').dynatree({generateIds: false, expand: true, minExpandLevel: 2,
                onFocus: function(node, event){}
            });                                        

            $('.DivTurnar').dialog({title:"Turnarnando un documento", width:300, height:400, minWidth:300, minHeight:400, modal:true, buttons:{"Cerrar":{click:function(){$(this).dialog('destroy');}, text:"Cerrar"}, 
            "Seleccionar":{click:function(){
                    if($.type(arbol)==='object')
                        var node = $('#TurnarTree').dynatree("getActiveNode");
                    if(node)
                    {
                        if(node.data.key!== "Turnar_00")
                            Notificacion("Se ha turnado una solicitud a "+node.data.title);
                    }
                    
                }, text:"Seleccionar"}}});
        }
    };
};