//import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Patientenakte", function () {
  async function deployFixture() {
    const [patient, doctor1, doctor2, unauthorizedPerson] = await ethers.getSigners();
    const Patientenakte = await ethers.getContractFactory("Patientenakte");
    const patientenakte = await Patientenakte.deploy(patient.address);
    await patientenakte.waitForDeployment();
    return { patientenakte, patient, doctor1, doctor2, unauthorizedPerson };
  }

  it("soll den Patienten als Owner setzen", async function () {
    const { patientenakte, patient } = await deployFixture();
    expect(await patientenakte.patient()).to.equal(patient.address);
  });

  it("soll Zugriff für einen Arzt gewähren", async function () {
    const { patientenakte, patient, doctor1 } = await deployFixture();
    const documentID = 1;
    const expiresAt = Math.floor(Date.now() / 1000) + 3600;
    const remainingUses = 5;
    const expiresFlag = false;
    const usesFlag = false;
    const encryptedKey = "geheimerSchlüssel";

    await expect(
      patientenakte.connect(patient).grantAccess(doctor1.address, documentID, expiresAt, remainingUses, expiresFlag, usesFlag, encryptedKey)
    )
      .to.emit(patientenakte, "AccessGranted")
      .withArgs(doctor1.address, documentID, expiresAt, remainingUses, expiresFlag, usesFlag);
  });

  it("soll erlauben, Zugriff für mehrere Ärzte gleichzeitig zu gewähren", async function () {
    const { patientenakte, patient, doctor1, doctor2 } = await deployFixture();
    const documentIDs = [1, 2];
    const doctors = [doctor1.address, doctor2.address];
    const expiresAt = Math.floor(Date.now() / 1000) + 3600;
    const remainingUses = 5;
    const expiresFlag = false;
    const usesFlag = false;
    const encryptedKeys = ["key1", "key2"];

    await expect(
      patientenakte.connect(patient).grantMultiAccess(doctors, documentIDs, expiresAt, remainingUses, expiresFlag, usesFlag, encryptedKeys)
    )
      .to.emit(patientenakte, "AccessGranted");
  });

  it("soll Zugriff korrekt überprüfen", async function () {
    const { patientenakte, patient, doctor1 } = await deployFixture();
    const documentID = 1;
    const expiresAt = Math.floor(Date.now() / 1000) + 3600;
    const remainingUses = 5;
    const expiresFlag = false;
    const usesFlag = false;
    const encryptedKey = "geheimerSchlüssel";

    await patientenakte.connect(patient).grantAccess(doctor1.address, documentID, expiresAt, remainingUses, expiresFlag, usesFlag, encryptedKey);

    expect(await patientenakte.connect(doctor1).hasAccess(documentID)).to.equal(true);
  });

  it("soll den Zugriff entfernen", async function () {
    const { patientenakte, patient, doctor1 } = await deployFixture();
    const documentID = 1;
    const expiresAt = Math.floor(Date.now() / 1000) + 3600;
    const remainingUses = 5;
    const expiresFlag = false;
    const usesFlag = false;
    const encryptedKey = "geheimerSchlüssel";

    await patientenakte.connect(patient).grantAccess(doctor1.address, documentID, expiresAt, remainingUses, expiresFlag, usesFlag, encryptedKey);
    await patientenakte.connect(patient).revokeAccess(doctor1.address, documentID);

    expect(await patientenakte.connect(doctor1).hasAccess(documentID)).to.equal(false);
  });

  it("soll das Event 'AccessUsed' auslösen, wenn ein Arzt Zugriff nutzt", async function () {
    const { patientenakte, patient, doctor1 } = await deployFixture();
    const documentID = 1;
    const expiresAt = Math.floor(Date.now() / 1000) + 3600;
    const remainingUses = 5;
    const expiresFlag = false;
    const usesFlag = false;
    const encryptedKey = "geheimerSchlüssel";

    await patientenakte.connect(patient).grantAccess(doctor1.address, documentID, expiresAt, remainingUses, expiresFlag, usesFlag, encryptedKey);
    const tx = await patientenakte.connect(doctor1).useAccess(documentID);
    await expect(tx)
      .to.emit(patientenakte, "AccessUsed")
      .withArgs(doctor1.address, documentID, expiresAt, remainingUses - 1);
  });
  it("soll nicht erlauben, dass eine andere Person Zugriff gewährt", async function () {
    const { patientenakte, doctor1, unauthorizedPerson } = await deployFixture();
    
    const documentID = 1;
    const expiresAt = (await ethers.provider.getBlock("latest")).timestamp + 3600; // 1 Stunde in Zukunft
    const remainingUses = 5;
    const expiresFlag = false;
    const usesFlag = false;
    const encryptedKey = "dummyKey";

    // Erwartung: Die Transaktion sollte fehlschlagen, weil `unauthorizedPerson` nicht der Patient ist
    await expect(
      patientenakte.connect(unauthorizedPerson).grantAccess(doctor1.address, documentID, expiresAt, remainingUses, expiresFlag, usesFlag, encryptedKey)
    ).to.be.revertedWith("Nur der Patient kann Zugriff gewaehren");
  });

});
