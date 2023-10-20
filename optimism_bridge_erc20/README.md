# how to bridge standard erc20 from ethereum to optimism

## 工程配置
我们准备使用hardhat工具来完成，首先需要创建hardhat工程，准备好工作目录，然后创建hardhat工程
```
npm init
npm install --save-dev hardhat
npx hardhat
```

安装openzeppelin合约，因为我做测试用的erc20合约引入了openzeppelin
```
npm install @openzeppelin/contracts
```

测试用的是ethereum测试网goerli，对应的optimism测试网也是goerli，在hardhat的工程配置文件中配置network，包括节点的url和准备使用的accounts。
添加你的erc20合约所使用的solidity编译器版本。
```
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
  networks: {
    'optimism-goerli': {
      chainId: 420,
      url: `https://opt-goerli.g.alchemy.com/v2/${process.env.L2_ALCHEMY_KEY}`,
      accounts: { mnemonic: process.env.MNEMONIC }
    },
    'optimism-mainnet': {
      chainId: 10,
      url: `https://opt-mainnet.g.alchemy.com/v2/${process.env.L2_ALCHEMY_KEY}`,
      accounts: { mnemonic: process.env.MNEMONIC }
    }
  },
};
```

## 准备
我在hardhat中的ethereum goerli和optimism goerli两个链上都配置了同一个账户，地址为0xDE830Afa90E4b7097625272f6E8349C4AeC1D8cd。
因为会在ethereum goerli和optimism goerli发送交易，在这两个链上都需要给账户充值ETH，用作交易GAS。

## erc20 on ethereum
获取你的erc20合约地址，如果是做测试，则部署你的erc20合约，以下部署新的erc20合约到ethereum测试网goerli
```
npx hardhat run ./scripts/deploy_erc20_ethereum.js --network ethereum-goerli
```
我部署的erc20 token地址为0xE19D6aAa935C4c346D815CBA6854cA9117e2a89F，并且地址0xDE830Afa90E4b7097625272f6E8349C4AeC1D8cd有1b的balance。

## 准备ethereum的跨链
我们的erc20合约，只会在L1和L2之间deposit，withdraw，所以使用optimism已有的OptimismMintableERC20Factory来进行跨链。
```
npx hardhat run ./scripts/ethereum_cross_deploy.js --network optimism-goerli
```

在optimism goerli测试网，部署了etheruem goerli测试网上erc20 token 0xE19D6aAa935C4c346D815CBA6854cA9117e2a89F的映射token 0x620FeE324374eACbe4ca2Bc1c786D6AACDCc7222。



