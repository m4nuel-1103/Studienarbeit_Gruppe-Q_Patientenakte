const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Patientenakte über FabrikPatientenakte", function () {
    let Patientenakte, FabrikPatientenakte, fabrikContract, patientenakteContract;
    let owner, patient, doctor;

    beforeEach(async function () {
        [owner, patient, doctor] = await ethers.getSigners();

        // 1️⃣ FabrikPatientenakte deployen
        FabrikPatientenakte = await ethers.getContractFactory("FabrikPatientenakte");
        fabrikContract = await FabrikPatientenakte.deploy();
        await fabrikContract.waitForDeployment();

        // 2️⃣ Neue Patientenakte für `patient` über die Fabrik erstellen
        await fabrikContract.connect(patient).createNewPatientenakte();

        // 3️⃣ Die Adresse der erstellten Patientenakte abrufen
        const patientenakteAdresse = await fabrikContract.getPatientenakte(patient.address);
        expect(patientenakteAdresse).to.not.equal(ethers.ZeroAddress);

        // 4️⃣ Patientenakte-Vertrag mit der erhaltenen Adresse verbinden
        Patientenakte = await ethers.getContractFactory("Patientenakte");
        patientenakteContract = await Patientenakte.attach(patientenakteAdresse);
    });

    it("sollte den richtigen Besitzer haben", async function () {
        expect(await patientenakteContract.patient()).to.equal(patient.address);
    });

    it("sollte einem Arzt Zugriff auf ein Dokument gewähren", async function () {
        const documentID = 1;
        const expiresAt = Math.floor(Date.now() / 1000) + 3600; // Ablauf in 1 Stunde
        const remainingUses = 5;
        const encryptedKey = "verschlüsselterSchlüssel";

        await patientenakteContract.connect(patient).grantAccess(
            doctor.address,
            documentID,
            expiresAt,
            remainingUses,
            false,
            false,
            encryptedKey
        );

        const access = await patientenakteContract.accessList(doctor.address, documentID);
        expect(access.expiresAt).to.equal(expiresAt);
        expect(access.remainingUses).to.equal(remainingUses);
        expect(access.encryptedKey).to.equal(encryptedKey);
    });

    it("sollte Zugriff korrekt entziehen", async function () {
        const documentID = 1;
        await patientenakteContract.connect(patient).grantAccess(
            doctor.address, documentID, 
            Math.floor(Date.now() / 1000) + 3600, 
            5, false, false, "testKey"
        );

        await patientenakteContract.connect(patient).revokeAccess(doctor.address, documentID);
        const access = await patientenakteContract.accessList(doctor.address, documentID);
        expect(access.expiresAt).to.equal(0); // Zugriff wurde gelöscht
    });

    it("sollte nur der Patient Zugriff gewähren können", async function () {
        await expect(
            patientenakteContract.connect(doctor).grantAccess(
                doctor.address, 1, 
                Math.floor(Date.now() / 1000) + 3600, 
                5, false, false, "testKey"
            )
        ).to.be.revertedWith("Nur der Patient kann Zugriff gewaehren");
    });

    it("sollte `hasAccess` korrekt zurückgeben", async function () {
        const documentID = 2;
        const expiresAt = Math.floor(Date.now() / 1000) + 3600; // Ablauf in 1 Stunde
        const remainingUses = 3;
        const encryptedKey = "testKey";

        await patientenakteContract.connect(patient).grantAccess(
            doctor.address,
            documentID,
            expiresAt,
            remainingUses,
            false,
            false,
            encryptedKey
        );

        const hasAccess = await patientenakteContract.connect(doctor).hasAccess(documentID);
        expect(hasAccess).to.be.true;
    });

    it("sollte `useAccess` korrekt reduzieren", async function () {
        const documentID = 3;
        const expiresAt = Math.floor(Date.now() / 1000) + 3600; // Ablauf in 1 Stunde
        const remainingUses = 2;
        const encryptedKey = "testKey";

        await patientenakteContract.connect(patient).grantAccess(
            doctor.address,
            documentID,
            expiresAt,
            remainingUses,
            false,
            false,
            encryptedKey
        );

        // 1. Zugriff nutzen
        const key1 = await patientenakteContract.connect(doctor).useAccess(documentID);
        expect(key1).to.equal(encryptedKey);

        // 2. Zugriff nutzen (Restanzahl muss 1 sein)
        const key2 = await patientenakteContract.connect(doctor).useAccess(documentID);
        expect(key2).to.equal(encryptedKey);

        // 3. Dritter Versuch schlägt fehl (keine Zugriffe mehr)
        await expect(patientenakteContract.connect(doctor).useAccess(documentID))
            .to.be.revertedWith("Keine Zugriffe uebrig");
    });
});
