import React, { useContext } from "react"

export const ContractContext = React.createContext({
    init: "",
    setInit: () => {},
    networkId: "",
    setNetworkId: () => {},
    provider: {},
    setProvider: () => {},
    daiContract: {},
    setDaiContract: () => {},
    linkContract: {},
    setLinkContract: () => {},
    superTokenContract: {},
    setSuperTokenContract: () => {},
    superFarmContract: {},
    setSuperFarmContract: () => {},
})

export const ContractProvider = ContractContext.Provider
export const useContract = () => useContext(ContractContext)