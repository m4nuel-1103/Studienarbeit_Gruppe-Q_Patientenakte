require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.28",
  networks: {
    hardhat: {},
    sepolia: {
      url: process.env.ALCHEMY_API,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
