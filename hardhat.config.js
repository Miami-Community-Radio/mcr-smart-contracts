/** @type import('hardhat/config').HardhatUserConfig */
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config({ path: ".env" });
console.log(process.env.ALCHEMY_API_KEY)
module.exports = {
  solidity: "0.8.7",
  networks : {
    hardhat:{
    },
    matic: {
      name: "matic",
      chainId: 137,
      ensAddress: "0xEAb36Ff364aD261dA4be2012487cABee1b302668",
      url: 'https://polygon-mainnet.g.alchemy.com/v2/ZnxEz25_mG4lajU2LvyUmnT-uWYlHF-n',
    },
  },
  etherscan: {
    apiKey: {
      polygon: "N6XGDJNY9QJ6USX77PY7H9T28HC16BHUW1",
    },
  },
  compilers: {
    solc: {
        version: "0.4.25",
    }
  }
  
};
