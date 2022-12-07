// function deployFunc() {
//     console.log("deploy")
// }
// module.exports = deployFunc

// module.exports = async (hre) => {
//     const { getNameAccounts, deployment } = hre
// }
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    // address = "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e"
    const chainId = network.config.chainId

    // const ethUsdPriceFeedAddress = networkConfig[chainId]["ehtUsdPriceFeed"]

    let ethUsdPriceFeedAddress

    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ehtUsdPriceFeed"]
    }
    const args = [ethUsdPriceFeedAddress]
    const FundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmation: network.config.blockConfirmations || 1
    })

    // if (
    //     !developmentChains.includes(network.name) &&
    //     process.env.ETHERSCAN_API_KEY
    // ) {
    //     await verify(FundMe.address, args)
    // }
}

module.exports.tags = ["all", "fundme"]
