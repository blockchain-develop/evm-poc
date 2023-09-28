const {
    network,
    ethers
} = require("hardhat");
const hre = require("hardhat");

async function main() {
    const [deployer, user] = await ethers.getSigners()
    const deployerAddr = await deployer.getAddress()
    const userAddr = await user.getAddress()
    console.log("deployer address = ", deployerAddr, "user address = ", userAddr)

    // deplay the contract
    const transferInternalContract = await ethers.deployContract("EthTransferInternal")
    const transferInternalAddr = await transferInternalContract.getAddress()
    console.log("transfer internal contract address = ", transferInternalAddr)

    const transferExternalContract = await ethers.deployContract("EthTransferExternal")
    const transferExternalAddr = await transferExternalContract.getAddress()
    console.log("transfer external contract address = ", transferExternalAddr)

    const tx = await transferExternalContract.execution(transferInternalAddr, userAddr, {
        value: ethers.parseEther("10.0"),
    })
    await ethers.provider.getTransactionReceipt(tx.hash).then((receipt) => {
        console.log("tx receipt = ", receipt)
    })
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});