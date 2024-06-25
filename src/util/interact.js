//export const helloWorldContract;
const alchemyKey = "wss://eth-sepolia.g.alchemy.com/v2/snMDVX1MDtnuGO85MQX65rPXlyF9XPlL"
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey); 
const contractABI = require("../contract-abi.json");
const contractAddress = "0x5713E50930B99Fe13c6E2c3a6E15B311b0dB912C";
const addressList = require("./proof/proofs.json");

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

export const getCurrentWalletConnected = async () => {
    if (window.ethereum) {
        try {
          const addressArray = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (addressArray.length > 0) {
            return {
              address: addressArray[0],
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
    const response = await fetch(addressList);
    const data = await response.json();
    return data;
  } catch (error){
    console.error('Error fetching eligible addresses:', error);
    return [];
  }
};

export const claimAirdrop = async (address) => {
  if (!window.ethereum || address === null) {
    return {
      status:
        "💡 Connect your Metamask wallet to claim your tokens",
    };
  }

  //set up transaction parameters
  const transactionParameters = {
    to: contractAddress, // Required except during contract publications.
    from: address, // must match user's active address.
    data: airdropDappContract.methods.claim().encodeABI(),
  };

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