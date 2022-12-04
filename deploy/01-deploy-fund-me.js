// function deployFunc() {
//     console.log("deploy")
// }
// module.exports = deployFunc

// module.exports = async (hre) => {
//     const { getNameAccounts, deployment } = hre
// }

module.exports = async ({ getNameAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNameAccounts()

    const chainId = networks.config.chainId
}
