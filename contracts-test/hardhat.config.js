require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-chai-matchers");
require("dotenv").config();

module.exports = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    //sepolia: {
    //  url: "https://eth-sepolia.g.alchemy.com/v2/4R9Qk8lhKPQ7Tfs7icy3np8BBUvy9mUc",
      //accounts: 4R9Qk8lhKPQ7Tfs7icy3np8BBUvy9mUc
    //}
  }
};
