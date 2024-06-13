import React from "react";
import { useEffect, useState } from "react";
import Timer from "./util/Timer";

import {
  airdropDappContract,
  connectWallet,
  claimAirdrop,
  getCurrentWalletConnected,
} from "./util/interact.js";

const AirdropDapp = () => {
  //set variables
  const [walletAddress, setWallet] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("No connection to the network."); //default message
  const claimPeriodEnd = 1720390808;
  
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
    const { status } = await claimAirdrop(walletAddress);
    setStatus(status);
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
    <h3>Time Left:</h3>
    <Timer endTime={claimPeriodEnd}/>
    <p id="status">{status}</p>
    <button id="publish" onClick={onClaimPressed}>GIB IS BIG</button>
  </div>
  );
}

export default AirdropDapp;