// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [user] = await ethers.getSigners();
  const userAddress = await user.getAddress();
  console.log("user address:", userAddress);

  const crossAddress = "0x4200000000000000000000000000000000000012";
  fname = "node_modules/@eth-optimism/contracts-bedrock/forge-artifacts/OptimismMintableERC20Factory.sol/OptimismMintableERC20Factory.json"
  ftext = fs.readFileSync(fname).toString().replace(/\n/g, "")
  optimismMintableERC20FactoryData = JSON.parse(ftext)
  optimismMintableERC20Factory = new ethers.Contract(
    crossAddress, 
    optimismMintableERC20FactoryData.abi, 
    user)
  console.log("cross chain address: ", crossAddress);

  //
  const erc20TokenAddress = "0xE19D6aAa935C4c346D815CBA6854cA9117e2a89F";
  const erc20TokenName = "Phemex Token";
  const erc20TokenSymbol = "PT";
  const tx = await optimismMintableERC20Factory.createOptimismMintableERC20(
    erc20TokenAddress,
    erc20TokenName,
    erc20TokenSymbol
  );
  console.log("cross transaction: ", tx.hash);
  
  //
  const txReceipt = await ethers.provider.getTransactionReceipt(tx.hash);
  console.log("cross transaction receipt: ", txReceipt);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
