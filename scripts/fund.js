const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
  const { deployer } = await getNamedAccounts();
  const sendValue = "35000000000000000";
  const fundMe = await ethers.getContract("FundMe", deployer);
  console.log("Funding the contract ...");
  const txResponse = await fundMe.fund({ value: sendValue });
  await txResponse.wait(1);
  console.log("Contract funded :) ");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
