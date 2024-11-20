import { useEffect, useState } from "react";
import Timer from "./util/Timer";

import {
  airdropDappContract,
  connectWallet,
  disconnectWallet,
  claimAirdrop,
  getCurrentWalletConnected,
  fetchEligibleAddresses,
  switchNetwork,
} from "./util/interact.js";

const AirdropDapp = () => {
  const [walletAddress, setWallet] = useState("");
  const [status, setStatus] = useState("");
  const [isClaimActive, setIsClaimActive] = useState(false);
  const [amountToClaim, setAmountToClaim] = useState(0);
  const [isEligible, setIsEligible] = useState(false);
  const [eligibleAddresses, setEligibleAddresses] = useState([]);
  const [step, setStep] = useState(1);
  const claimPeriodEnd = 1722395225;
  const claimPeriodStart= 1719893366;
  
  //called only once
  useEffect(() => {
    async function fetchInitialData() {
      const { address, status } = await getCurrentWalletConnected();
      setWallet(address);
      setStatus(status);

      const addresses = await fetchEligibleAddresses();
      setEligibleAddresses(addresses);

      if (address) {
        await switchNetwork();
      }
    }

    fetchInitialData();
    addSmartContractListener();
    addWalletListener();
  }, []);

  useEffect(() => {
    const now = Math.floor(Date.now() / 1000);
    setIsClaimActive(now >= claimPeriodStart && now <= claimPeriodEnd);
  }, [claimPeriodStart, claimPeriodEnd]);

  useEffect(() => {
    if (walletAddress && eligibleAddresses.length > 0) {
      const user = eligibleAddresses.find(
        (user) => user.address && walletAddress && user.address.toLowerCase() === walletAddress.toLowerCase()
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

  function addSmartContractListener() { 
    airdropDappContract.events.TokensClaimed({}, (error, data) => {
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
          <a target="_blank" rel="noreferrer" href={`https://metamask.io/download`}>
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
    await switchNetwork();
  };

  const disconnectWalletPressed = async () => {
    await disconnectWallet();
    setWallet("");
    setStatus("Wallet disconnected");
  }
    
  const onClaimPressed = async () => {
    if(isClaimActive) {
      const { status } = await claimAirdrop(walletAddress);
      setStatus(status);
    }
  };

  const getButtonText = () => {
    if (!walletAddress) return "Connect Wallet";
    if (!isEligible) return "NOT ELIGIBLE";
    if (!isClaimActive) return (
      <span>
      Claim Starts: <Timer claimPeriodStart={claimPeriodStart}/>
      </span>
    );
    return step === 1 ? `Claim ${amountToClaim} $GIBISBIG` : "GIBISBIG";
  };

  const handleButtonClick = () => {
    if (step === 1) {
      setStep(2);
    } else {
      onClaimPressed();
    }
  };

  const getButtonDisabledStatus = () => {
    if (!walletAddress || !isEligible || (step === 2 && !isClaimActive)) return true;
    return false;
  };

return (
  <div id ="container">
    <img alt="" />
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
    {walletAddress && (
      <button id="disconnectButton" onClick={disconnectWalletPressed}>
        Disconnect Wallet
      </button>
    )}
      
    <h1>It's</h1>
    <h1>GIB</h1>
    <h1>TIME</h1>
    <h3>{isClaimActive ? 'Claim Ends' : 'Claim Starts' }</h3>
    <Timer claimPeriodStart={claimPeriodStart} claimPeriodEnd={claimPeriodEnd}/>
    <p id="status">{status}</p>
    {walletAddress ? (
      <div>
        {isEligible ? (
          <div>
            <h2>🎉Congrats!!! Claim {amountToClaim} $GIBISBIG</h2>
            <button 
              id="publish"
              onClick={handleButtonClick}
              disabled={getButtonDisabledStatus()}
            >
            {getButtonText()}
            </button>
          </div>
        ) : (
          <h2>😢YOU DEFINITELY GET WHAT YOU GIB</h2>
        )}
      </div>
    ) :(
      <button id="walletButton" onClick={connectWalletPressed}>Connect Wallet To Claim</button>
    )}
  </div>
  );
}

export default AirdropDapp;