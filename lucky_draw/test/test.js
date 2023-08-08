const {network, ethers} = require("hardhat");
const hre = require("hardhat");


async function main() {
  //
  await hre.network.provider.request({
      method: "hardhat_reset",
      params: [{
          forking: {
              jsonRpcUrl:"https://rpc.ankr.com/eth",
              blockNumber: 17807829
          }
      }]
  })

  // import vars
  const [user] = await ethers.getSigners();

  // deplay the lottery contract
  const lottery = await ethers.deployContract("Lottery", ["0x514910771AF9Ca656af840dff83E8264EcF986CA", "0x5A861794B927983406fCE1D062e00b9368d97Df6", ""]);
  const lotteryContract = await lottery.getAddress();
  console.log("lottery contract:", lotteryContract);
  
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
