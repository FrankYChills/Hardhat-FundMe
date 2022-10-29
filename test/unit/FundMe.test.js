const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");

const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function () {
      let fundMe;
      let deployer;
      let mockV3Aggregator;
      //"33000000000000000" //Wei - 0.033ETH = $50
      //sendValue = ethers.utils.parseEther("0.033")
      const sendValue = "35000000000000000";
      beforeEach(async function () {
        // deploy fundMe Contract
        // const accounts = await ethers.getSigners();
        // account[0] is the deployer's account
        deployer = (await getNamedAccounts()).deployer;
        // deploys all scripts with tags as 'all'

        await deployments.fixture(["all"]);
        //get main contract
        fundMe = await ethers.getContract("FundMe", deployer);
        //get mockV3agg contract
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        );
      });
      describe("constructor", async function () {
        it("sets the aggregator address correctly", async function () {
          const response = await fundMe.getPriceFeed();

          //fundMe.priceFeed is the same V3Interface contract that we deploy first(00-deploy) and set equal to priceFeed
          assert.equal(response, mockV3Aggregator.address);
        });
      });
      describe("fund", async function () {
        it("Fails if you didn't send enough ETH", async function () {
          // if fundme reverts it need to be reverted with same text as mentioned in test here
          await expect(fundMe.fund()).to.be.revertedWith(
            "ETH is less than worth of 50 dollars USD"
          );
        });
        it("update the respective data structures with the amount funded", async function () {
          await fundMe.fund({ value: sendValue });

          const response = await fundMe.getAddressToAmount(deployer);
          assert.equal(response.toString(), sendValue);
        });
        it("Add funder to array of funders", async function () {
          await fundMe.fund({ value: sendValue });
          const funder = await fundMe.getFunder(0);
          assert.equal(funder, deployer);
        });
      });
      describe("withdraw", async function () {
        beforeEach(async function () {
          // amount gets funded using deployer account i.e, accounts[0]
          await fundMe.fund({ value: sendValue });
        });
        it("withdraw ETH(funds) by the single funder", async function () {
          // starting fundMe contract balance
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          // get the starting balance of the deployer
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          const txResponse = await fundMe.withdraw();
          // when withdraw gets called it adds the amount from contract to the deployer account
          const txReceipt = await txResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = txReceipt;
          const gasCost = gasUsed * effectiveGasPrice;
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          //check|assert
          assert.equal(
            endingDeployerBalance
              .sub(startingDeployerBalance)
              .add(gasCost)
              .toString(),
            startingFundMeBalance.toString()
            // when we first add balance to the contract from deployer account some gas is used so for equality check we have to add that gas cost back
          );
          assert.equal(endingFundMeBalance, 0);
        });
        it("withdraw ETH(funds) by multiple funds", async function () {
          // Arrange
          const accounts = await ethers.getSigners();

          // account[0] is the deployer's account
          for (let i = 1; i < 6; i++) {
            // basically we are calling fundMe and sending funds with different accounts
            const fundMeConnectedContract = await fundMe.connect(accounts[i]);
            await fundMeConnectedContract.fund({ value: sendValue });
          }

          // starting fundMe contract balance
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          // get the starting balance of the deployer(here deployer is accounts[0])
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          // withdraw the funds
          const txResponse = await fundMe.withdraw();
          // when withdraw gets called it adds the amount from contract to the deployer account
          const txReceipt = await txResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = txReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          //check|assert
          assert.equal(
            endingDeployerBalance
              .sub(startingDeployerBalance)
              .add(gasCost)
              .toString(),
            startingFundMeBalance.toString()
            // when we first add balance to the contract from deployer account some gas is used so for equality check we have to add that gas cost back
          );
          assert.equal(endingFundMeBalance, 0);

          //check funders array should be empty
          await expect(fundMe.getFunder(0)).to.be.reverted;

          // make sure that funders map is resetted properly

          for (let i = 1; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmount(accounts[i].address),
              0
            );
          }
        });
        it("only owner should withdraw", async function () {
          const accounts = await ethers.getSigners();
          const attacker = accounts[1];
          const attackerConnectedContract = await fundMe.connect(attacker);
          await expect(
            attackerConnectedContract.withdraw()
          ).to.be.revertedWithCustomError(fundMe, "FundMe__notOwner");
        });
        it("Cheaper-withdraw testing ...", async function () {
          // Arrange
          const accounts = await ethers.getSigners();

          // account[0] is the deployer's account
          for (let i = 1; i < 6; i++) {
            // basically we are calling fundMe and sending funds with different accounts
            const fundMeConnectedContract = await fundMe.connect(accounts[i]);
            await fundMeConnectedContract.fund({ value: sendValue });
          }

          // starting fundMe contract balance
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          // get the starting balance of the deployer(here deployer is accounts[0])
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          // withdraw the funds
          const txResponse = await fundMe.cheaperWithdraw();
          // when withdraw gets called it adds the amount from contract to the deployer account
          const txReceipt = await txResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = txReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          //check|assert
          assert.equal(
            endingDeployerBalance
              .sub(startingDeployerBalance)
              .add(gasCost)
              .toString(),
            startingFundMeBalance.toString()
            // when we first add balance to the contract from deployer account some gas is used so for equality check we have to add that gas cost back
          );
          assert.equal(endingFundMeBalance, 0);

          //check funders array should be empty
          await expect(fundMe.getFunder(0)).to.be.reverted;

          // make sure that funders map is resetted properly

          for (let i = 1; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmount(accounts[i].address),
              0
            );
          }
        });
      });
    });
