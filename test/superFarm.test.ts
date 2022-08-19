import { ethers } from "hardhat";
import chai, { expect } from "chai";
import { solidity } from "ethereum-waffle"
import { Contract, BigNumber } from "ethers"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { time } from "@openzeppelin/test-helpers";

chai.use(solidity)

describe("SuperFarm Contract", () => {
    
    let res: any;
    let owner: SignerWithAddress;
    let alice: SignerWithAddress;
    let bob: SignerWithAddress;
    let carol: SignerWithAddress;
    let dave: SignerWithAddress;
    let eve: SignerWithAddress;
    let superFarm: Contract;
    let mockDai: Contract;
    let superToken: Contract;
    const daiAmount: BigNumber = ethers.utils.parseEther("25000");

    before(async() => {
        const SuperFarm = await ethers.getContractFactory("SuperFarm");
        const MockDai = await ethers.getContractFactory("MockERC20");
        const SuperToken = await ethers.getContractFactory("SuperToken");
        [owner, alice, bob, carol, dave, eve] = await ethers.getSigners();
        mockDai = await MockDai.deploy("MockDai", "mDAI");
        superToken =  await SuperToken.deploy();
    
        
        // Dai Transfers     
        await Promise.all([
            mockDai.mint(owner.address, daiAmount),
            mockDai.mint(alice.address, daiAmount),
            mockDai.mint(bob.address, daiAmount),
            mockDai.mint(carol.address, daiAmount),
            mockDai.mint(dave.address, daiAmount),
            mockDai.mint(eve.address, daiAmount)
        ])

        // superFarm Contract deployment
        superFarm = await SuperFarm.deploy(mockDai.address, superToken.address);
    })

    describe("Init", async() => {
        it("should deploy contracts", async() => {
            expect(superFarm).to.be.ok
            expect(superToken).to.be.ok
            expect(mockDai).to.be.ok
        })
        it("should return name", async() => {
            expect(await superFarm.name())
                .to.eq("SuperFarm")
            expect(await mockDai.name())
                .to.eq("MockDai")
            expect(await superToken.name())
                .to.eq("SuperToken")
        })
        it("should show mockDai balance", async() => {
            expect(await mockDai.balanceOf(owner.address))
                .to.eq(daiAmount)
        })
    })

    describe("Staking", async() => {
        it("should stake and update mapping", async() => {
            let toTransfer = ethers.utils.parseEther("100")
            await mockDai.connect(alice).approve(superFarm.address, toTransfer)
            expect(await superFarm.isStaking(alice.address))
                .to.eq(false)
            
            expect(await superFarm.connect(alice).stake(toTransfer))
                .to.be.ok
            expect(await superFarm.stakingBalance(alice.address))
                .to.eq(toTransfer)
            
            expect(await superFarm.isStaking(alice.address))
                .to.eq(true)
        })
        it("should remove dai from user", async() => {
            res = await mockDai.balanceOf(alice.address)
            expect(Number(res))
                .to.be.lessThan(Number(daiAmount))
        })
        it("should update balance with multiple stakes", async() => {
            let toTransfer = ethers.utils.parseEther("100")
            await mockDai.connect(eve).approve(superFarm.address, toTransfer)
            await superFarm.connect(eve).stake(toTransfer)
            
        })
        it("should revert stake with zero as staked amount", async() => {
            await expect(superFarm.connect(bob).stake(0))
                .to.be.revertedWith("You cannot stake zero tokens")
        })
        it("should revert stake without allowance", async() => {
            let toTransfer = ethers.utils.parseEther("50")
            await expect(superFarm.connect(bob).stake(toTransfer))
                .to.be.revertedWith("ERC20: insufficient allowance")
        })
        it("should revert with not enough funds", async() => {
            let toTransfer = ethers.utils.parseEther("1000000")
            await mockDai.approve(superFarm.address, toTransfer)
            await expect(superFarm.connect(bob).stake(toTransfer))
                .to.be.revertedWith("You cannot stake zero tokens")
        })
    })

    describe("Unstaking", async() => {
        it("should unstake balance from user", async() => {
            res = await superFarm.stakingBalance(alice.address)
            expect(Number(res))
                .to.be.greaterThan(0)
            let toTransfer = ethers.utils.parseEther("100")
            await superFarm.connect(alice).unstake(toTransfer)
            res = await superFarm.stakingBalance(alice.address)
            expect(Number(res))
                .to.eq(0)
        })
        it("should remove staking status", async() => {
            expect(await superFarm.isStaking(alice.address))
                .to.eq(false)
        })
        it("should transfer ownership", async() => {
            expect(await superToken.owner())
                .to.eq(owner.address)
            await superToken.transferOwnership(superFarm.address)
            expect(await superToken.owner())
                .to.eq(superFarm.address)
        })
    })
})

