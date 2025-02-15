// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Patientenakte {
    address public patient; //entspricht dem Owner des Vertrags

    struct Access {
        uint expiresAt;  
        uint remainingUses;
        bool expiresFlag; //Zeigt an ob zeitlich begrenzt Achtung True heißt hier Nein es ist nicht zeitlich begrenzt
        bool usesFlag;    //Zeigt an ob auf Anzahl begrenzt       True heißt hier Nein es ist nicht  begrenzt auf häufigkeit
        string encryptedKey; // Verschlüsselter AES-Schlüssel 
        //enctyped Key anderer Datentyp?
    }
    // Mapping: (Arzt-Adresse => (Dokument-ID => Zugriffsdaten))
    mapping(address => mapping(uint256 => Access)) public accessList;

    event AccessGranted(address indexed doctor, uint256 indexed documentID, uint expiresAt, uint remainingUses, bool expiresFlag, bool usesFlag);
    event AccessRevoked(address indexed doctor, uint256 indexed documentID);
    event AccessUsed(address indexed doctor, uint256 indexed documentID, uint expiresAt, uint remainingUses);
    //Was machen die Events keine Ahnung

    constructor(address _patient) {
        patient = _patient;     
    }

    function grantAccess(address _doctor, uint256 _documentID, uint _expiresAt, uint _remainingUses, bool _expiresFlag, bool _usesFlag,string memory _encryptedKey) public {
        //Die Funktion könnte dann eigentlich auch weg... da die grantMultiAccess alles regeln müsste
        //Fehlen auch noch paar Requires zwecks den neune Flags....
        require(msg.sender == patient, "Nur der Patient kann Zugriff gewaehren");
        require(_expiresAt > block.timestamp, "Muss in der Zukunft liegen");
        require(_remainingUses > 0, "Zugriffe muessen > 0 sein");
        //Hier wird Extra nicht geprueft ob schon Zugriff besteht so wird die Funktion als grant und update parallel verwendet
        //Das könnte man im Frontend lösen
        accessList[_doctor][_documentID] = Access(_expiresAt, _remainingUses, _expiresFlag, _usesFlag,_encryptedKey);
        emit AccessGranted(_doctor, _documentID, _expiresAt, _remainingUses, _expiresFlag, _usesFlag);
    }
    function grantMultiAccess(address[] memory _doctors, uint256[] memory _documentIDs, uint _expiresAt, uint _remainingUses, bool _expiresFlag, bool _usesFlag, string[] memory _encryptedKeys) public {
        require(msg.sender == patient, "Nur der Patient kann Zugriff gewaehren");
        require(_doctors.length>0, "Mindestens ein Arzt uebergeben");//auch im Frontend abfangen...
        require(_documentIDs.length>0, "Mindestens ein Dokument uebergeben"); //auch im Frontend schon abfangen ...
        require(_documentIDs.length == _encryptedKeys.length, "Anzahl Keys und Anzahl Dokumente muss passen");//auch im frontend schon abfangen
        //bzw brauchen wir das überhaupt hier nochmal überprüfen was genau der Key bedeutet aber eigentlich pro Dokument ein Key und dann
        //bevor dem SEnden mit dem Arzt Key verschlüsseln
        if (_expiresFlag){
            //Zeitlich unbegrenzt zugriff
            _expiresAt = 0;
        }else{
            //begrenzter Zugriff daher überprüfen ob in Zukunft liegt
            require(_expiresAt >block.timestamp, "Angabe muss in der Zukunft liegen");
        }
        if (_usesFlag){
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
                accessList[doctor][docID] = Access(_expiresAt, _remainingUses, _expiresFlag, _usesFlag, encKey);
                emit AccessGranted(doctor, docID, _expiresAt, _remainingUses, _expiresFlag, _usesFlag);
            }
        }
    }

    function hasAccess(uint256 _documentID) public view returns (bool) {//Testfunktion hab ich zugriff?
        Access memory access = accessList[msg.sender][_documentID];
        if (access.expiresAt == 0 && access.remainingUses==0 && !access.expiresFlag&& !access.usesFlag){
            //Es wurde kein Eintrag gefunden also false
            return false;
        }
        if(access.expiresFlag && access.usesFlag){
            return true; //Zugriff unendlich
        }
        if(access.expiresFlag &&  !access.usesFlag){
            return access.remainingUses > 0;
            //zeitlich unendlich beschraenkt auf Anzahl
            //sollen wir hier noch den Eintrag löschen?
        }
        if (!access.expiresFlag && access.usesFlag){
            return access.expiresAt >block.timestamp;
            //zeitlich beschraenkt mit unendlich Anzahl
            //sollen wir hier noch den Eintrag löschen?
        }
        return access.expiresAt > block.timestamp && access.remainingUses > 0;
        //zeitlich und Anzahl Zugriffe beschraenkt
    }

    function useAccess(uint256 _documentID) public returns (string memory) {
        Access storage access = accessList[msg.sender][_documentID];
        require(access.expiresAt != 0 && access.remainingUses!=0 && !access.expiresFlag && !access.usesFlag, "Kein Eintrag gefunden");
        
        if(access.expiresFlag &&  !access.usesFlag){
            require(access.remainingUses > 0,"Keine Zugriffe uebrig");
            //sollen wir hier noch den Eintrag löschen?
            access.remainingUses -= 1;
            //return access.encryptedKey;
            //zeitlich unendlich beschraenkt auf Anzahl
        }
        if (!access.expiresFlag && access.usesFlag){
            //sollen wir hier noch den Eintrag löschen?
            require(access.expiresAt >block.timestamp, "Zugriffszeitraum abgelaufen");
            //return access.encryptedKey;
            //zeitlich beschreankt mit unendlich Anzahl
            
        }
        if(!access.expiresFlag && !access.usesFlag){
            //sollen wir hier noch den Eintrag löschen?
            require(access.expiresAt >block.timestamp && access.remainingUses> 0);
             access.remainingUses -= 1;
             //zeitlich begrenzt
             //Anzahl zugriffe beschraenkt
        }
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
