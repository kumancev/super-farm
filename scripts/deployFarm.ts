import { ethers } from "hardhat";

const kDAI = "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa";

const main = async() => {
    const [deployer] = await ethers.getSigners()
    console.log(`Deploying contracts with ${deployer.address}`);

    // const MockERC20 = await ethers.getContractFactory("MockERC20")
    // const mockDai = await MockERC20.deploy("MockDai", "mDAI")
    // console.log(`MockDai address: ${mockDai.address}`)

    const SuperToken = await ethers.getContractFactory("SuperToken")
    const superToken = await SuperToken.deploy()
    await superToken.deployed();
    console.log(`SuperToken address: ${superToken.address}`)

    const SuperFarm = await ethers.getContractFactory("SuperFarm")
    const superFarm = await SuperFarm.deploy(kDAI, superToken.address)
    await superFarm.deployed();
    console.log(`SuperFarm address: ${superFarm.address}`)

    await superToken.transferOwnership(superFarm.address)
    console.log(`SuperToken ownership transferred to ${superFarm.address}`)

    // await run('verify:verify', {
    //     address: superToken.address,
    //     contract: 'contracts/SuperToken.sol:SuperToken'
    //   })
    
    // await run('verify:verify', {
    //     address: superFarm.address,
    //     contract: 'contracts/SuperFarm.sol:SuperFarm',
    //     constructorArguments: [kDAI, superToken.address]
    // })
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.log(error)
        process.exit(1)
    })