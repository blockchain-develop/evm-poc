// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [user] = await ethers.getSigners();
  const userAddress = await user.getAddress();
  console.log("user address:", userAddress);

  //
  const hash = "0xf10acb65b9aa42f613e011ac33b0681311461a5c78d757a445ecfcadc493883e";
  const txReceipt = await ethers.provider.getTransactionReceipt(hash);
  console.log("cross transaction receipt: ", txReceipt);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
