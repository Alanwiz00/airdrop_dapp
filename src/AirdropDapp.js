import React, { useReducer } from "react";
import { useEffect, useState } from "react";
import Timer from "./util/Timer";

import {
  airdropDappContract,
  connectWallet,
  claimAirdrop,
  getCurrentWalletConnected,
  fetchEligibleAddresses,
} from "./util/interact.js";

const AirdropDapp = () => {
  //set variables
  const [walletAddress, setWallet] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("No connection to the network."); //default message
  const [isClaimActive, setIsClaimActive] = useState(false);
  const [amountToClaim, setAmountToClaim] = useState(0);
  const [isEligible, setIsEligible] = useState(false);
  const [eligibleAddresses, setEligibleAddresses] = useState([]);
  const claimPeriodEnd = 1720390808;
  const claimPeriodStart= 1718323440;
  
  //called only once
  useEffect(async () => {
    async function fetchMessage() {
      const message = await claimAirdrop();
      setMessage(message);
    }
    fetchMessage();   
    addSmartContractListener();

    async function fetchWallet() {
      const {address, status} = await getCurrentWalletConnected();
      setWallet(address);
      setStatus(status);
    }
    fetchWallet();
    addWalletListener();
  }, []);

  useEffect(() => {
    const now = Math.floor(Date.now() / 1000);
    setIsClaimActive(now >= claimPeriodStart && now <= claimPeriodEnd);
  }, [claimPeriodStart, claimPeriodEnd]);

  useEffect(() => {
    if (walletAddress) {
      const user = eligibleAddresses.find(
        (user) => user.address === walletAddress.toLowerCase()
      );
      if (user) {
        setIsEligible(true);
        setAmountToClaim(user.amount);
      } else {
        setIsEligible(false);
        setAmountToClaim(0);
      }
    }
  }, [walletAddress, eligibleAddresses]);

  useEffect(() => {
    const getEligibleAddresses = async () => {
      const addresses = await fetchEligibleAddresses();
      console.log("Fetched Eligible Address:", addresses)
      setEligibleAddresses(addresses);
    };

    getEligibleAddresses();
  }, []);

  useEffect(() => {
    if (walletAddress) {
      const user = eligibleAddresses.find(
        (user) => user.address === walletAddress.toLowerCase()
      );
      if (user) {
        setIsEligible(true);
        setAmountToClaim(user.amount);
      } else {
        setIsEligible(false);
        setAmountToClaim(0);
      }
    }
  }, [walletAddress, eligibleAddresses]);

  function addSmartContractListener() { airdropDappContract.events.TokensClaimed({}, (error, data) => {
    if (error) {
      setStatus("😥 " + error.message);
    } else {
      setStatus("🎉 Token Claimed");
      }
    });
  }

  function addWalletListener() { 
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
        } else {
          setWallet("");
          setStatus("🦊 Connect to Metamask using the top right button.");
        }
      });
    } else {
      setStatus(
        <p>
          {" "}
          🦊{" "}
          <a target="_blank" href={`https://metamask.io/download`}>
            You must install Metamask, a virtual Ethereum wallet, in your  browser.
          </a>
        </p>
      );
    }
  }  
    
  const connectWalletPressed = async () => { 
    const walletResponse = await connectWallet();
    setStatus(walletResponse.status);
    setWallet(walletResponse.address);
  };
    
  const onClaimPressed = async () => {
    if(isClaimActive) {
      const { status } = await claimAirdrop(walletAddress);
      setStatus(status);
    }
  };

return (
  <div id ="container">
    <img></img>
    <button id="walletButton" onClick={connectWalletPressed}>
      {walletAddress.length > 0 ? (
      "Connect: "+
      String(walletAddress).substring(0,6) +
      "..." +
      String(walletAddress).substring(38)
      ) : (
      <span>Connect Wallet</span>
      )}
    </button>
      
    <h1>It's</h1>
    <h1>GIB</h1>
    <h1>TIME</h1>
    <h3>{claimPeriodEnd ? 'Claim Starts' : 'Claim Ends' }</h3>
    <Timer claimPeriodStart={claimPeriodStart} claimPeriodEnd={claimPeriodEnd}/>
    <p id="status">{status}</p>
    {walletAddress ? (
      <div>
        <p>wallet Address: {walletAddress}</p>
        {isEligible ? (
          <h2>🎉Congrats!!! Claim {amountToClaim} $GIBISBIG</h2>
        ) : (
          <h2>😢YOU DEFINITELY GET WHAT YOU GIB</h2>
        )}
        <button id="publish" onClick={onClaimPressed} disabled={!isClaimActive || !isEligible}>
          {isClaimActive ? "" : ""}
          {isEligible? "GIB IS BIG" : ' NOT ELIGIBLE'}
        </button>
      </div>
    ) :(
      <button id="walletButton" onClick={connectWalletPressed}>Connect Wallet</button>
    )}
  </div>
  );
}

export default AirdropDapp;