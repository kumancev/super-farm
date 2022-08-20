import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { ethers } from "ethers"

import SuperFarm from "./abis/SuperFarm.json"
import SuperToken from "./abis/SuperToken.json"
import ERC20 from "./abis/ERC20.json"

import { UserProvider } from "./context/UserContext"
import { ContractProvider } from "./context/ContractContext"

import Main from "./components/Main";

const Container = styled.div`
    width: 100%;
    height: 75rem;
`;

function App() {
    
    /**
     * @notice User state
     */
    const [userAddress, setUserAddress] = useState("")
    const [ethBalance, setEthBalance] = useState("")
    const [daiBalance, setDaiBalance] = useState("")
    const [superBalance, setSuperBalance] = useState("")
    const [stakingBalance, setStakingBalance] = useState("")
    const [superYield, setSuperYield] = useState("")
    const [superUnrealizedYield, setSuperUnrealizedYield] = useState("")
    
    const isConnected = Boolean(userAddress);
    
    async function connectAccount() {
        if (window.ethereum) {
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
          setUserAddress(accounts.toString());
        }
    }
    
    const userState = {
        userAddress, 
        setUserAddress,
        ethBalance, 
        setEthBalance,
        daiBalance,
        setDaiBalance,
        superBalance,
        setSuperBalance,
        stakingBalance,
        setStakingBalance,
        superYield,
        setSuperYield,
        superUnrealizedYield,
        setSuperUnrealizedYield,
    }

    /**
     * @notice Contract state
     */
    const [init, setInit] = useState(false)
    const [networkId, setNetworkId] = useState("")
    const [provider, setProvider] = useState({})
    const [daiContract, setDaiContract] = useState({})
    const [linkContract, setLinkContract] = useState({})
    const [superTokenContract, setSuperTokenContract] = useState({})
    const [superFarmContract, setSuperFarmContract] = useState({})

    const contractState = {
        init,
        setInit,
        networkId,
        setNetworkId,
        provider,
        setProvider,
        daiContract,
        setDaiContract,
        linkContract,
        setLinkContract,
        superTokenContract,
        setSuperTokenContract,
        superFarmContract,
        setSuperFarmContract,
    }

    /**
     * @notice componentDidMount
     */

    const loadProvider = useCallback(async() => {
        let prov = new ethers.providers.Web3Provider(window.ethereum)
        setProvider(prov)
        return prov
    }, [setProvider])

    const loadDaiContract = useCallback(async(_provider) => {
        let daiAddress = "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa" 
        let contract = new ethers.Contract(daiAddress, ERC20.abi, _provider)
        setDaiContract(contract)
    }, [setDaiContract])

    const loadSuperToken = useCallback(async(_provider) => {
        let superTokenAddress = "0x55a321Ca20AbBec3ffb13B3BbaEEfD8FC570cF1B"
        let contract = new ethers.Contract(superTokenAddress, SuperToken.abi, _provider)
        setSuperTokenContract(contract)
    }, [setSuperTokenContract])

    const loadSuperFarmContract = useCallback(async(_provider) => {
        let pmknFarmAddress = "0x5622755dd11369f6418757Cdb9aa630c4a786331"
        let contract = new ethers.Contract(pmknFarmAddress, SuperFarm.abi, _provider)
        setSuperFarmContract(contract)
    }, [setSuperFarmContract])

    const componentDidMount = useCallback(async() => {
    	await loadProvider().then(async(res) => {
            await loadDaiContract(res)
            await loadSuperToken(res)
            await loadSuperFarmContract(res)
        })
        setInit(true)
    }, [
        loadProvider, 
        loadDaiContract, 
        loadSuperToken, 
        loadSuperFarmContract, 
        setInit
    ])

    useEffect(() => {
    	try {
    		if(init === false){
    			componentDidMount()
    		  }
    	} catch (error) {
    		console.log(error)
    	}
    }, [componentDidMount, daiContract, init])

    /**
     * @notice userDidMount functions
     */

    const loadNetwork = useCallback(async() => {
        let netId = await provider.getNetwork()
        setNetworkId(netId["name"])
    }, [provider, setNetworkId])

    const loadEthBalance = useCallback(async(user) => {
        let balance = await provider.getBalance(user)
        setEthBalance(balance)
    }, [provider, setEthBalance])

    const loadDaiBalance = useCallback(async(user) => {
        let balance = await daiContract.balanceOf(user)
        setDaiBalance(balance.toString())
    }, [daiContract, setDaiBalance])

    const loadSuperBalance = useCallback(async(user) => {
        let balance = await superTokenContract.balanceOf(user)
        setSuperBalance(balance.toString())
    }, [superTokenContract, setSuperBalance])

    const loadStakingBalance = useCallback(async(user) => {
        let balance = await superFarmContract.stakingBalance(user)
        setStakingBalance(balance.toString())
    }, [setStakingBalance, superFarmContract])

    const loadSuperYield = useCallback(async(user) => {
        let balance = await superFarmContract.calculateYieldTotal(user)
        setSuperYield(balance.toString())
    }, [setSuperYield, superFarmContract])

    const loadSuperUnrealizedYield = useCallback(async(user) => {
        let balance = await superFarmContract.pmknBalance(user)
        setSuperUnrealizedYield(balance.toString())
    }, [setSuperUnrealizedYield, superFarmContract])


    const userDidMount = useCallback(async() => {
    	try{
    			
    			loadEthBalance(userAddress)
    			loadDaiBalance(userAddress)
    			loadSuperBalance(userAddress)
    			loadStakingBalance(userAddress)
    			loadSuperYield(userAddress)
    			loadSuperUnrealizedYield(userAddress)
    	
    	} catch(error) {
    		console.log(error)
    	}
        await loadNetwork()
    }, [ 
        userAddress,
        loadNetwork, 
        loadEthBalance, 
        loadDaiBalance,
        loadSuperBalance,
        loadStakingBalance,
        setUserAddress,
        loadSuperYield,
        loadSuperUnrealizedYield
    ])

    useEffect(() => {
        if(userAddress === "" && init === true){
            userDidMount()
        }
    }, [userDidMount, init, userAddress])

  
    /**
    * @notice Events ----------------------------------------->
    */

    useEffect(() => {
        if(userAddress !== ""){
        /**
         * @notice PmknFarm Events
         */
            superFarmContract.on("Stake", async(userAddress) => {
                await loadDaiBalance(userAddress)
                await loadStakingBalance(userAddress)
            });

            superFarmContract.on("Unstake", async(userAddress) => {
                await loadDaiBalance(userAddress)
                await loadStakingBalance(userAddress)
            })

            superFarmContract.on("YieldWithdraw", async(userAddress) => {
                await loadSuperUnrealizedYield(userAddress)
                await loadSuperYield(userAddress)
                await loadSuperBalance(userAddress)
            })
        }

    /**
     * @notice Updates Super yield balance every 20 seconds
     */

    if(stakingBalance > 0){
        let interval = null
        interval = setInterval(() => {
            loadSuperYield(userAddress)
        }, 20000)
    return () => clearInterval(interval)
    }

    }, [
        superFarmContract, 
        userAddress, 
        stakingBalance,
        loadDaiBalance, 
        loadStakingBalance,
        loadSuperUnrealizedYield,
        loadSuperYield,
        loadSuperBalance,
    ])

    return (
        <Container>
          <ContractProvider value={contractState}>
            <UserProvider value={userState}>
              	<Main connectAccount={connectAccount} isConnected={isConnected} />
            </UserProvider>
          </ContractProvider>
        </Container>
      );
    }

export default App;