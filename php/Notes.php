<?php
/**
 * Description of Notes
 *
 * @author daniel
 */
require_once 'DataBase.php';
require_once 'XML.php';
require_once 'DesignerForms.php';
require_once 'Tree.php';
require_once 'Log.php';
class Notes {
    public function __construct() {
        $this->Ajax();
    }

    private function Ajax()
    {
        if(filter_input(INPUT_POST, "opcion")!=NULL and filter_input(INPUT_POST, "opcion")!=FALSE){
            
            $idSession = Session::getIdSession();
        
            if($idSession == null)
                return XML::XMLReponse ("Error", 0, "Repository::No existe una sesión activa, por favor vuelva a iniciar sesión");

            $userData = Session::getSessionParameters();
            
            switch (filter_input(INPUT_POST, "opcion"))
            {
                case 'ShowNotes': $this->ShowNotes($userData); break;
                case 'AddNote': $this->AddNote(); break;
                case 'getPagesWithNote': $this->getPagesWithNote($userData); break;
                case 'GetNote': $this->GetNote(); break;
                case 'ModifyNote': $this->ModifyNote($userData); break;
                case 'DeleteNote': $this->DeleteNote(); break;        
                case 'getNotesPerPage': $this->getNotesPerPage($userData); break;
            }
        }
    }
           
    private function getNotesPerPage($userData){
        $db = new DataBase();
        
        $dataBaseName = $userData['dataBaseName'];
        
        $idRepository = filter_input(INPUT_POST, "idRepository");
        $idFile = filter_input(INPUT_POST, "idFile");
        $pageNumber = filter_input(INPUT_POST, "pageNumber");
        
        $queryGetNotes = "SELECT *FROM CSDocs_Notes WHERE IdRepository = $idRepository AND IdFile = $idFile AND Page = $pageNumber";
        
        $resultGetNotes = $db->ConsultaSelect($dataBaseName, $queryGetNotes);
        
        if($resultGetNotes['Estado'] !=1)
            return XML::XMLReponse ("Error", 0, "<p><b>Error</b> al obtener las notas del documento</p>Detalles:<p>$resultGetNotes</p>");
        
        XML::XmlArrayResponse("Notes", "note", $resultGetNotes['ArrayDatos']);
    }
    
    /***************************************************************************
     * Obtiene un XML con las paginas que contienen notas en un documento 
     * determinado
     ****************************************************************************/
    
    private function getPagesWithNote($userData)
    {
        $BD = new DataBase();
        
        $DataBaseName = $userData['dataBaseName'];
        $IdRepositorio = filter_input(INPUT_POST, "IdRepositorio");
        $IdFile = filter_input(INPUT_POST,"IdFile");                
                
        $ConsultaNotas = "SELECT note.IdNote, note.Page FROM CSDocs_Notes note WHERE note.IdFile=$IdFile AND IdRepository = $IdRepositorio";
        $ArrayNotas = $BD->ConsultaSelect($DataBaseName, $ConsultaNotas);

        /* Se comprueba si tuvo éxito la consulta */
        if($ArrayNotas['Estado']!=1)
            XML::XMLReponse("Error", 0, "Error al Consultar las Páginas con Nota ".$ArrayNotas['Estado']); 
         
        /* Sí la consulta no generó errores, se devuelve el listado de notas en un XML */
        XML::XmlArrayResponse("Notes", "Note", $ArrayNotas['ArrayDatos']);
    }
    
    
    /***************************************************************************
     * Descripción: Devuelve el listado de Notas agregadas en un documento,    *
     * Return: XML.                                                            *
     * Llamado desde: Notes.js->ShowNotes()                                    *
     ***************************************************************************/
    private function ShowNotes($userData)
    {
        $DataBaseName = $userData['dataBaseName'];
        $IdRepositorio=  filter_input(INPUT_POST, "IdRepositorio");
        $IdFile = filter_input(INPUT_POST,"IdFile");                
        
        $notesArray = $this->getNotesArray($DataBaseName, $IdRepositorio, $IdFile);
        
        if(!is_array($notesArray))
            return XML::XMLReponse ("Error", 0, "<b<Error</b> al consultar las notas.<br><br>Detalles:<br><br>$notesArray");
                
        /* Sí la consulta no generó errores, se devuelve el listado de notas en un XML */
        XML::XmlArrayResponse("Notes", "Note", $notesArray);
        
    }
    
