const {network, ethers} = require("hardhat");
const hre = require("hardhat");


async function main() {
  const [user] = await ethers.getSigners()
  const userAddress = await user.getAddress()
  console.log("user = ", userAddress)
  //
  // 执行
  //
  const tutorialAddress = "0x78aC353a65d0d0AF48367c0A16eEE0fbBC00aC88"
  console.log("contract = ", tutorialAddress)
  const tutorialContract = await ethers.getContractAt("ITutorial", tutorialAddress)
  //
  let callMeTx = await tutorialContract.connect(user).callMe()
  console.log("callMe tx = ", callMeTx.hash)
  //
  const callMeTxReceipt = await ethers.provider.getTransactionReceipt(callMeTx.hash).then((receipt) => {
    console.log("callMe tx receipt = ", receipt)
  })
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
