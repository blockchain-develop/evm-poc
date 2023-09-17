const {network, ethers} = require("hardhat");
const hre = require("hardhat");


async function main() {
  const [user] = await ethers.getSigners()
  const userAddress = await user.getAddress()
  console.log("user = ", userAddress)
  //
  // 执行
  //
  const vaultAddress = "0x78aC353a65d0d0AF48367c0A16eEE0fbBC00aC88"
  console.log("contract = ", vaultAddress.toString())
  const vaultContract = await ethers.getContractAt("IVault", vaultAddress);
  //
  const vaultBalanceBefore = await ethers.provider.getBalance(vaultAddress)
  console.log("vault balance before is", vaultBalanceBefore)
  //
  let withdrawTx = await vaultContract.connect(user).withdraw(vaultBalanceBefore)
  console.log("withdraw tx = ", withdrawTx.hash)
  //
  const withdrawTxReceipt = await ethers.provider.getTransactionReceipt(withdrawTx.hash);
  console.log("withdraw tx receipt", withdrawTxReceipt);
  //
  const vaultBalanceAfter = await ethers.provider.getBalance(vaultAddress)
  console.log("vault balance after is", vaultBalanceAfter) 
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
