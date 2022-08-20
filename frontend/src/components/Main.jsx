import React from "react";
import styled from "styled-components";

import NavBar from "./NavBar";
import MainCard from "./MainCard";

import { useContract } from "../context/ContractContext"; 


const Container = styled.div`
    height: 100%;
    width: 100%;
    background-color: #212936;
`;

export default function Main({ connectAccount, isConnected }) {
    
    return(
        <>
        <NavBar connectAccount={connectAccount} isConnected={isConnected} />
        <Container>
            <MainCard />
        </Container>
        </>
    )
}