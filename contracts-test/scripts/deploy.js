const hre = require("hardhat");

async function main() {
   
    const FabrikPatientenakte = await hre.ethers.getContractFactory("FabrikPatientenakte");
    const fabrikpatientenakte = await FabrikPatientenakte.deploy();
    await fabrikpatientenakte.waitForDeployment();
    console.log("FabrikPatientenakte deployed to:", await fabrikpatientenakte.getAddress());
    
    /*
    //Kann einkommentiert werden falls Patientenakte manuel deployed werden soll

    const Patientenakte = await hre.ethers.getContractFactory("Patientenakte");
    console.log(Patientenakte);
    const ownAddress = "0x5bc144b4518673f55d6773d5386265797df147e4";
    console.log("owa", ownAddress);
    const patientenakte = await Patientenakte.deploy(ownAddress);
    console.log(patientenakte);
    await patientenakte.waitForDeployment();
    console.log(patientenakte);
    console.log("Patientenakte deployed to:", await patientenakte.getAddress());
    */
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

