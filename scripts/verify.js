const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });
require("@nomiclabs/hardhat-etherscan");
 

async function main() {
// Verify the contract after deploying
await hre.run("verify:verify", {
    address: "0x7021F99161e24D42712a6a572aB7315C8Da190F2",
    constructorArguments: ["https://i.seadn.io/gcs/files/b1e04358b8688bc19ec4938005fe9967.png?auto=format&w=1920"],
    customChains: [],
    contract:"contracts/ERC1155.sol:MCRERC1155"
  });
}
// Call the main function and catch if there is any error
main()
  .then(() => process.exit(0))
  .catch((error) => {
  console.error(error);
  process.exit(1);
});