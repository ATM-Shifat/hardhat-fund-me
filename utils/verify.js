const { run } = requie("hardhat")

const verify = async (contractAddress, args) => {
    console.log("Verifying contract.....")

    try {
        await run("verify: veify", {
            address: contractAddress,
            constractorArguments: args
        })
    } catch (e) {
        if ((e, message.toLowerCase().includes("already vaerified"))) {
            console.log("Already vaerified")
        } else {
            console.log(e)
        }
    }
}

module.exports = { verify }
