const {network, ethers} = require("hardhat");
const hre = require("hardhat");


async function main() {
  // user
  const userAddress = "0xDE830Afa90E4b7097625272f6E8349C4AeC1D8cd";
  console.log("user address: ", userAddress);

  // contract
  const controllerProxyAddress = "0xf73a1260d222f447210581DDf212D915c09a3249";
  const controllerAddress = "0xde3A93028F2283cc28756B3674BD657eaFB992f4";
  const controllerContract = await ethers.getContractAt("TokenManager", controllerProxyAddress);
  console.log("controller contract address: ", controllerProxyAddress);
  
  // token
  const tokenAddress = await controllerContract.token();
  console.log("ldo token address: ", tokenAddress);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
