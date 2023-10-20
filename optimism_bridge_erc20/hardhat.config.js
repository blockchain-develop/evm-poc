require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.9"
      },
      {
        version: "0.4.24"
      },
      {
        version: "0.8.15"
      }
    ]
  },
  networks: {
    'ethereum-goerli': {
      chainId: 5,
      url: "https://rpc.ankr.com/eth_goerli",
      accounts: ["b26303d58fe520bceec6d391bd5dca4216c2a7702c4b32f7ac7378d367d060b3"]
    },
    'optimism-goerli': {
      chainId: 420,
      url: "https://goerli.optimism.io",
      accounts: ["b26303d58fe520bceec6d391bd5dca4216c2a7702c4b32f7ac7378d367d060b3"],
      gasPrice: 1000000000
    }
  },
};
