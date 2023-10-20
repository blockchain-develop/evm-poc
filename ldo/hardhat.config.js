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
      }
    ]
  },
  defaultNetwork: "mainnet",
  networks: {
    hardhat: {
    },
    mainnet: {
      url: "https://rpc.ankr.com/eth",
      accounts: ["4e077d7bf04156902c6310ac73e22e29e38fa8c27816e336a399447700a961f7"]
    }
  }
};
