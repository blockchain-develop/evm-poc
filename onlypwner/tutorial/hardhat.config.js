require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  defaultNetwork: "onlypwner",
  networks: {
    hardhat: {
    },
    onlypwner: {
      url: "https://nodes.onlypwner.xyz/rpc/f4e45b1b-098a-4c64-9ad0-43274661677f",
      accounts: ["be0a5d9f38057fa406c987fd1926f7bfc49f094dc4e138fc740665d179e6a56a"]
    }
  }
};
