const hre = require("hardhat");

async function main() {
    const Patientenakte = await hre.ethers.getContractFactory("Patientenakte");
    //console.log(Patientenakte);
    const ownAddress = "0x71089Ba41e478702e1904692385Be3972B2cBf9e";
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
