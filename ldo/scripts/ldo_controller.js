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
  const ldoControllerSigner = await ethers.getSigner(ldoControllerAddress);

  // ldo controller transferFrom
  const fromAddress = "0x9Bb75183646e2A0DC855498bacD72b769AE6ceD3";
  const toAddress = "0xDE830Afa90E4b7097625272f6E8349C4AeC1D8cd";
  const amount = ethers.parseEther("100000.0");
  {
    const fromAddressBalanceBefore = ldoContract.balanceOf(fromAddress);
    const toAddressBalanceBefore = ldoContract.balanceOf(toAddress);
    console.log("from address balance: ", fromAddressBalanceBefore, "to address balance: ", toAddressBalanceBefore);
  }
  const tx = await ldoContract.connect(ldoControllerSigner).transferFrom(fromAddress, toAddress, amount);
  console.log('ldo transfer transaction: ', tx);

  const txReceipt = await ethers.provider.getTransactionReceipt(tx.hash);
  console.log('ldo transfer transaction receipt', txReceipt);
  {
    const fromAddressBalanceBefore = ldoContract.balanceOf(fromAddress);
    const toAddressBalanceBefore = ldoContract.balanceOf(toAddress);
    console.log("from address balance: ", fromAddressBalanceBefore, "to address balance: ", toAddressBalanceBefore);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
