const {network, ethers} = require("hardhat");
const hre = require("hardhat");


async function main() {
  // user
  const userAddress = "0xDE830Afa90E4b7097625272f6E8349C4AeC1D8cd";
  console.log("user address: ", userAddress);

  // contract
  const ldoAddress = "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32";
  const ldoContract = await ethers.getContractAt("MiniMeToken", ldoAddress);
  console.log("ldo contract address: ", ldoAddress);
  
  // token name
  const ldoTokenName = await ldoContract.name();
  console.log("ldo token name: ", ldoTokenName);

  // ldo balance
  const userBalance = await ldoContract.balanceOf(userAddress);
  console.log("user ldo balance: ", userBalance);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
