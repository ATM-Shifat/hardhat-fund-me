const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")

describe("FundMe", function() {
    let fundMe
    let deployer
    let mockV3Aggregator
    const sendValue = ethers.utils.parseEther("1")
    beforeEach(async function() {
        //deploy the fundMe contract
        //using the hardhat-deploy

        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        )
        // const accounts = await ethers.getSigners()
        // const accountZero = accounts[0]
        // await deployments.fixture(["all"])
        // fundMe = await ethers.getContract("FundMe", accountZero)
        // mockV3Aggregator = await ethers.getContract(
        //     "MockV3Aggregator",
        //     accountZero
        // )
    })

    describe("constructor", function() {
        it("sets the aggreator addresses correctly", async function() {
            const response = await fundMe.s_priceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })
    })

    describe("fund", function() {
        it("Fails if one does not send enough funds", async function() {
            await expect(fundMe.fund()).to.be.revertedWith(
                "Didn't send enough ether"
            )
        })
        it("Updates the amount funded in the data structure", async function() {
            await fundMe.fund({ value: sendValue })

            const amount = await fundMe.s_addressToAmount(deployer)
            assert.equal(amount.toString(), sendValue.toString())
        })
        it("Adds funder to the array", async function() {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.s_funders(0)
            assert.equal(deployer, response)
        })
    })

    describe("withdraw", function() {
        beforeEach(async function() {
            await fundMe.fund({ value: sendValue })
        })

        it("Withdraws ETH from a single funder", async function() {
            //Arrange
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            //Act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)

            const gasCost = transactionReceipt.gasUsed.mul(
                transactionReceipt.effectiveGasPrice
            )

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            //assert
            assert.equal(endingFundMeBalance.toString(), "0")
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            )
        })

        it("Withdraws with multiple account", async () => {
            //Arrange
            const accounts = await ethers.getSigners()
            for (let i = 1; i < 6; i++) {
                const fundMeConnectContract = await fundMe.connect(accounts[i])
                await fundMeConnectContract.fund({ value: sendValue })
            }

            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )

            //Act
            //await fundMe.connect(deployer)

            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)

            const gasCost = transactionReceipt.gasUsed.mul(
                transactionReceipt.effectiveGasPrice
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            //Assert

            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            )
            //s_funders are reser properly
            await expect(fundMe.s_funders(0)).to.be.reverted

            for (i = 1; i < 6; i++) {
                assert(fundMe.s_addressToAmount(accounts[i]), 0)
            }
        })

        it("Only allows the owner to withdraw", async () => {
            const accounts = await ethers.getSigners()
            const attacker = accounts[2]
            const attackerConnectedContract = await fundMe.connect(attacker)

            await expect(
                attackerConnectedContract.withdraw()
            ).to.be.revertedWithCustomError(fundMe, "FundMe_NotOwner")
        })
    })
})
