// function deployFunc() {
//     console.log("deploy")
// }
// module.exports = deployFunc

// module.exports = async (hre) => {
//     const { getNameAccounts, deployment } = hre
// }
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")

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

    const FunMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress],
        log: true
    })
    log("__________________________________")
}

module.exports.tags = ["all", "fundme"]
