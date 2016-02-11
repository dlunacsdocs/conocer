/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global LanguajeDataTable, GlobalDatePicker, BotonesWindow, dHeight, Wvisor, EnvironmentData */

var LogdT, LogDT;

$(document).ready(function()
{
    var Registers = new Log();            
    
    $('.LinkRegisters').click(function()
    {        
        Registers.BuildLogWindow();
        Registers.ShowWindowLog();
        $('#div_registers').dialog({title: "Registros del Sistema", width:Wvisor, height:dHeight, minWidth:300, minHeight:300,position: "top+20", closeOnEscape:false, close:function(){$(this).remove();}}).dialogExtend(BotonesWindow);  
    });        
    
});

var  Log = function()
{
    this.validarFecha = validarFecha;   
};

Log.prototype.BuildLogWindow = function()
{
    var self = this;
    $('#div_registers').remove();
    $('body').append('<div id = "div_registers" style ="display:none">\n\
        <div class="menu_lateral">\n\
                <div id="accordion_registers">\n\
                    <div>\n\
                      <h3><a href="#">Registros</a></h3>\n\
                      <div>\n\
                          <table>\n\
                              <tr id="tr_QueryUser">\n\
                                   <td><img src="img/user_add.png"></td>\n\
                                  <td>Registros del sistema</td>\n\
                              </tr>\n\
                          </table>\n\
                      </div>\n\
                    </div>\n\
                </div>\n\
        </div>\n\
        <div class="work_space" id="WS_Registers"></div>\n\
    </div>');
    
    $("#accordion_registers").accordion({ header: "h3", collapsible: true,heightStyle: "content" });
    
    /********* Efectos sobre tabla dentro de acordeÃ³n ***********/
    $('#div_registers table').on( 'click', 'tr', function ()
    {
        var active = $('#div_registers table tr.TableInsideAccordionFocus');                
        $('#div_registers table tr').removeClass('TableInsideAccordionFocus');
        $('#div_registers table tr').removeClass('TableInsideAccordionActive');
        $(active).addClass('TableInsideAccordionFocus');
        $(this).removeClass('TableInsideAccordionHoverWithoutClass');
        $(this).addClass('TableInsideAccordionActive');     
    });
    
    $('#div_registers table tr').hover(function()
    {
        if($(this).hasClass('TableInsideAccordionActive') || $(this).hasClass('TableInsideAccordionFocus'))
            $(this).addClass('TableInsideAccordionHoverWithClass');
        else
            $(this).addClass('TableInsideAccordionHoverWithoutClass');
    });
    
    $('#div_registers table tr').mouseout(function()
    {
        if($(this).hasClass('TableInsideAccordionActive') || $(this).hasClass('TableInsideAccordionFocus'))
            $(this).removeClass('TableInsideAccordionHoverWithClass');
        else
            $(this).removeClass('TableInsideAccordionHoverWithoutClass');
    });
    
    $('#tr_NewUser').addClass('TableInsideAccordionActive');
    /* Fin de Efectos  */
    
    $('#tr_QueryUser').click(function(){    self.ShowWindowLog();    });
    $('#tr_QueryUser').click();
};

Log.prototype.ShowRegisters = function()
{      
    var self = this;
    
   var Registers =  self.QueryLog();
   
   if(Registers!==0)
       self.BuildTableLog(Registers);
   else
       $('#LoadingQueryRegisters').remove();
};

Log.prototype.ShowWindowLog = function()
{
    var self = this;
    $('#WS_Registers').empty();
    $('#WS_Registers').append('<div class = "titulo_ventana">Registro del Sistema</div>');
    $('#WS_Registers').append('<p>Fecha a consultar: <input type ="text" id ="DateLog" style="cursor:pointer">\n\
        <input type = "button" id = "ButtonQueryLog" value = "Consultar"></p>');
    $('#DateLog').datepicker(GlobalDatePicker);                
    $('#ButtonQueryLog').button();
    $('#ButtonQueryLog').click(function(){self.ShowRegisters();});        
    $('#DateLog').val($.datepicker.formatDate('yy-mm-dd', new Date()));

};

