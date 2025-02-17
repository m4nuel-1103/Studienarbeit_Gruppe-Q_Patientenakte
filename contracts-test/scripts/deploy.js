const hre = require("hardhat");

async function main() {
    const Patientenakte = await hre.ethers.getContractFactory("Patientenakte");
    //console.log(Patientenakte);
    const ownAddress = "0x5bc144b4518673f55d6773D5386265797df147e4";
    console.log("owa", ownAddress);
    const patientenakte = await Patientenakte.deploy(ownAddress);
    //console.log(patientenakte);
    await patientenakte.waitForDeployment();
    console.log(patientenakte);
    console.log("Patientenakte deployed to:", await patientenakte.getAddress());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
