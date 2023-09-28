const {
    network,
    ethers
} = require("hardhat");
const hre = require("hardhat");

async function main() {
    const [user] = await ethers.getSigners()
    const userAddr = await user.getAddress()
    console.log("user address = ", userAddr)

    //
    const transferInternalAddr = "0x3b406C944bd86d646904EDBbe9e4Be42b4281366"
    console.log("transfer internal contract address = ", transferInternalAddr)
    const transferInternalContract = await ethers.getContractAt("EthTransferInternal", transferInternalAddr)

    const transferExternalAddr = "0xbd7D6350e2966D952c2911e86aa109E31ddab8E1"
    console.log("transfer external contract address = ", transferExternalAddr)
    const transferExternalContract = await ethers.getContractAt("EthTransferExternal", transferExternalAddr)

    //
    const receipt = "0xb54EEFCe2c7e26704def13e71fb28C4467673d93"
    const tx = await transferExternalContract.execution(transferInternalAddr, receipt, {
        value: ethers.parseEther("0.1"),
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