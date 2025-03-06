// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Patientenakte {
    address public patient; //entspricht dem Owner des Vertrags

    struct Access {
        uint expiresAt;  
        uint remainingUses;
        bool dontExpiresFlag; //Zeigt an ob zeitlich begrenzt  True heißt  Nein es ist nicht zeitlich begrenzt
        bool noUseLimitFlag;    //Zeigt an ob auf Anzahl begrenzt True heißt hier nicht begrenzt auf häufigkeit
        string encryptedKey; // Verschlüsselter AES-Schlüssel
        uint lastUseAccess; //Wird sich gemerkt beim useAccess damit die nächsten 15 min kein 2 Zugriff abgezogen wird 

        //enctyped Key anderer Datentyp?
    }
    // Mapping: (Arzt-Adresse => (Dokument-ID => Zugriffsdaten))
    mapping(address => mapping(uint256 => Access)) public accessList;

    event AccessGranted(address indexed doctor, uint256 indexed documentID, uint expiresAt, uint remainingUses, bool dontExpiresFlag, bool noUseLimitFlag);
    event AccessRevoked(address indexed doctor, uint256 indexed documentID);
    event AccessUsed(address indexed doctor, uint256 indexed documentID, uint expiresAt, uint remainingUses);
    

    constructor(address _patient) {
        patient = _patient;     
    }

    function grantMultiAccess(address[] memory _doctors, uint256[] memory _documentIDs, uint _expiresAt, uint _remainingUses, bool _dontExpiresFlag, bool _noUseLimitFlag, string[] memory _encryptedKeys) public {
        require(msg.sender == patient, "Nur der Patient kann Zugriff gewaehren");
        require(_doctors.length>0, "Mindestens ein Arzt uebergeben");//auch im Frontend abfangen...
        require(_documentIDs.length>0, "Mindestens ein Dokument uebergeben"); //auch im Frontend schon abfangen ...
        require(_documentIDs.length == _encryptedKeys.length, "Anzahl Keys und Anzahl Dokumente muss passen");//auch im frontend schon abfangen
        //bzw brauchen wir das überhaupt hier nochmal überprüfen was genau der Key bedeutet aber eigentlich pro Dokument ein Key und dann
        //bevor dem SEnden mit dem Arzt Key verschlüsseln
        if (_dontExpiresFlag){
            //Zeitlich unbegrenzt zugriff
            _expiresAt = 0;
        }else{
            //begrenzter Zugriff daher überprüfen ob in Zukunft liegt
            require(_expiresAt >block.timestamp, "Angabe muss in der Zukunft liegen");
        }
        if (_noUseLimitFlag){
            //Unbegrenz Zugriffe in der Anzahl
            _remainingUses = 0;
        }else{
            //Begrenzte Anzahl an Zugriffe daher muss es > 0 sein
            require(_remainingUses>0, "Zugriffe muessen >0 sein!");
        }
        for (uint i =0; i < _documentIDs.length; i++){
            uint256 docID = _documentIDs[i];
            string memory encKey = _encryptedKeys[i];
            for (uint j= 0; j < _doctors.length; j++){
                address doctor =_doctors[j];
                accessList[doctor][docID] = Access(_expiresAt, _remainingUses, _dontExpiresFlag, _noUseLimitFlag, encKey,0);
                emit AccessGranted(doctor, docID, _expiresAt, _remainingUses, _dontExpiresFlag, _noUseLimitFlag);
            }
        }
    }
 struct AccessInfo {
            bool access;
            uint256 expiresAt;
            uint256 remainingUses;
        }
    function hasAccess(uint256 _documentID) public view returns (AccessInfo memory) {//Vielleicht hier einbauen das man wie lange noch zugriff zurückbekommt
        Access memory access = accessList[msg.sender][_documentID];
        if (access.expiresAt == 0 && access.remainingUses==0 && !access.dontExpiresFlag&& !access.noUseLimitFlag){
            //Es wurde kein Eintrag gefunden also false
            return AccessInfo(false,0,0);
        }
        if(access.dontExpiresFlag && access.noUseLimitFlag){
            return AccessInfo(true,0,0); //Zugriff unendlich
        }
        if(access.dontExpiresFlag &&  !access.noUseLimitFlag){
            return AccessInfo((access.remainingUses > 0),0,access.remainingUses);
            //zeitlich unendlich beschraenkt auf Anzahl
            //sollen wir hier noch den Eintrag löschen?
        }
        if (!access.dontExpiresFlag && access.noUseLimitFlag){
            return AccessInfo((access.expiresAt >block.timestamp),access.expiresAt,0);
            //zeitlich beschraenkt mit unendlich Anzahl
            //sollen wir hier noch den Eintrag löschen?
        }
        return AccessInfo((access.expiresAt > block.timestamp && access.remainingUses > 0), access.expiresAt, access.remainingUses);
        //zeitlich und Anzahl Zugriffe beschraenkt
    }
   
    function whoHasAccess(address _doctor, uint256[] memory _documentID) public view returns (AccessInfo[] memory) {//Patient sieht welche Zugriffe Arzt X hat
        require(msg.sender == patient, "Nur der Patient darf sehen wer Zugriff hat");
        require(_documentID.length>0, "Array der Dokumente muss mindestens 1 ID enthalten");
        
        AccessInfo[] memory returnArray = new AccessInfo[](_documentID.length);

        for (uint i=0; i<_documentID.length; i++){
            Access memory access = accessList[_doctor][i];
            if (access.expiresAt == 0 && access.remainingUses==0 && !access.dontExpiresFlag&& !access.noUseLimitFlag){
                //Es wurde kein Eintrag gefunden also false
                returnArray[i]= AccessInfo(false,0,0);
                continue;
            }
            if(access.dontExpiresFlag && access.noUseLimitFlag){
                //Unendlich Zugriff (bis zum Revoke)
                returnArray[i]= AccessInfo(true,0,0);
                continue;
            }
            if(access.dontExpiresFlag &&  !access.noUseLimitFlag){
                returnArray[i]= AccessInfo((access.remainingUses > 0),0,access.remainingUses);
                continue;
                //zeitlich unendlich beschraenkt auf Anzahl
                //sollen wir hier noch den Eintrag löschen?
            }
            if (!access.dontExpiresFlag && access.noUseLimitFlag){
                returnArray[i] =AccessInfo((access.expiresAt > block.timestamp),access.expiresAt,0);
                continue;
                //zeitlich beschraenkt mit unendlich Anzahl
                //sollen wir hier noch den Eintrag löschen?
            }
            returnArray[i] =AccessInfo((access.expiresAt > block.timestamp && access.remainingUses > 0),access.expiresAt,access.remainingUses);
            //zeitlich und Anzahl Zugriffe beschraenkt
            }
            return returnArray;
        
    }

    function useAccessWrite(uint256 _documentID) public {
        Access storage access = accessList[msg.sender][_documentID];
        require(access.expiresAt != 0 || access.remainingUses!=0  || access.dontExpiresFlag || access.noUseLimitFlag, "Kein Eintrag gefunden");
        
        if(access.dontExpiresFlag &&  !access.noUseLimitFlag){
            require(access.remainingUses > 0,"Keine Zugriffe uebrig");
            //sollen wir hier noch den Eintrag löschen?
            access.remainingUses -= 1;
            //zeitlich unendlich beschraenkt auf Anzahl
        }
        if (!access.dontExpiresFlag && access.noUseLimitFlag){
            //sollen wir hier noch den Eintrag löschen?
            require(access.expiresAt >block.timestamp, "Zugriffszeitraum abgelaufen");
            //zeitlich beschreankt mit unendlich Anzahl
            
        }
        if(!access.dontExpiresFlag && !access.noUseLimitFlag){
            //sollen wir hier noch den Eintrag löschen?
            require(access.expiresAt >block.timestamp && access.remainingUses> 0);
            access.remainingUses -= 1;
             //zeitlich begrenzt
             //Anzahl zugriffe beschraenkt
        }
        emit AccessUsed(msg.sender, _documentID,  access.expiresAt,  access.remainingUses);
        access.lastUseAccess=block.timestamp;
    }
    function useAccessRead(uint256 _documentID) public view returns (string memory){
        Access storage access = accessList[msg.sender][_documentID];
        require(access.expiresAt != 0 || access.remainingUses!=0  || access.dontExpiresFlag || access.noUseLimitFlag, "Kein Eintrag gefunden");
        require(access.lastUseAccess + 15*60> block.timestamp, "Ihre 15 min Zugriff sind abgelaufen");
        return access.encryptedKey;

    }

    function revokeAccess(address _doctor, uint256 _documentID) public {
        require(msg.sender ==patient, "Nur Patient darf Berechtigungen entfernen");
        /*Man koennte hier noch vorher pruefen ob es das Dokument gibt
        bzw. ob der Arzt überhaupt Zugriff darauf hatte
        Da aber Solidity kein Fehler wirft wenn es keinen Eintrag gibt ist diese Loesung Gas sparend
        ==> Nachteil ist nur das es keine Fehlermeldung gibt und den Anwender verwirren koennte */
        delete accessList[_doctor][_documentID];
        emit AccessRevoked(_doctor, _documentID);
    }
}
