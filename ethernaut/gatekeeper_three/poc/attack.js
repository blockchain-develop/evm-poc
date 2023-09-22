const {
    network,
    ethers
} = require("hardhat");
const hre = require("hardhat");

async function main() {
    const [user] = await ethers.getSigners()
    const userAddress = await user.getAddress()
    console.log("user = ", userAddress)

    // deplay the contract
    const gateKeeperThreeContract = await ethers.deployContract("GatekeeperThree")
    const gateKeeperThreeAddress = await gateKeeperThreeContract.getAddress()
    console.log("contract = ", gateKeeperThreeAddress)

    const attackerContract = await ethers.deployContract("Attacker")
    const attackerAddress = await attackerContract.getAddress()
    console.log("attacker contract = ", attackerAddress)

    const attackTx = await attackerContract.execution(gateKeeperThreeAddress, {
        value: ethers.parseEther("1.0")
    })
    //
    const txReceipt = await ethers.provider.getTransactionReceipt(attackTx.hash).then((receipt) => {
        console.log("tx receipt = ", receipt)
    })
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});