// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "./Patientenakte.sol";

contract FabrikPatientenakte {
    //address public patient= msg.sender; wird nie verwendet
    //Mapping: (Patientenadresse ==> Adresse seines Patientenakte-Vertrags
    mapping(address => address) public patientenakte;
    
    event PatientenakteErstellt(address indexed _patient, address patientenakteContract);
    //event DebugEvent(address indexed _patient, address patientenakteContract);

    function createNewPatientenakte() public {
        //emit DebugEvent(msg.sender, patientenakte[msg.sender]);
        require(patientenakte[msg.sender] == address(0), "Patientenakte ist bereits erstellt");
        Patientenakte neueAkte = new Patientenakte(msg.sender);
        patientenakte[msg.sender] = address(neueAkte);
        emit PatientenakteErstellt(msg.sender, address(neueAkte));
    }
    function getPatientenakte(address _patient) public view returns (address) {
        require(patientenakte[_patient]  != address(0), "Patient hat keine Akte");
        return patientenakte[_patient];
    }
}