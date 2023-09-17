const {network, ethers} = require("hardhat");
const hre = require("hardhat");


async function main() {
  // import vars
  const [user] = await ethers.getSigners();
  const userAddress = await user.getAddress();
  console.log("user address:", userAddress);

  //
  const contract = await ethers.deployContract("Final");
  const contractAddress = await contract.getAddress();
  console.log("contract address:", contractAddress);

  //
  // 执行
  //
  //
  const attackTx = await contract.destroy();
  console.log(`tx hash: ${attackTx.hash}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
