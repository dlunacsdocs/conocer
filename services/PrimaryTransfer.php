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
 * Description of PrimaryTransfer
 *
 * @author Daniel Luna dluna@cs-docs.com
 
 
 GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY 'password' WITH GRANT OPTION;
 FLUSH PRIVILEGES;
 
  SET GLOBAL event_scheduler = ON;

  CREATE EVENT event_name
  ON SCHEDULE
    EVERY 1 DAY
    STARTS (TIMESTAMP(CURRENT_DATE) + INTERVAL 1 DAY + INTERVAL 1 HOUR)
  DO 
 
 
  DROP EVENT [IF EXISTS] event_name
 * 
 * 
SELECT rep.idRepositorio,  dir.IdDirectory, dir.title, rep.FechaIngreso, now(), dv.idDocDisposition, dd.Name, dd.NameKey, dv.ArchivoTramite, dd.NodeType FROM Repositorio rep INNER JOIN dir_Repositorio dir ON rep.idDirectory = dir.IdDirectory
INNER JOIN CSDocs_DocumentValidity dv ON dv.idDocDisposition = dir.idDocDisposition
LEFT JOIN CSDocs_DocumentaryDisposition dd ON dd.idDocumentaryDisposition = dv.idDocDisposition
WHERE NOW() > DATE_ADD(rep.FechaIngreso, INTERVAL dv.ArchivoTramite MONTH) AND dd.NodeType = "serie"

Obtiene todos los documentos que a partir de su fecha de ingreso se calcula a traves de los años en trámite de la serie sí ya se encuentra dentro de ese periodo o no.

 */
require_once __DIR__ . '/Service.php';

class PrimaryTransfer extends Service {

    public function __construct() {
        parent::__construct();
    }

    public function init() {
        $this->transferDocuments();
    }

    private function transferDocuments() {
        $instances = $this->db->querySelect("cs-docs", "SELECT *FROM instancias");
        var_dump($instances);
    }
    
    

}

$transfer = new PrimaryTransfer();
$transfer->init();