    public function getNotesArray($dataBaseName, $idRepository, $idFile){
        
        $DB = new DataBase();
        
        $query =" SELECT note.IdNote, note.IdUser, note.UserName, note.IdFile, note.CreationDate,"
        . "note.Text, note.Page FROM CSDocs_Notes note WHERE note.IdFile = $idFile AND note.IdRepository = $idRepository";
        
        $queryResult = $DB->ConsultaSelect($dataBaseName, $query);
        
        if($queryResult['Estado']!=1)
            return $queryResult['Estado'];
        
        return $queryResult['ArrayDatos'];
    }
    
    private function AddNote()
    {
        $XML=new XML();
        $BD= new DataBase();
        $Log = new Log();
        
//        $designer=new DesignerForms();
        $DataBaseName=  filter_input(INPUT_POST, "DataBaseName");
        $NombreRepositorio=  filter_input(INPUT_POST, "RepositoryName");
        $IdRepositorio=  filter_input(INPUT_POST, "IdRepository");
        $IdUsuario=filter_input(INPUT_POST, "IdUsuario");
        $NombreUsuario=  filter_input(INPUT_POST, "NombreUsuario");
        $IdFile=filter_input(INPUT_POST,"IdFile");   
        $IdGlobal = filter_input(INPUT_POST, "IdGlobal");
        $NoPagina=filter_input(INPUT_POST,"Page");   
        $FechaCreacion=  date("Y-m-d H:i:s");
        $TextNote=filter_input(INPUT_POST,"Text");
        $FileName = filter_input(INPUT_POST, "FileName");
        $Page = filter_input(INPUT_POST, "Page");                
        
        if(!$IdGlobal>0)
            $GetGlobalRepository = "SELECT IdGlobal FROM RepositorioGlobal WHERE IdRepositorio = $IdRepositorio AND IdFile = $IdFile";            
        else
            $GetGlobalRepository = "SELECT IdGlobal FROM RepositorioGlobal WHERE IdGlobal = $IdGlobal";            
                
        $ResultGetGlobalRepository = $BD->ConsultaSelect($DataBaseName, $GetGlobalRepository);
        if($ResultGetGlobalRepository['Estado']!=1)
        {
            $XML->ResponseXML("Error", 0, "<p><b>Error</b> al obtener el Repositorio Global.</p><br><br>Detalles:<br><br>".$ResultGetGlobalRepository['Estado']);
            return 0;
        }            
        
        if(!$IdGlobal>0)
            $IdGlobal = $ResultGetGlobalRepository['ArrayDatos'][0]['IdGlobal'];
            
        
        if(!$IdGlobal>0)
        {
            $XML->ResponseXML("Error", 0, "<p><b>Error</b> no se encuentra definido el Identificador Global del documento</p><br><br>Detalles:<br><br>El Global obtenido es =  0");
            return 0;
        }
                        
        $ConsultaInsert="INSERT INTO CSDocs_Notes (IdUser, UserName, IdRepository, IdFile, CreationDate, Text, Page) "
                . "VALUES ($IdUsuario, '$NombreUsuario', $IdRepositorio, $IdFile, '$FechaCreacion','$TextNote', $NoPagina )";             
        
        $ConsultaCampoFull = "SELECT Full FROM $NombreRepositorio WHERE IdRepositorio=$IdFile";    
        
        $ResultadoConsultaCampoFull=$BD->ConsultaSelect($DataBaseName, $ConsultaCampoFull);        
        if($ResultadoConsultaCampoFull['Estado']!=1)
        {
            $XML->ResponseXML("Error", 0, "Error al obtener el Campo FullText. ".$ResultadoConsultaCampoFull['Estado']);
            return;           
        }
        
        $IdNote=$BD->ConsultaInsertReturnId($DataBaseName, $ConsultaInsert);        
        if(!($IdNote>=0)){$XML->ResponseXML("Error", 0, $IdNote); return;}
        
        $NuevoCampoFull=$ResultadoConsultaCampoFull['ArrayDatos'][0]['Full']." ||Nota|| $IdNote, $NoPagina, $TextNote";
                
        $ConsultaUpdate = "UPDATE $NombreRepositorio SET Full ='$NuevoCampoFull' WHERE IdRepositorio=$IdFile";
        if(!($ResultadoUpdate=$BD->ConsultaQuery($DataBaseName, $ConsultaUpdate)))
        {
            $XML->ResponseXML("Error", 0, "Error al actualizar el campo Full en el repositorio ".$ResultadoUpdate);
            return;
        }        
        
        $QueryUpdateGlobalRepository = "UPDATE RepositorioGlobal SET Full = '$NuevoCampoFull' WHERE IdGlobal = $IdGlobal";
        
        if(($ResultUpdateGlobal = $BD->ConsultaQuery($DataBaseName, $QueryUpdateGlobalRepository))!=1)
        {
            $XML->ResponseXML("Error", 0, "<p><b>Error</b> al actualizar el campo Full en Global.</p><br><br>Detalles:<br><br>".$ResultUpdateGlobal);
            return 0;
        }
        
           
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement("AddNote");
        $doc->appendChild($root);   
        $IdGrupo = $doc->createElement("IdNote",$IdNote);
        $root->appendChild($IdGrupo);
        $XmlFechaCreacion = $doc->createElement("CreationDate",$FechaCreacion);
        $root->appendChild($XmlFechaCreacion);
        $XmlNoPagina = $doc->createElement("Page",$NoPagina);
        $root->appendChild($XmlNoPagina);
        $XmlTexto = $doc->createElement("Text",$TextNote);
        $root->appendChild($XmlTexto);
        $XmlNombreUsuario = $doc->createElement("UserName", $NombreUsuario);
        $root->appendChild($XmlNombreUsuario);
        $Mensaje = $doc->createElement("Mensaje","Nota agregada con éxito");
        $root->appendChild($Mensaje);          
        header ("Content-Type:text/xml");
        echo $doc->saveXML();        
        
        $Log->Write("29", $IdUsuario, $NombreUsuario, " ". substr($TextNote,0,-50) ." en el documento $FileName en la página $Page", $DataBaseName);
                        
    }
    
