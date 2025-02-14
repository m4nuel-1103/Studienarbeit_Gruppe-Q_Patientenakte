// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Patientenakte {
    address public patient; //entspricht dem Owner des Vertrags

    struct Access {
        uint expiresAt;  
        uint remainingUses;
        string encryptedKey; // Verschlüsselter AES-Schlüssel
    }
    // Mapping: (Arzt-Adresse => (Dokument-ID => Zugriffsdaten))
    mapping(address => mapping(uint256 => Access)) public accessList;

    event AccessGranted(address indexed doctor, uint256 indexed documentID, uint expiresAt, uint remainingUses);
    event AccessRevoked(address indexed doctor, uint256 indexed documentID);
    event AccessUsed(address indexed doctor, uint256 indexed documentID, uint expiresAt, uint remainingUses);
    //Was machen die Events keine Ahnung

    constructor(address _patient) {
        patient = _patient;     
    }

    function grantAccess(address _doctor, uint256 _documentID, uint _expiresAt, uint _remainingUses, string memory _encryptedKey) public {
        require(msg.sender == patient, "Nur der Patient kann Zugriff gewahren");
        require(_expiresAt > block.timestamp, "Muss in der Zukunft liegen");
        require(_remainingUses > 0, "Zugriffe muessen > 0 sein");
        //Hier wird Extra nicht geprueft ob schon Zugriff besteht so wird die Funktion als grant und update parallel verwendet
        accessList[_doctor][_documentID] = Access(_expiresAt, _remainingUses, _encryptedKey);
        emit AccessGranted(_doctor, _documentID, _expiresAt, _remainingUses);
    }

    function hasAccess(uint256 _documentID) public view returns (bool) {//Testfunktion hab ich zugriff?
        Access memory access = accessList[msg.sender][_documentID];
        if (access.expiresAt == 0){
            return false; //Keine Einträge gefunde also NEIN!
        }
        return access.expiresAt > block.timestamp && access.remainingUses > 0;
    }

    function useAccess(uint256 _documentID) public returns (string memory) {
        Access storage access = accessList[msg.sender][_documentID];
        //Hier wird auch nicht abgefragt ob er überhaupt Zugriff hatte.
        //Die Ausgabe Zugriff abgelaufen koennte etwas verwirrend sein....
        require(access.expiresAt > block.timestamp, "Zugriff abgelaufen");
        require(access.remainingUses > 0, "Kein Zugriff mehr uebrig");
        access.remainingUses -= 1;
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
