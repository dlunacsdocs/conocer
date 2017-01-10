<?php

/*
 * Copyright 2017 Sammy Guergachi <sguergachi at gmail.com>.
 *
 * This work is licensed under the 
 * Creative Commons Attribution-NonCommercial-NoDerivs 3.0 Unported License.
 * To view a copy of this license, visit 
 *
 *      http://creativecommons.org/licenses/by-nc-nd/3.0/
 *
 * or send a letter to Creative Commons, 444 Castro Street, Suite 900, 
 * Mountain View, California, 94041, USA.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Description of DB
 *
 * Daniel Luna dluna@cs-docs.com
 */
class DB {
    public function __construct() {
        
    }
    
    
    public function Conexion(){
        $dbFilePath = dirname(__DIR__)."/Configuracion/ConexionBD/BD.ini";
        
        if(!file_exists($dbFilePath)){
            echo "<p>No existe el archivo de Conexión.</p>"; 
            return 0;
        }
        
        $dbFile = parse_ini_file ($dbFilePath,true);        

        if(!($link = mysqli_connect($dbFile['Conexion']['Host'], $dbFile['Conexion']['User'], $dbFile['Conexion']['Password'])))
                return "Imposible establecer conexión. ". mysqli_errno($link). " ".  mysqli_error($link);
        return $link;
    }
    
    public function querySelect($db, $query, $associativeArray = 1){
        if(!($link = $this->Conexion()))
            echo "No conectado";
        
        mysqli_select_db($link, $db);
        $select = mysqli_query($link, $query);
        
        if(!$select)
            {
                $estado= mysqli_error(); 
                $error=array("Estado"=>$estado, "ArrayDatos"=>0);
                return $error;
            }
            else
            {
                if($associativeArray)
                    while(($ResultadoConsulta[] = mysqli_fetch_assoc($select)) || array_pop($ResultadoConsulta)); 
                else
                    while(($ResultadoConsulta[] = mysqli_fetch_array($select)) || array_pop($ResultadoConsulta)); 
            }
        
        
        mysqli_close($link);

        $Resultado = array("Estado" => $estado, "ArrayDatos" => $ResultadoConsulta);
        return $Resultado;
    }


    public function getInstances(){
        
    }
}