    private function GetNote()
    {
        $XML=new XML();
        $BD= new DataBase();
        $Log = new Log();
        
        $DataBaseName = filter_input(INPUT_POST, "DataBaseName");
//        $NombreRepositorio = filter_input(INPUT_POST, "NombreRepositorio");
        $IdRepository = filter_input(INPUT_POST, "IdRepository");
        $IdUsuario = filter_input(INPUT_POST, "IdUsuario");
        $NombreUsuario = filter_input(INPUT_POST, "NombreUsuario");
        $IdNota = filter_input(INPUT_POST, "IdNote");
        $NombreDocumento = filter_input(INPUT_POST, "FileName");
        $Page = filter_input(INPUT_POST, "Page");
        
        $QueryGetNote = "SELECT *FROM CSDocs_Notes WHERE IdNote = $IdNota AND IdRepository = $IdRepository";  
        $ResultQueryGetNote = $BD->ConsultaSelect($DataBaseName, $QueryGetNote);
        if($ResultQueryGetNote['Estado']!=1)
        {
            $XML->ResponseXML("Error", 0, "<p><b>Error</b> al consultar la Nota seleccionada</p><br><br>Detalles:<br><br>".$ResultQueryGetNote['Estado']);
            return 0;
        }
        $Log->Write("45", $IdUsuario, $NombreUsuario, "  ".substr($ResultQueryGetNote['ArrayDatos'][0]['Text'],0,-50)." del documento '$NombreDocumento en la Página $Page.", $DataBaseName);
        $XML->ResponseXmlFromArray("Notes", "Note", $ResultQueryGetNote['ArrayDatos']);        
        
    }
    
