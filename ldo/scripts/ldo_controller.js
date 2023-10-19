const {network, ethers} = require("hardhat");
const hre = require("hardhat");

async function main() {
  await hre.network.provider.request({
    method: "hardhat_reset",
    params: [{
        forking: {
            jsonRpcUrl: "https://rpc.ankr.com/eth",
            blockNumber: 18385400
        }
    }]
  });

  // 添加ldo controller账户
  const ldoControllerAddress = "0xf73a1260d222f447210581DDf212D915c09a3249";
  await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [ldoControllerAddress],
  });
  await hre.network.provider.send("hardhat_setBalance", [
    ldoControllerAddress,
    "0x" + ethers.parseEther("1.0").toString(16),
  ]);
  const ldoControllerSigner = await ethers.getSigner(ldoControllerAddress);
  const balance = await ethers.provider.getBalance(ldoControllerAddress);
  console.log("ldo controller address: ", ldoControllerAddress);
  console.log("ldo controller balance of ETH: ", ethers.formatEther(balance));

  // contract
  const ldoAddress = "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32";
  const ldoContract = await ethers.getContractAt("MiniMeToken", ldoAddress);
  console.log("ldo token address: ", ldoAddress);

  // ldo controller transferFrom
  const fromAddress = "0x9Bb75183646e2A0DC855498bacD72b769AE6ceD3";
  const toAddress = "0xDE830Afa90E4b7097625272f6E8349C4AeC1D8cd";
  const amount = ethers.parseEther("100000.0");
  console.log("transfer from address: ", fromAddress);
  console.log("transfer to address: ", toAddress);
  console.log("transfer amount: ", ethers.formatEther(amount));
  {
    const fromAddressBalance = await ldoContract.balanceOf(fromAddress);
    const toAddressBalance = await ldoContract.balanceOf(toAddress);
    console.log("from address balance of ldo: ", ethers.formatEther(fromAddressBalance));
    console.log("to address balance of ldo: ", ethers.formatEther(toAddressBalance));
  }
  const tx = await ldoContract.connect(ldoControllerSigner).transferFrom(fromAddress, toAddress, amount);
  console.log("ldo transfer transaction: ", tx.hash);

  const txReceipt = await ethers.provider.getTransactionReceipt(tx.hash);
  console.log("ldo transfer transaction receipt: ", txReceipt);
  {
    const fromAddressBalance = await ldoContract.balanceOf(fromAddress);
    const toAddressBalance = await ldoContract.balanceOf(toAddress);
    console.log("from address balance of ldo: ", ethers.formatEther(fromAddressBalance));
    console.log("to address balance of ldo: ", ethers.formatEther(toAddressBalance));
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
