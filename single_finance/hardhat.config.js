require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  defaultNetwork: "cronos",
  networks: {
    hardhat: {
    },
    cronos: {
      url: "https://evm.cronos.org",
      accounts: ["be0a5d9f38057fa406c987fd1926f7bfc49f094dc4e138fc740665d179e6a56a"]
    }
  }
};
