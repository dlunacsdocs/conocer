/* global TableEnginedT, TableContentdT, DownloadTabledT */

/*******************************************************************************
 * 
 * Obtiene las propiedades de un documento de acuerdo al origen de donde esta siendo 
 * consultado p.e. desde el content, resultado de una búsqueda, etc. :
 * 
 *  Propiedades devueltas
 *  
 *      Nombre
 *      IdFile
 *      IdRepository
 *      IdEmpresa
 *      Tipo
 *      
 * @Souder: Origen de donde serán tomados los valores
 * @IdGlobal:   Tabla Global
 * @IdFile:     Id del documento en su repositorio
 */
var ClassDocumentEnvironment = function(Source, IdGlobal, IdFile)
{
    var self = this;
    this.Source = Source;
    this.IdGlobal = IdGlobal;
    this.IdFile = IdFile;
    this.IdRepository = 0;
    this.RepositoryName = undefined;
    this.IdEnterprise = 0;
    this.EnterpriseName = undefined;
    this.FileName = undefined;
    this.FileRoute = undefined;
    this.FileType = undefined;
    
    this.GetProperties = function()
    {
        switch (this.Source)
        {
            case 'Content':
                self.GetPropertiesFromContent();                   
            break;
            
            case 'Download':
                self.GetPropertiesFromDownload();                   
            break;
        }
    };
    
    this.GetPropertiesFromContent = function()
    {
        console.log('Get properties from content');
        var self = this;
        
//        console.dialog('GetPropertiesFromContent');
       var active = $("#tabs").tabs( "option", "active" );  
       var _FileName='', _IdFile=0, _IdRepository=0, _FileRoute, IdGlobal,_RepositoryName;
       switch(active)
       {
            case 0:
               $('#table_DetailResult tr[id='+ IdFile +']').each(function()
               {                
                   var position = TableContentdT.fnGetPosition(this); // getting the clicked row position  
                   _IdFile = $('#table_DetailResult tr.selected').attr('id');
                   _FileName = TableContentdT.fnGetData(position)[0];        
                   self.FileType = TableContentdT.fnGetData(position)[2];
                   _FileRoute = TableContentdT.fnGetData(position)[6];
                   _IdRepository = $('#CM_select_repositorios').val();
                   _RepositoryName = $('#CM_select_repositorios option:selected').html();                   
               }); 
                break;

            case 1:        
               $('#table_EngineResult tr[id='+ this.IdGlobal +']').each(function()
               {
                    var position = TableEnginedT.fnGetPosition(this); // getting the clicked row position  
                   _IdFile = TableEnginedT.fnGetData(position)[9];
                   _FileName = TableEnginedT.fnGetData(position)[2];
                   _RepositoryName = TableEnginedT.fnGetData(position)[1];
                   _IdRepository = TableEnginedT.fnGetData(position)[11];
                   _FileRoute = TableEnginedT.fnGetData(position)[8];
               }); 
                break;
                
            default: return 0;
       }
//       console.dialog(this.FileRoute+" "+this.FileName+" "+this.RepositoryName+' '+this.IdRepository);
       this.FileRoute = _FileRoute;
       this.FileName = _FileName;
       this.RepositoryName = _RepositoryName;
       this.IdRepository = _IdRepository;       
    };        
};
/*------------------------------------------------------------------------------
 *      Desde la tabla de descargas el IdGlobal = IdRepository
 *      Ya que esa tabla cuenta con:
 *              Row id = IdFile
 *              IdGlobal = IdRepository
 *      Con estos parámetros se tinstingue entre documentos de cada repositorio
 */
ClassDocumentEnvironment.prototype.GetPropertiesFromDownload = function()
{
    console.log('Get properties from Download');
    var self = this;    
    $('#table_download tr[id='+self.IdGlobal+']').each(function()
    {
        var position = DownloadTabledT.fnGetPosition(this); // getting the clicked row position  
        self.IdRepository = DownloadTabledT.fnGetData(position)[0];
        self.RepositoryName = DownloadTabledT.fnGetData(position)[1];
        self.FileName = DownloadTabledT.fnGetData(position)[2];
        self.FileRoute = DownloadTabledT.fnGetData(position)[5];
    });
};
