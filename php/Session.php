<?php

/*
 * @author Daniel Luna
 */
class Session {
    static $idSession = null;
    
    public static function createSession($idUser, $userName, $dataBaseName)
    {
        session_start();

        $sessionId = session_id();
        
        $_SESSION['idSession'] = $sessionId;
         
        $_SESSION['idUser'] = $idUser;
        $_SESSION['userName'] = $userName;
        $_SESSION['dataBaseName'] = $dataBaseName;
        
        return $sessionId;
        
    }
    
    public static function getIdSession($dataBaseName, $userName)
    {
        if(isset($_SESSION['userName']) and isset($_SESSION['dataBaseName'])){
            
            if(strcasecmp($_SESSION['userName'], $userName)==0 and strcasecmp($_SESSION['dataBaseName'], $dataBaseName)==0){
                if(isset ($_SESSION['idSession']))
                    return $_SESSION['idSession'];
                else
                    return null;
            }
            else{
                return null;
            }
        } 
        else 
            return null;
        
    }
    
    public static function checkTimeOut()
    {
        if (isset($_SESSION["lastActivity"])) {
            if(time() - $_SESSION["lastActivity"] > 1800) {
                // last request was more than 30 minutes ago
                session_unset();     // unset $_SESSION variable for the run-time 
                session_destroy();   // destroy session data in storage
            } else if (time() - $_SESSION["lastActivity"] > 60) {
                $_SESSION["lastActivity"] = time(); // update last activity time stamp
            }
        }
    }
    
    public static function destroySession()
    {
        
    }
}
