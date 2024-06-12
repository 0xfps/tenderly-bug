const { Tenderly, Network } = require("@tenderly/sdk")
const dotenv = require("dotenv")
const config = require("./config.json")
const { ethers } = require("ethers")

dotenv.config()

const TENDERLY_USER = process.env.NEXT_PUBLIC_USER
const TENDERLY_TOKEN = process.env.NEXT_PUBLIC_TOKEN
const TENDERLY_PROJECT = process.env.NEXT_PUBLIC_PROJECT
const DUMMY_ETH_ADDRESS = "0x0000000000000000000000000000000000000012"
const amount = 100e6
const currentAddress = "0x5e078E6b545cF88aBD5BB58d27488eF8BE0D2593"

async function simulate() {
    const tenderlyBaseChainInstance = new Tenderly({
        accountName: TENDERLY_USER,
        projectName: TENDERLY_PROJECT,
        accessKey: TENDERLY_TOKEN,
        network: Network.AVALANCHE // Replace with the appropriate network
    });

    const deploymentCategory = "main"
    const { address, abi } = config.mainnet[deploymentCategory].tradableStakingVault
    const from = config.mainnet[deploymentCategory].tradableMessageAdapter.address
    const rpc = "https://avalanche-c-chain-rpc.publicnode.com"
    const provider = new ethers.JsonRpcProvider(rpc)
    const StakingVaultContract = new ethers.Contract(address, abi, provider)

    const tokenInfo = {
        token: DUMMY_ETH_ADDRESS,
        decimals: 6,
        isActive: true
    }

    const { data: simulationData } = await StakingVaultContract.marginAccountDeposit.populateTransaction(
        currentAddress,
        tokenInfo,
        amount
    )

    console.log(tenderlyBaseChainInstance)

    const simulation = await tenderlyBaseChainInstance.simulator.simulateTransaction({
        transaction: {
            from,
            to: address,
            gas: 20000000,
            gas_price: '19419609232',
            value: 0,
            input: simulationData
        },
        blockNumber: (await provider.getBlockNumber()) + 5
    })

    console.log(simulation)
    return true
}


simulate().then(function (data) {
    console.log(data)
}).catch(function (error) {
    console.log(error)
})