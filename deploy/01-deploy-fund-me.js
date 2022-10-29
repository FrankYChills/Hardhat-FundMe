/* function deployFunc() {
  console.log("Hello are you deploying me :)");
}
module.exports.default = deployFunc;
*/

// Main deployment script

// all thse configs eg. network below are coming from hardhat.config.js which is a entrypoint file when we deploy
const { network } = require("hardhat");
const { verify } = require("../utils/verify");

module.exports = async (hre) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  const {
    networkConfig,
    developmentChains,
  } = require("../helper-hardhat-config");

  // if chainId is X use address A
  // if chainId is Y use address B
  let ethUSDPriceFeedAddress;

  //if the contract doesnt exists like when we are working in localhost/hardhat, we have to deploy the minimal version of it for our localhost
  // when working in a localhost or hardhat network we want/have to use Mock

  if (developmentChains.includes(network.name)) {
    // get the latest deployed contract(Mock V3 contract here)
    const ethUSDAggregator = await deployments.get("MockV3Aggregator");

    // get the MockV3Agg contract address
    ethUSDPriceFeedAddress = ethUSDAggregator.address;
    log(ethUSDPriceFeedAddress);
  } else {
    // here we are deploying to testnet or mainnet where V3Contract is already available
    ethUSDPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeedAddress"];
  }
  const args = [ethUSDPriceFeedAddress];
  const fundMe = await deploy("FundMe", {
    contract: "FundMe",
    from: deployer,
    args: args, //this is the address that we pass to fundme constructor
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  // after deploying verify the contract manually(only in testnets/mainnets[ETHERSCAN API KEY NEEDED])
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(fundMe.address, args);
  }

  log("-----------------------------------^^&&^^-------------------------");
};
module.exports.tags = ["all", "fundme"];
