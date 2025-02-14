// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PatientDataAccess {
    struct AccessPermission {
        uint256 expiresAt;  // Zeitstempel, bis zu dem der Zugriff erlaubt ist
        uint256 remainingAccesses; // Anzahl der verbleibenden Zugriffe
    }

    address public patient;
    mapping(address => mapping(bytes32 => AccessPermission)) public permissions;

    event AccessGranted(address indexed doctor, bytes32 indexed dataId, uint256 expiresAt, uint256 accesses);
    event AccessRevoked(address indexed doctor, bytes32 indexed dataId);

    modifier onlyPatient() {
        require(msg.sender == patient, "Only the patient can call this.");
        _;
    }

    constructor() {
        patient = msg.sender;
    }

    // Zugriff erlauben
    function grantAccess(
        address doctor,
        bytes32 dataId,
        uint256 duration,
        uint256 accesses
    ) public onlyPatient {
        permissions[doctor][dataId] = AccessPermission(
            block.timestamp + duration,
            accesses
        );
        emit AccessGranted(doctor, dataId, block.timestamp + duration, accesses);
    }

    // Zugriff widerrufen
    function revokeAccess(address doctor, bytes32 dataId) public onlyPatient {
        delete permissions[doctor][dataId];
        emit AccessRevoked(doctor, dataId);
    }

    // Zugriff überprüfen
    function checkAccess(address doctor, bytes32 dataId) public view returns (bool) {
        AccessPermission memory permission = permissions[doctor][dataId];
        if (permission.expiresAt > block.timestamp && permission.remainingAccesses > 0) {
            return true;
        }
        return false;
    }

    // Zugriff konsumieren (vom Client oder extern aufgerufen)
    function consumeAccess(address doctor, bytes32 dataId) public {
        require(checkAccess(doctor, dataId), "Access denied");
        permissions[doctor][dataId].remainingAccesses -= 1;
    }
}
