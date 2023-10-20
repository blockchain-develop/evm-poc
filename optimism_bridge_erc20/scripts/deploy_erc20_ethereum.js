// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const [user] = await ethers.getSigners();
  const userAddress = await user.getAddress();
  console.log("user address:", userAddress);

  const erc20Contract = await ethers.deployContract("PhemexToken", [userAddress]);
  await erc20Contract.waitForDeployment();
  const erc20Address = await erc20Contract.getAddress();
  console.log(`erc20 token deployed to ${erc20Address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
