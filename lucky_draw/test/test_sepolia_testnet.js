const {network, ethers} = require("hardhat");
const hre = require("hardhat");


async function main() {
  // import vars
  const [user] = await ethers.getSigners();

  // deplay the lottery contract
  const linkAddress = "0x779877A7B0D9E8603169DdbD7836e478b4624789";
  const wrapperAddress = "0xab18414CD93297B0d12ac29E63Ca20f515b3DB46";
  const soulpassAddress = "0xaf6e3549084896e930cdd529cbf49c47b0b26c22";
  const totalRounds = 10;
  const lotteryAmount = 1000000000000000;
  const lotteryFactory = await ethers.getContractFactory("Lottery");
  const lotteryContract = await lotteryFactory.deploy(linkAddress, wrapperAddress, soulpassAddress, totalRounds, lotteryAmount);
  const lotteryContractAddress = lotteryContract.address;
  console.log("lottery contract:", lotteryContractAddress);
  
  // config lotteryContract with 100 ETH
  await ethers.provider.send("hardhat_setBalance", [lotteryContract, "0x56BC75E2D63100000"]); // 100 ETH
 
  // 执行
  const data = await lottery.getLatestData();
  console.log("data: ", data);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
