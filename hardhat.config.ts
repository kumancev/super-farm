import "@nomiclabs/hardhat-waffle"
import "@nomiclabs/hardhat-ethers";

require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.4",
  networks: {
    kovan: {
      gas: "auto",
      gasPrice: "auto",
      url: process.env.KOVAN_API,
      accounts: [`0x${process.env.PRIVATE_KEY}`]
    }
  },
  etherscan: {
		apiKey: process.env.ETHERSCAN_KEY,
	},
};
