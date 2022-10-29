// this is the dev script which deploys MockV3Agg contract

const { network } = require("hardhat");
const {
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
} = require("../helper-hardhat-config");
module.exports = async (hre) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainName = network.name;

  if (developmentChains.includes(chainName)) {
    log("local network detected ! Deploying the Mock Aggregator..");
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_ANSWER],
    });
    log("Mocks Deployed !!");
    log(
      "---------------------------------------------****-------------------------------------------"
    );
  }
};
module.exports.tags = ["all", "mocks"];
