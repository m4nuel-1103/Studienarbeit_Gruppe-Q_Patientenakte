/*const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("FabrikPatientenakte", function () {

    async function fixedValue() {//Funktion für die Festlegung eines festen Wertes
        //so kann jeder Test auf den gleichen Wert zugreifen
        const [owner, badOwner] = await ethers.getSigners();
        console.log("Owner:", owner.address);
        const FabricOfPatientenakte = await ethers.getContractFactory("FabrikPatientenakte");
        const fabricOfPatientenakte = await FabricOfPatientenakte.deploy();
        await fabricOfPatientenakte.deployed();
        return {owner, badOwner, fabricOfPatientenakte};
    }
    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            const {owner, fabricOfPatientenakte} = await fixedValue();
            console.log("Owner:", owner.address);
            expect(await fabricOfPatientenakte.owner()).to.equal(owner.address);
        });
    });
    
});	
*/

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FabrikPatientenakte", function () {
    let FabrikPatientenakte, fabrikContract, owner, patient;

    beforeEach(async function () {
        [owner, patient] = await ethers.getSigners();
        FabrikPatientenakte = await ethers.getContractFactory("FabrikPatientenakte");
        fabrikContract = await FabrikPatientenakte.deploy();
        await fabrikContract.waitForDeployment();
    });

    it("sollte eine neue Patientenakte erstellen", async function () {
        // Aufruf der createNewPatientenakte Funktion
        await fabrikContract.createNewPatientenakte();

        // Überprüfen, ob die Patientenakte-Adresse gespeichert wurde
        const akteAdresse = await fabrikContract.patientenakte(owner.address);
        expect(akteAdresse).to.not.equal(ethers.AddressZero);
    });

    it("sollte die erstellte Patientenakte abrufen können", async function () {
        await fabrikContract.connect(patient).createNewPatientenakte();
        const akteAddress = await fabrikContract.getPatientenakte(patient.address);

        expect(akteAddress).to.not.equal(ethers.ZeroAddress);
        expect(akteAddress).to.be.properAddress;
    });

    it("sollte nicht erlauben, mehrere Akten für denselben Patienten zu erstellen", async function () {
        await fabrikContract.connect(patient).createNewPatientenakte();
        await expect(fabrikContract.connect(patient).createNewPatientenakte())
            .to.be.revertedWith("Patientenakte ist bereits erstellt");
    });
});
