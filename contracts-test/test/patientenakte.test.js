const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Patientenakte", function () {
  let patientenakte, fabrik, owner, doctor, otherDoctor;

  before(async function () {
    [owner, doctor, otherDoctor] = await ethers.getSigners();
    console.log("Owner:", owner.address);
    const FabrikPatientenakte = await ethers.getContractFactory("Patientenakte");
    fabrik = await FabrikPatientenakte.deploy(owner.address);
    await fabrik.waitForDeployment();

    const tx = await fabrik.createNewPatientenakte();
    await tx.wait();

    const patientenakteAddress = await fabrik.getPatientenakte(owner.address);
    patientenakte = await ethers.getContractAt("Patientenakte", patientenakteAddress);
  });

  it("sollte eine Patientenakte erstellen", async function () {
    expect(await patientenakte.patient()).to.equal(owner.address);
  });

  it("sollte Zugriff gewähren", async function () {
    const expiresAt = Math.floor(Date.now() / 1000) + 3600; // 1 Stunde gültig
    const remainingUses = 5;
    const documentID = 1;
    const encryptedKey = "test123";

    await patientenakte.grantAccess(doctor.address, documentID, expiresAt, remainingUses, encryptedKey);

    const access = await patientenakte.accessList(doctor.address, documentID);
    expect(access.expiresAt).to.equal(expiresAt);
    expect(access.remainingUses).to.equal(remainingUses);
  });

  it("sollte den Zugriff widerrufen", async function () {
    await patientenakte.revokeAccess(doctor.address, 1);
    const access = await patientenakte.accessList(doctor.address, 1);
    expect(access.expiresAt).to.equal(0); // Zugriff wurde gelöscht
  });
});
