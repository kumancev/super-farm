import React, { useContext } from 'react'

export const UserContext = React.createContext({
    userAddress: "",
    setUserAddress: () => [],
    ethBalance: "",
    setEthBalance: () => {},
    daiBalance: "",
    setDaiBalance: () => {},
    superBalance: "",
    setSuperBalance: () => {},
    stakingBalance: "",
    setStakingBalance: () => {},
    superYield: "",
    setSuperYield: () => {},
    superUnrealizedYield: "",
    setSuperUnrealizedYield: () => {},
})

export const UserProvider = UserContext.Provider
export const useUser = () => useContext(UserContext)