    private function ModifyNote($userData)
    {
        $BD= new DataBase();
        $Log = new Log();
        
        $DataBaseName = $userData['dataBaseName'];
        $RepositoryName = filter_input(INPUT_POST, "RepositoryName");
        $IdRepository = filter_input(INPUT_POST, "IdRepository");
        $IdUsuario = $userData['idUser'];
        $NombreUsuario = $userData['userName'];
        $FileName = filter_input(INPUT_POST, "FileName");
        $IdNote = filter_input(INPUT_POST, "IdNote");
        $IdFile = filter_input(INPUT_POST, "IdFile");
        $IdGlobal = filter_input(INPUT_POST, "IdGlobal"); 
        $Text = filter_input(INPUT_POST, "Text");
//        $PreviousText_ = filter_input(INPUT_POST, "PreviousText");
        $Page = filter_input(INPUT_POST, "Page");
//        $Text_ = substr($Text,0,100);
//        $PreviousText = substr($PreviousText_,0,100);
        $FullWithoutNotes = $this->RemoveNotesOfFull($DataBaseName, $IdGlobal, $IdFile, $IdRepository);

        if($FullWithoutNotes === 0)
            return;
                
        $UpdateNote = "UPDATE CSDocs_Notes SET Text = '$Text' WHERE IdNote = $IdNote";

        if(($ResultUpdateNote = $BD->ConsultaQuery($DataBaseName, $UpdateNote))!=1)
            return XML::XMLReponse("Error", 0, "<p><b>Error</b> al actualiza la Nota</p><br>Detalles:<br><br>$ResultUpdateNote");

        
        $NewNotesFields = $this->GetNotesString($DataBaseName, $IdRepository, $IdFile);
        
        if($NewNotesFields===0)
            return 0;
        
        $NewFullField = $FullWithoutNotes." ".$NewNotesFields;
        
        $UpdateGlobalAndRepository = 
        "UPDATE $RepositoryName, RepositorioGlobal SET $RepositoryName.Full = '$NewFullField', RepositorioGlobal.Full = '$NewFullField' "    
        . "WHERE RepositorioGlobal.IdRepositorio = $IdRepository AND RepositorioGlobal.IdFile = $IdFile AND $RepositoryName.IdRepositorio = $IdFile ";

        if(($ResultUpdateGlobalAndRepository = $BD->ConsultaQuery($DataBaseName, $UpdateGlobalAndRepository))!=1)
            return XML::XMLReponse("Error", 0, "<p><b>Error</b> al actualizar los campos Full</p><br>Detalles:<br><br>$ResultUpdateGlobalAndRepository");

        $Log->Write("30", $IdUsuario, $NombreUsuario, " $IdNote del documento '$FileName' en la página $Page del repositorio $RepositoryName");
        
        XML::XMLReponse("ModifyNote", 1, "Se modificó la nota con éxito");
                                
    }
    
    /*--------------------------------------------------------------------------
     * 
     *     @return: Regresa el campo Full de la tabla Global sin las Notas
     * 
     ---------------------------------------------------------------------------*/
    private function RemoveNotesOfFull($DataBaseName,$IdGlobal, $IdFile, $IdRepositorio)
    {
        $XML=new XML(); $BD= new DataBase();                    
        
        if($IdGlobal>0)
            $SelectFull = "SELECT Full FROM RepositorioGlobal WHERE IdGlobal = $IdGlobal";
        else
            $SelectFull = "SELECT Full FROM RepositorioGlobal WHERE IdFile = $IdFile AND IdRepositorio = $IdRepositorio";

        $ResultSelectFull = $BD->ConsultaSelect($DataBaseName, $SelectFull);
        if($ResultSelectFull['Estado']!=1)
        {
            $XML->ResponseXML("Error", 0, "<p><b>Error</b> al obtener el campo Full de 'Global'</p><br>Detalles: <br><br>".$ResultSelectFull['Estado']);
            return 0;
        }
        
        $ArrayResultSelectFull = $ResultSelectFull['ArrayDatos'][0];
        $Full = $ArrayResultSelectFull['Full'];
        $FindAndReplaceNotes = preg_replace('/(\|\|\bNota\b\|\|\s[0-9]+\,\s[0-9]+\,\s).*/', '' ,$Full);
        return $FindAndReplaceNotes;
    }
    