Log.prototype.QueryLog = function()
{
    var xml = 0;
    var Date = $('#DateLog').val();

    if(!this.validarFecha(Date))
    {
        Advertencia("Fecha inválida");
        return 0;
    }

    $('#WS_Registers').append('<div class="loading" id = "LoadingQueryRegisters"><img src="../img/loadinfologin.gif"></div>');                

    $.ajax({
      async:false, 
      cache:false,
      dataType:"html", 
      type: 'POST',   
      url: "php/Log.php",
      data: 'opcion=LogQuery&DataBaseName='+EnvironmentData.DataBaseName+'&IdUsuario='+EnvironmentData.IdUsuario+'&nombre_usuario='+EnvironmentData.NombreUsuario+'&UserGroup='+EnvironmentData.NombreGrupo+'&Date='+Date, 
      success:  function(response){
          $('#LoadingQueryRegisters').remove();
          xml = response;              

          if($.parseXML( xml )!==null){ xml=$.parseXML( xml );    }
          else {errorMessage(xml); return 0;}

          $(xml).find("Error").each(function()
          {
            var $Error=$(this);
            var estado=$Error.find("Estado").text();
            var mensaje =$Error.find("Mensaje").text();
            errorMessage(mensaje);
            return 0;
          });                
      },
      beforeSend:function(){},
      error:function(objXMLHttpRequest){errorMessage(objXMLHttpRequest);$('#LoadingQueryRegisters').remove();}
    });    

    return xml;
};

Log.prototype.BuildTableLog = function(xml)
{               
    $('#DivTableLog').remove();
    $('#WS_Registers').append('<div class="loading" id = "LoadingQueryRegisters"><img src="../img/loadinfologin.gif"></div>');                

    $('#WS_Registers').append('<div id ="DivTableLog"></div>');
    $('#DivTableLog').append('<table id ="TableLog" class = "display hover">\n\
        <thead><tr><th>Hora</th><th>Usuario</th><th>Movimiento</th><th>Ip Origen</th></tr></thead><tbody></tbody>\n\
    </table>');                                                         

    LogdT = $('#TableLog').dataTable(
    {
       "autoWidth" : false, "oLanguage":LanguajeDataTable,"dom": 'lfTrtip',
        "tableTools": {
            "aButtons": [
                {"sExtends": "copy","sButtonText": "Copiar al portapapeles"},
                {
                    "sExtends":    "collection",
                    "sButtonText": "Guardar como...",
                    "aButtons":    [ "csv", "xls", "pdf" ]
                }                          
            ]
        }                              
    });  

    $('div.DTTT_container').css({"margin-top":"1em"});
    $('div.DTTT_container').css({"float":"left"});

    LogDT = new $.fn.dataTable.Api('#TableLog');

    $(xml).find("Register").each(function()
    {
        var $Register=$(this);
        var Date = $Register.find("Date").text();
        var User = $Register.find("User").text();
        var Description = $Register.find("Description").text();
        var ClientIp = $Register.find("ClientIp").text();

//            $('#TableLog tbody').append('<tr><td>'+Date+'</td><td>'+User+'</td><td>'+Description+'</td><td>'+ClientIp+'</td></tr>');
        var data = [Date, User, Description, ClientIp];
        console.log(this);
        var ai = LogDT.row.add(data).draw();
        var n = LogdT.fnSettings().aoData[ ai[0] ].nTr;
//            n.setAttribute('id',self.AutoincrementId);

    });           

    $('#LoadingQueryRegisters').remove();
};        
    
     

function validarFecha(obj) {
  var currVal = obj;
    if(currVal == '')
        return false;

    var rxDatePattern = /^(\d{4})(\/|-)(\d{1,2})(\/|-)(\d{1,2})$/; //Declare Regex
    var dtArray = currVal.match(rxDatePattern); // is format OK?

    if (dtArray == null) 
        return false;

    //Checks for mm/dd/yyyy format.
    dtMonth = dtArray[3];
    dtDay= dtArray[5];
    dtYear = dtArray[1];        

    if (dtMonth < 1 || dtMonth > 12) 
        return false;
    else if (dtDay < 1 || dtDay> 31) 
        return false;
    else if ((dtMonth==4 || dtMonth==6 || dtMonth==9 || dtMonth==11) && dtDay ==31) 
        return false;
    else if (dtMonth == 2) 
    {
        var isleap = (dtYear % 4 == 0 && (dtYear % 100 != 0 || dtYear % 400 == 0));
        if (dtDay> 29 || (dtDay ==29 && !isleap)) 
                return false;
    }
    return true;
}