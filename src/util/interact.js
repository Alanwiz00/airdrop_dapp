import addressList from "./proof/addressList.json"
import proofList from "./proof/proofs.json"
const ethers = require('ethers');
const alchemyKey = "wss://eth-sepolia.g.alchemy.com/v2/snMDVX1MDtnuGO85MQX65rPXlyF9XPlL"
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey); 
const contractABI = require("../contract-abi.json");
const contractAddress = "0x951158396e0585373e73308CBFd10326B247eCBd";


export const airdropDappContract = new web3.eth.Contract(
  contractABI,
  contractAddress
);

export const loadCurrentTimer = async () => { 
  const claimEnd = await airdropDappContract.claimPeriodEnd();
  return(claimEnd.toNumber());
};

export const connectWallet = async () => {
    if (window.ethereum) {
        try {
          const addressArray = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          const obj = {
            address: addressArray[0],
            status: "",
          };
          return obj;
        } catch (err) {
          return {
            address: "",
            status: "😥 " + err.message,
          };
        }
      } else {
        return {
          address: "",
          status: (
            <span>
              <p>
                {" "}
                🦊{" "}
                <a target="_blank" href={`https://metamask.io/download`}>
                  You must install Metamask, a virtual Ethereum wallet, in your
                  browser.
                </a>
              </p>
            </span>
          ),
        };
    }
};

export const disconnectWallet = async () => {
  if (window.ethereum) {
    try {
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [
          {
            eth_accounts: {},
          },
        ],
      });
    } catch (err) {
      console.error(err);
    }
  }
};

export const switchNetwork = async () => {
  if (window.ethereum) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xAA36A7" }], // Sepolia chain ID
      });
    } catch (err) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (err.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0xAA36A7",
                chainName: "Sepolia Test Network",
                rpcUrls: ["https://rpc.sepolia.org"],
                nativeCurrency: {
                  name: "Sepolia Ether",
                  symbol: "SEP",
                  decimals: 18,
                },
              },
            ],
          });
        } catch (addError) {
          console.error(addError);
        }
      }
      console.error(err);
    }
  }
};

export const getCurrentWalletConnected = async () => {
    if (window.ethereum) {
        try {
          const addressArray = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (addressArray.length > 0) {
            return {
              address: addressArray[0],
              status: "connected",
            };
          } else {
            return {
              address: "",
              status: "🦊 Connect to Metamask using the top right button.",
            };
          }
        } catch (err) {
          return {
            address: "",
            status: "😥 " + err.message,
          };
        }
    } else {
        return {
          address: "",
          status: (
            <span>
              <p>
                {" "}
                🦊{" "}
                <a target="_blank" href={`https://metamask.io/download`}>
                  You must install Metamask, a virtual Ethereum wallet, in your
                  browser.
                </a>
              </p>
            </span>
          ),
        };
    }
};

export const fetchEligibleAddresses = async () => {
  try {
    return addressList;
  } catch (error){
    console.error('Error fetching eligible addresses:', error);
    return [];
  }
};

export const claimAirdrop = async () => {
  const { address } = await getCurrentWalletConnected();
  if (!window.ethereum || address === null) {
    return {
      status:
        "💡 Connect your Metamask wallet to claim your tokens",
    };
  }

  const user = proofList.find(
    (user) => user.address.toLowerCase());

  if (!user) {
    return {
      status: "😢YOU DEFINITELY GET WHAT YOU GIB"
    };
  }

  const amount = user.amount; // Adjust decimals as necessary
  console.log('amount:', amount);
  // Generate the proof for the user's claim
  const proof = user.proof;

  console.log("Address:", address);
  console.log("User:", user);


  //set up transaction parameters
  const transactionParameters = {
    to: contractAddress, // Required except during contract publications.
    from: address, // must match user's active address.
    data: airdropDappContract.methods.claim(proof, amount).encodeABI(),
  };

  console.log("Transaction Parameters:", transactionParameters);


  //sign the transaction
  try {
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });
    return {
      status: (
        <span>
        ✅{" "}
        <a target="_blank" href={`https://sepolia.etherscan.io/tx/${txHash}`}>
            View the status of your transaction on Etherscan!
        </a>
        <br />
        Airdrop claimed!!! Add token to your wallet
        </span>
        ),
      };
  } catch (error) {
    return {
    status: "😥 " + error.message,
    };
  }
};