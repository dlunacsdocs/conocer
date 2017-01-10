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
 * 
 * 
 *              GRANT ALL ON *.* to user@'%' IDENTIFIED BY 'password'; 
 * 
 * 
 * Description of Service
 *
 * Daniel Luna
 */

$RoutFile = __DIR__ ;
require_once $RoutFile.'/DB.php';

class Service {
    public $db;
    public function __construct() {
        $this->db = new DB();
    }
    
    
    
}


