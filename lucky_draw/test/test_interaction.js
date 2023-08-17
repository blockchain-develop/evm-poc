const { ethers, BigNumber } = require('hardhat');
const helpers = require("@nomicfoundation/hardhat-network-helpers");

async function interact() {
    await hre.network.provider.request({
        method: "hardhat_reset",
        params: [{
            forking: {
                jsonRpcUrl:"https://rpc.ankr.com/eth",
                blockNumber: 17932091
            }
        }]
    })

    // 添加owner账户和operator账户
    const ownerAddress = "0x6B5E838e2B15AeE68eB41F509101F956C4F2811f";
    await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [ownerAddress],
    });
    const owner = await ethers.getSigner(ownerAddress);

    const operatorAddress = "0xADd766b32E115fC1b680368887BC27E564C188A1";
    await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [operatorAddress],
    });
    const operator = await ethers.getSigner(operatorAddress);

    //
    const luckydrawAddress = "0xe390C6B44bA0af0f14d5fd3B15D73aDF04480ebb";
    const luckydrawFactory = await ethers.getContractFactory("LuckyDraw");
    console.log("lucky draw contract:", luckydrawFactory);

    //
    const luckydraw = luckydrawFactory.attach(luckydrawAddress);

    {
      let ownerAddress1 = await luckydraw.owner();
      let operatorAddress1 = await luckydraw.operator();
      let startTimestamp1 = await luckydraw.startTimestamp();
      let endTimestamp1 = await luckydraw.endTimestamp();
      console.log(`luckydraw: ${luckydrawAddress}, owner: ${ownerAddress1}, operator: ${operatorAddress1}, startTimestamp: ${startTimestamp1}, endTimestamp: ${endTimestamp1}`);
    }

    // check operator balance and owner balance
    const luckdrawBalance = await ethers.provider.getBalance(luckydraw.getAddress());
    const operatorBalance = await ethers.provider.getBalance(operator);
    console.log(`lucky draw eth balance: ${luckdrawBalance}, operator eth balance: ${operatorBalance}`);

    //
    // 一些有用的函数
    const toBytes32 = (bn) => {
      return ethers.hexlify(ethers.zeroPadValue(ethers.toBeHex(BigInt(bn)), 32));
    };
    const setStorageAt = async (address, index, value) => {
      console.log(address);
      console.log(index);
      console.log(value);
      await ethers.provider.send("hardhat_setStorageAt", [address, index, value]);
    }

    /*
    // 下面的修改涉及到EVM的存储，请参考EVM存储
    //
    let index = 8;
    const startTimestampIndex = "0x" + index.toString(16);
    const startTimestamp = toBytes32(1692270000).toString();
    await setStorageAt(luckydrawAddress, startTimestampIndex, startTimestamp);

    //
    {
      let ownerAddress1 = await luckydraw.owner();
      let operatorAddress1 = await luckydraw.operator();
      let startTimestamp1 = await luckydraw.startTimestamp();
      let endTimestamp1 = await luckydraw.endTimestamp();
      console.log(`luckydraw: ${luckydrawAddress}, owner: ${ownerAddress1}, operator: ${operatorAddress1}, startTimestamp: ${startTimestamp1}, endTimestamp: ${endTimestamp1}`);
    }
    */

    const newTimestamp = 1693440000;
    await helpers.time.increaseTo(newTimestamp);

    // estimate gas
    //const gasLimit = await luckydraw.connect(operator).estimateGas.requestDraw(1, 500000, 5600);
    const fee = await ethers.provider.getFeeData();
    // request draw
    let requestDrawTx = await luckydraw.connect(operator).requestDraw(1, 500000, 5600, {
      gasPrice: fee.gasPrice,
      //gasLimit: gasLimit * 2,
    });
    console.log(`requestDraw tx hash: ${requestDrawTx.hash}`);
}

(async () => {
    await interact();
})();