    private function DeleteNote()
    {
        $XML=new XML();
        $BD= new DataBase();
        $Log = new Log();
        
        $DataBaseName = filter_input(INPUT_POST, "DataBaseName");
        $RepositoryName = filter_input(INPUT_POST, "RepositoryName");
        $IdRepository = filter_input(INPUT_POST, "IdRepository");
        $IdUsuario = filter_input(INPUT_POST, "IdUser");
        $NombreUsuario = filter_input(INPUT_POST, "UserName");
        $FileName = filter_input(INPUT_POST, "FileName");
        $IdNote = filter_input(INPUT_POST, "IdNote");
        $IdFile = filter_input(INPUT_POST, "IdFile");
        $IdGlobal = filter_input(INPUT_POST, "IdGlobal"); 
        $Text_ = filter_input(INPUT_POST, "Text");
        $Page = filter_input(INPUT_POST, "Page");                
        $Text = substr($Text_,0,100);
        
        $FullWithoutNotes = $this->RemoveNotesOfFull($DataBaseName, $IdGlobal, $IdFile, $IdRepository);
        
        $DeleteNote = "DELETE FROM CSDocs_Notes WHERE IdNote = $IdNote";
        if(($ResultDeleteNote = $BD->ConsultaQuery($DataBaseName, $DeleteNote))!=1)
        {
            $XML->ResponseXML("Error", 0, "<p><b>Error</b> al intentar eliminar la nota</p><br>Detalles:<br><br>$ResultDeleteNote");
            return 0;
        }
        
        $NewNotesFields = $this->GetNotesString($DataBaseName, $IdRepository, $IdFile);
        if($FullWithoutNotes === 0)
            return;
        
        
        $NewFullField = $FullWithoutNotes." ".$NewNotesFields;

        $UpdateGlobalAndRepository = 
        "UPDATE $RepositoryName, RepositorioGlobal SET $RepositoryName.Full = '$NewFullField', RepositorioGlobal.Full = '$NewFullField' "    
        . "WHERE RepositorioGlobal.IdRepositorio = $IdRepository AND RepositorioGlobal.IdFile = $IdFile AND $RepositoryName.IdRepositorio = $IdFile ";
//        echo $UpdateGlobalAndRepository;
        if(($ResultUpdateGlobalAndRepository = $BD->ConsultaQuery($DataBaseName, $UpdateGlobalAndRepository))!=1)
        {
            $XML->ResponseXML("Error", 0, "<p><b>Error</b> al actualizar los campos Full</p><br>Detalles:<br><br>$ResultUpdateGlobalAndRepository");
            return 0;
        }                

        $Log->Write("31", $IdUsuario, $NombreUsuario, " del documento '$FileName' página $Page con el contenido '$Text'", $DataBaseName);
        
        $XML->ResponseXML("DeleteNote", 1, "<p>Se eliminó la nota correctamente</p>");
    }
    
    function GetNotesString($DataBaseName, $IdRepository, $IdFile)
    {
        $XML=new XML();
        $BD= new DataBase();
        
        $QueryGetNotes = "SELECT *FROM CSDocs_Notes WHERE IdRepository = $IdRepository AND IdFile = $IdFile";

        $ResultQueryGetNotes = $BD->ConsultaSelect($DataBaseName, $QueryGetNotes);
        if($ResultQueryGetNotes['Estado']!=1)
        {
            $XML->ResponseXML("Error", 0, "<p><b>Error</b> al obtener el listado de Notas del Documento</p><br>Detalles:<br><br>".$ResultQueryGetNotes['Estado']);
            return 0;
        }
        
        $Notes = $ResultQueryGetNotes['ArrayDatos'];
        $NotesString = '';
        for($cont = 0; $cont < count($Notes); $cont++)
        {
            $NotesString.= "||Nota|| ".$Notes[$cont]['IdNote'].", ".$Notes[$cont]['Page'].", ".$Notes[$cont]['Text']." ";
        }
        
        return $NotesString;
    }
}

$Notes=new Notes();
