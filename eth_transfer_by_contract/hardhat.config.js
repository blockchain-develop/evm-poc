require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
    },
    sepolia: {
      url: "https://sepolia.infura.io/v3/dbdf5388d0934810962da46d5d7a8f23",
      accounts: ["4e077d7bf04156902c6310ac73e22e29e38fa8c27816e336a399447700a961f7"]
    }
  }
};
